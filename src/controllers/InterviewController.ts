import {
  SessionId,
  SessionState,
  InterviewQuestion,
  CandidateResponse,
  InterviewAction,
  InterviewProgress,
  QuestionId,
  UserInteraction,
  ContinuationPrompt,
  ContinuationOptions
} from '../models/types';
import { SessionManager } from '../services/SessionManager';
import { QuestionGenerator } from '../services/QuestionGenerator';
import { ResponseEvaluator } from '../services/ResponseEvaluator';
import { BehaviorClassifier, CommunicationAdapter } from '../services/BehaviorClassifier';
import { FeedbackGenerator } from '../services/FeedbackGenerator';

/**
 * InterviewController manages the interview flow, question progression,
 * and coordinates between various services to conduct the interview
 */
export class InterviewController {
  private sessionManager: SessionManager;
  private questionGenerator: QuestionGenerator;
  private responseEvaluator: ResponseEvaluator;
  private behaviorClassifier: BehaviorClassifier;
  private communicationAdapter: CommunicationAdapter;
  private feedbackGenerator: FeedbackGenerator;

  // Track current question index for each session
  private currentQuestionIndex: Map<SessionId, number>;

  // Track user interactions for behavior classification
  private userInteractions: Map<SessionId, UserInteraction[]>;

  // Timing configuration (in milliseconds)
  private readonly AVERAGE_QUESTION_TIME = 3 * 60 * 1000; // 3 minutes per question

  constructor(
    sessionManager: SessionManager,
    questionGenerator: QuestionGenerator,
    responseEvaluator: ResponseEvaluator,
    behaviorClassifier: BehaviorClassifier,
    feedbackGenerator: FeedbackGenerator
  ) {
    this.sessionManager = sessionManager;
    this.questionGenerator = questionGenerator;
    this.responseEvaluator = responseEvaluator;
    this.behaviorClassifier = behaviorClassifier;
    this.feedbackGenerator = feedbackGenerator;
    this.communicationAdapter = new CommunicationAdapter();
    this.currentQuestionIndex = new Map();
    this.userInteractions = new Map();
  }

  /**
   * Initialize the interview session by generating questions and return first question
   * @param sessionId - ID of the session to initialize
   * @returns First interview question
   */
  initialize(sessionId: SessionId): InterviewQuestion {
    const session = this.sessionManager.getSessionState(sessionId);

    // Generate question set based on role, level, and optional resume
    const questions = this.questionGenerator.generateQuestionSet(
      session.role,
      session.experienceLevel,
      session.resumeAnalysis
    );

    // Update session with generated questions
    this.sessionManager.updateQuestions(sessionId, questions);

    // Initialize question index to 1 (first question already returned)
    this.currentQuestionIndex.set(sessionId, 1);

    // Initialize interactions tracking
    this.userInteractions.set(sessionId, []);

    // Start the interview
    this.sessionManager.startInterview(sessionId);

    // Return first question
    return questions[0];
  }

  /**
   * Get the next question in the interview
   * @param sessionId - ID of the session
   * @returns Next interview question or null if no more questions
   */
  nextQuestion(sessionId: SessionId): InterviewQuestion | null {
    const session = this.sessionManager.getSessionState(sessionId);
    const currentIndex = this.currentQuestionIndex.get(sessionId) || 0;

    // Check if we have more questions
    if (currentIndex >= session.questions.length) {
      return null; // No more questions
    }

    // Get the next question
    const question = session.questions[currentIndex];

    // Increment index for next call
    this.currentQuestionIndex.set(sessionId, currentIndex + 1);

    return question;
  }

  /**
   * Process a candidate's response and determine the next action
   * @param sessionId - ID of the session
   * @param responseInput - The candidate's response (can be CandidateResponse or just text)
   * @returns InterviewAction indicating what to do next
   */
  processResponse(
    sessionId: SessionId,
    responseInput: CandidateResponse | string
  ): InterviewAction {
    const session = this.sessionManager.getSessionState(sessionId);

    // Handle both CandidateResponse object and string input
    let candidateResponse: CandidateResponse;

    if (typeof responseInput === 'string') {
      // Legacy string-based call - need to infer question ID
      const currentIndex = this.currentQuestionIndex.get(sessionId) || 0;
      const currentQuestion = session.questions[currentIndex - 1];

      if (!currentQuestion) {
        return {
          type: 'redirect',
          message: 'No current question to answer. Please start the interview first.'
        };
      }

      candidateResponse = {
        questionId: currentQuestion.id,
        text: responseInput,
        timestamp: Date.now(),
        wordCount: this.countWords(responseInput),
        responseTime: this.calculateResponseTime(session, currentQuestion.id)
      };
    } else {
      candidateResponse = responseInput;
    }

    const questionId = candidateResponse.questionId;

    // Find the question being answered
    const question = session.questions.find(q => q.id === questionId);
    if (!question) {
      return {
        type: 'redirect',
        message: 'Question not found. Please answer the current question.'
      };
    }

    // Store response
    this.sessionManager.addResponse(sessionId, candidateResponse);

    // Record interaction
    this.recordInteraction(sessionId, {
      timestamp: Date.now(),
      type: 'response',
      content: candidateResponse.text
    });

    // Evaluate the response
    const evaluation = this.responseEvaluator.evaluate(question, candidateResponse);

    // Store evaluation
    this.sessionManager.addEvaluation(sessionId, evaluation);

    // Update behavior classification
    this.updateBehaviorClassification(sessionId);

    // Check if response is off-topic (only for very long responses and with high confidence)
    // We want to avoid false positives, so we only check responses over 100 words
    if (candidateResponse.wordCount > 100) {
      const isOffTopic = this.behaviorClassifier.detectOffTopic(candidateResponse, question);

      if (isOffTopic) {
        return {
          type: 'redirect',
          message: 'Your response seems to be off-topic. Please focus on answering the question asked. Let me repeat the question: ' + question.text
        };
      }
    }

    // Determine next action based on evaluation
    if (evaluation.needsFollowUp) {
      // Check if we can generate a follow-up
      const followUp = this.questionGenerator.generateFollowUp(
        question,
        candidateResponse,
        evaluation
      );

      if (followUp) {
        // Add follow-up to questions list
        session.questions.push(followUp);

        // Update the parent question's follow-up count
        question.followUpCount = (question.followUpCount || 0) + 1;

        return {
          type: 'follow-up',
          question: followUp
        };
      }
    }

    // Check if interview should continue
    if (this.shouldContinue(sessionId)) {
      // Get next question
      const nextQ = this.nextQuestion(sessionId);

      if (nextQ) {
        return {
          type: 'next-question',
          question: nextQ
        };
      }
    }

    // No more questions - complete the interview
    return this.completeInterview(sessionId);
  }

  /**
   * Check if the interview should continue
   * @param sessionId - ID of the session
   * @returns true if interview should continue
   */
  shouldContinue(sessionId: SessionId): boolean {
    const session = this.sessionManager.getSessionState(sessionId);
    const currentIndex = this.currentQuestionIndex.get(sessionId) || 0;

    // Continue if we have more questions and session is in progress
    return session.status === 'in-progress' && currentIndex < session.questions.length;
  }

  /**
   * Check if early termination is allowed
   * @param sessionId - ID of the session
   * @returns true if early termination is allowed
   */
  canEndEarly(sessionId: SessionId): boolean {
    const session = this.sessionManager.getSessionState(sessionId);

    // Can end early if interview is in progress and at least one question has been answered
    return session.status === 'in-progress' && session.responses.size > 0;
  }

  /**
   * End the interview early
   * @param sessionId - ID of the session
   * @returns InterviewAction with feedback
   */
  endEarly(sessionId: SessionId): InterviewAction {
    if (!this.canEndEarly(sessionId)) {
      return {
        type: 'redirect',
        message: 'Cannot end interview early. Please answer at least one question first.'
      };
    }

    // Mark session as ended early
    this.sessionManager.endInterview(sessionId, true);

    // Generate feedback for partial interview
    return this.completeInterview(sessionId);
  }

  /**
   * Get the current progress of the interview
   * @param sessionId - ID of the session
   * @returns InterviewProgress with completion metrics
   */
  getProgress(sessionId: SessionId): InterviewProgress {
    const session = this.sessionManager.getSessionState(sessionId);
    const currentIndex = this.currentQuestionIndex.get(sessionId) || 0;

    // Count primary questions (exclude follow-ups)
    const primaryQuestions = session.questions.filter(q => !q.parentQuestionId);
    const totalQuestions = primaryQuestions.length;

    // Count answered primary questions
    const answeredPrimaryQuestions = primaryQuestions.filter(q =>
      session.responses.has(q.id)
    ).length;

    // Calculate percent complete (round to 1 decimal place for precision)
    const percentComplete = totalQuestions > 0
      ? Math.round((answeredPrimaryQuestions / totalQuestions) * 1000) / 10
      : 0;

    // Estimate remaining time (only if at least one question has been answered)
    const remainingQuestions = totalQuestions - answeredPrimaryQuestions;
    const estimatedTimeRemaining = answeredPrimaryQuestions > 0 && remainingQuestions > 0
      ? remainingQuestions * this.AVERAGE_QUESTION_TIME
      : undefined;

    return {
      totalQuestions,
      answeredQuestions: answeredPrimaryQuestions,
      currentQuestionIndex: currentIndex,
      percentComplete,
      estimatedTimeRemaining
    };
  }

  /**
   * Get the expected interview duration
   * @param sessionId - ID of the session
   * @returns Expected duration in milliseconds
   */
  getExpectedDuration(sessionId: SessionId): number {
    const session = this.sessionManager.getSessionState(sessionId);
    const primaryQuestions = session.questions.filter(q => !q.parentQuestionId);
    return primaryQuestions.length * this.AVERAGE_QUESTION_TIME;
  }

  /**
   * Complete the interview and generate feedback
   * @param sessionId - ID of the session
   * @returns InterviewAction with complete type and feedback
   */
  private completeInterview(sessionId: SessionId): InterviewAction {
    const session = this.sessionManager.getSessionState(sessionId);

    // End the interview if not already ended
    if (session.status === 'in-progress') {
      this.sessionManager.endInterview(sessionId, false);
    }

    // Generate comprehensive feedback report using FeedbackGenerator
    const feedback = this.feedbackGenerator.generateFeedback(session);

    return {
      type: 'complete',
      feedback
    };
  }

  /**
   * Generate continuation prompts after feedback delivery
   * @param sessionId - ID of the completed session
   * @returns ContinuationPrompt with available options
   */
  generateContinuationPrompt(sessionId: SessionId): ContinuationPrompt {
    const session = this.sessionManager.getSessionState(sessionId);

    // Ensure session is completed or ended early
    if (session.status !== 'completed' && session.status !== 'ended-early') {
      throw new Error('Cannot generate continuation prompt for in-progress session');
    }

    const options: Array<{
      id: string;
      label: string;
      description: string;
      continuationOptions: ContinuationOptions;
    }> = [
        {
          id: 'new-round-same',
          label: 'Start Another Round (Same Role)',
          description: `Continue practicing for ${session.role.name} at ${session.experienceLevel.level} level`,
          continuationOptions: {
            type: 'new-round' as const,
            role: session.role,
            experienceLevel: session.experienceLevel
          }
        },
        {
          id: 'new-round-different',
          label: 'Start Another Round (Different Role)',
          description: 'Practice for a different job role or experience level',
          continuationOptions: {
            type: 'new-round' as const
          }
        }
      ];

    // Add topic-specific drill options based on weak areas
    const weakCategories = this.identifyWeakCategories(session);

    for (const category of weakCategories.slice(0, 3)) {
      options.push({
        id: `drill-${category.name.toLowerCase().replace(/\s+/g, '-')}`,
        label: `Drill: ${category.name}`,
        description: `Focused practice on ${category.name} questions`,
        continuationOptions: {
          type: 'topic-drill',
          role: session.role,
          experienceLevel: session.experienceLevel,
          drillTopic: category.name,
          drillCategory: category.name
        }
      });
    }

    return {
      message: 'Would you like to continue practicing?',
      options
    };
  }

  /**
   * Create a new session from continuation parameters
   * @param continuationOptions - Options for the new session
   * @returns SessionId of the newly created session
   */
  createContinuationSession(continuationOptions: ContinuationOptions): SessionId {
    if (continuationOptions.type === 'new-round') {
      // Create a new full interview session
      if (!continuationOptions.role || !continuationOptions.experienceLevel) {
        throw new Error('Role and experience level required for new round');
      }

      return this.sessionManager.createSession(
        continuationOptions.role.id,
        continuationOptions.experienceLevel.level
      );
    } else if (continuationOptions.type === 'topic-drill') {
      // Create a focused drill session
      if (!continuationOptions.role || !continuationOptions.experienceLevel || !continuationOptions.drillTopic) {
        throw new Error('Role, experience level, and drill topic required for topic drill');
      }

      // Create session and mark it for drill mode
      const sessionId = this.sessionManager.createSession(
        continuationOptions.role.id,
        continuationOptions.experienceLevel.level
      );

      // Store drill topic for question generation
      // This will be used by QuestionGenerator to focus on specific category
      const session = this.sessionManager.getSessionState(sessionId);
      (session as any).drillTopic = continuationOptions.drillTopic;

      return sessionId;
    }

    throw new Error('Invalid continuation type');
  }

  /**
   * Identify weak categories from session performance
   * @private
   */
  private identifyWeakCategories(session: SessionState): Array<{ name: string; avgScore: number }> {
    const categoryScores = new Map<string, { total: number; count: number }>();

    // Aggregate scores by category
    for (const question of session.questions) {
      const evaluation = session.evaluations.get(question.id);
      if (evaluation) {
        const avgScore = (evaluation.depthScore + evaluation.clarityScore + evaluation.completenessScore) / 3;

        const existing = categoryScores.get(question.category) || { total: 0, count: 0 };
        existing.total += avgScore;
        existing.count += 1;
        categoryScores.set(question.category, existing);
      }
    }

    // Calculate averages and sort by score (lowest first)
    const categories = Array.from(categoryScores.entries())
      .map(([name, { total, count }]) => ({
        name,
        avgScore: total / count
      }))
      .filter(cat => cat.avgScore < 7) // Only include weak areas
      .sort((a, b) => a.avgScore - b.avgScore);

    return categories;
  }

  /**
   * Update behavior classification based on response history
   * @param sessionId - ID of the session
   */
  private updateBehaviorClassification(sessionId: SessionId): void {
    const session = this.sessionManager.getSessionState(sessionId);
    const responses = Array.from(session.responses.values());
    const interactions = this.userInteractions.get(sessionId) || [];

    // Classify behavior
    const behaviorType = this.behaviorClassifier.classifyBehavior(responses, interactions);

    // Update session
    this.sessionManager.updateBehaviorType(sessionId, behaviorType);
  }

  /**
   * Count words in a text string
   * @param text - Text to count words in
   * @returns Word count
   */
  private countWords(text: string): number {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  }

  /**
   * Calculate response time for a question
   * @param session - Session state
   * @param questionId - ID of the question
   * @returns Response time in milliseconds
   */
  private calculateResponseTime(session: SessionState, questionId: QuestionId): number {
    // Find when the question was asked (approximate based on session start and question order)
    const questionIndex = session.questions.findIndex(q => q.id === questionId);

    if (questionIndex === -1) {
      return 0;
    }

    // Estimate question start time based on previous responses
    const previousResponses = Array.from(session.responses.values())
      .filter((_, idx) => idx < questionIndex);

    const estimatedQuestionStartTime = session.startTime +
      (previousResponses.length * this.AVERAGE_QUESTION_TIME);

    // Response time is current time minus estimated start time
    return Date.now() - estimatedQuestionStartTime;
  }

  /**
   * Get adapted response based on behavior type
   * @param sessionId - ID of the session
   * @param content - Content to adapt
   * @returns Adapted response content
   */
  getAdaptedResponse(sessionId: SessionId, content: string): string {
    const session = this.sessionManager.getSessionState(sessionId);
    const adapted = this.communicationAdapter.adaptResponse(
      content,
      session.behaviorType
    );
    return adapted.content;
  }

  /**
   * Get acknowledgment message based on behavior type
   * @param sessionId - ID of the session
   * @returns Acknowledgment message
   */
  getAcknowledgment(sessionId: SessionId): string {
    const session = this.sessionManager.getSessionState(sessionId);
    return this.communicationAdapter.getAcknowledgment(session.behaviorType);
  }

  /**
   * Get transition message based on behavior type
   * @param sessionId - ID of the session
   * @returns Transition message
   */
  getTransition(sessionId: SessionId): string {
    const session = this.sessionManager.getSessionState(sessionId);
    return this.communicationAdapter.getTransition(session.behaviorType);
  }

  /**
   * Record a user interaction (public method for testing)
   * @param sessionId - ID of the session
   * @param interaction - User interaction to record
   */
  recordInteraction(sessionId: SessionId, interaction: UserInteraction): void {
    const interactions = this.userInteractions.get(sessionId) || [];
    interactions.push(interaction);
    this.userInteractions.set(sessionId, interactions);
  }

  /**
   * Get current behavior type for a session
   * @param sessionId - ID of the session
   * @returns Current behavior type
   */
  getCurrentBehaviorType(sessionId: SessionId): string {
    const session = this.sessionManager.getSessionState(sessionId);
    return session.behaviorType;
  }

  /**
   * Cleanup session tracking data
   * @param sessionId - ID of the session
   */
  cleanup(sessionId: SessionId): void {
    this.currentQuestionIndex.delete(sessionId);
    this.userInteractions.delete(sessionId);
  }
}
