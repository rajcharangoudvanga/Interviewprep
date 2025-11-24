/**
 * InterviewPrepAI - Main API Interface
 * 
 * This module provides the main entry point and public API for the InterviewPrepAI system.
 * It integrates all components and provides a clean interface for conducting mock interviews.
 */

import {
    SessionId,
    JobRole,
    ExperienceLevel,
    ResumeDocument,
    ResumeAnalysis,
    InterviewQuestion,
    CandidateResponse,
    InterviewAction,
    InterviewProgress,
    ContinuationPrompt,
    ContinuationOptions,
    InteractionModeType
} from './models/types';

import { SessionManager } from './services/SessionManager';
import { InterviewController } from './controllers/InterviewController';
import { DefaultQuestionGenerator } from './services/QuestionGenerator';
import { ResponseEvaluator } from './services/ResponseEvaluator';
import { BehaviorClassifier } from './services/BehaviorClassifier';
import { FeedbackGenerator } from './services/FeedbackGenerator';
import { InvalidRoleInputError } from './models/RoleManager';

/**
 * Configuration options for the InterviewPrepAI system
 */
export interface InterviewPrepConfig {
    /** Enable debug logging */
    debug?: boolean;
    /** Custom logger function */
    logger?: (level: string, message: string, data?: any) => void;
    /** Average time per question in milliseconds (default: 3 minutes) */
    averageQuestionTime?: number;
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: Required<InterviewPrepConfig> = {
    debug: false,
    logger: (level: string, message: string, data?: any) => {
        if (level === 'error') {
            console.error(`[InterviewPrepAI] ${message}`, data || '');
        } else if (level === 'warn') {
            console.warn(`[InterviewPrepAI] ${message}`, data || '');
        } else if (level === 'info') {
            console.log(`[InterviewPrepAI] ${message}`, data || '');
        }
    },
    averageQuestionTime: 3 * 60 * 1000 // 3 minutes
};

/**
 * Main InterviewPrepAI class that provides the public API
 */
export class InterviewPrepAI {
    private sessionManager: SessionManager;
    private interviewController: InterviewController;
    private config: Required<InterviewPrepConfig>;

    constructor(config: InterviewPrepConfig = {}) {
        this.config = { ...DEFAULT_CONFIG, ...config };

        // Initialize core components
        this.sessionManager = new SessionManager();

        const questionGenerator = new DefaultQuestionGenerator();
        const responseEvaluator = new ResponseEvaluator();
        const behaviorClassifier = new BehaviorClassifier();
        const feedbackGenerator = new FeedbackGenerator();

        this.interviewController = new InterviewController(
            this.sessionManager,
            questionGenerator,
            responseEvaluator,
            behaviorClassifier,
            feedbackGenerator
        );

        this.log('info', 'InterviewPrepAI initialized');
    }

    /**
     * Get list of available job roles
     * @returns Array of available job roles
     */
    getAvailableRoles(): JobRole[] {
        try {
            return this.sessionManager.getRoleManager().getAvailableRoles();
        } catch (error) {
            this.log('error', 'Failed to get available roles', error);
            throw error;
        }
    }

    /**
     * Get list of available experience levels
     * @returns Array of available experience levels
     */
    getAvailableExperienceLevels(): ExperienceLevel[] {
        try {
            return this.sessionManager.getRoleManager().getAvailableExperienceLevels();
        } catch (error) {
            this.log('error', 'Failed to get available experience levels', error);
            throw error;
        }
    }

    /**
     * Create a new interview session
     * @param roleIdOrName - Job role ID or name
     * @param levelName - Experience level (entry, mid, senior, lead)
     * @param interactionMode - Interaction mode (voice or text), defaults to text
     * @returns SessionId for the created session
     * @throws InvalidRoleInputError if role or level is invalid
     */
    createSession(
        roleIdOrName: string,
        levelName: string,
        interactionMode: InteractionModeType = 'text'
    ): SessionId {
        try {
            this.log('info', `Creating session for role: ${roleIdOrName}, level: ${levelName}`);
            const sessionId = this.sessionManager.createSession(roleIdOrName, levelName, interactionMode);
            this.log('info', `Session created: ${sessionId}`);
            return sessionId;
        } catch (error) {
            if (error instanceof InvalidRoleInputError) {
                this.log('warn', 'Invalid role or level input', {
                    input: { roleIdOrName, levelName },
                    availableOptions: error.availableOptions
                });
            } else {
                this.log('error', 'Failed to create session', error);
            }
            throw error;
        }
    }

    /**
     * Upload and analyze a resume for an existing session
     * @param sessionId - ID of the session
     * @param resumeData - Resume document to parse and analyze
     * @returns ResumeAnalysis result
     */
    uploadResume(sessionId: SessionId, resumeData: ResumeDocument): ResumeAnalysis {
        try {
            this.log('info', `Uploading resume for session: ${sessionId}`);
            const analysis = this.sessionManager.uploadResume(sessionId, resumeData);
            this.log('info', `Resume analyzed. Alignment score: ${analysis.alignmentScore.overall}%`);
            return analysis;
        } catch (error) {
            this.log('error', 'Failed to upload resume', error);
            throw error;
        }
    }

    /**
     * Start the interview and get the first question
     * @param sessionId - ID of the session
     * @returns First interview question
     */
    startInterview(sessionId: SessionId): InterviewQuestion {
        try {
            this.log('info', `Starting interview for session: ${sessionId}`);
            const firstQuestion = this.interviewController.initialize(sessionId);
            this.log('info', `Interview started. First question: ${firstQuestion.type}`);
            return firstQuestion;
        } catch (error) {
            this.log('error', 'Failed to start interview', error);
            throw error;
        }
    }

    /**
     * Submit a response to the current question and get the next action
     * @param sessionId - ID of the session
     * @param response - Candidate's response (can be CandidateResponse object or just text)
     * @returns InterviewAction indicating what to do next
     */
    submitResponse(
        sessionId: SessionId,
        response: CandidateResponse | string
    ): InterviewAction {
        try {
            this.log('info', `Processing response for session: ${sessionId}`);
            const action = this.interviewController.processResponse(sessionId, response);
            this.log('info', `Response processed. Next action: ${action.type}`);
            return action;
        } catch (error) {
            this.log('error', 'Failed to process response', error);
            throw error;
        }
    }

    /**
     * Get the current progress of the interview
     * @param sessionId - ID of the session
     * @returns InterviewProgress with completion metrics
     */
    getProgress(sessionId: SessionId): InterviewProgress {
        try {
            return this.interviewController.getProgress(sessionId);
        } catch (error) {
            this.log('error', 'Failed to get progress', error);
            throw error;
        }
    }

    /**
     * Get the expected interview duration
     * @param sessionId - ID of the session
     * @returns Expected duration in milliseconds
     */
    getExpectedDuration(sessionId: SessionId): number {
        try {
            return this.interviewController.getExpectedDuration(sessionId);
        } catch (error) {
            this.log('error', 'Failed to get expected duration', error);
            throw error;
        }
    }

    /**
     * End the interview early
     * @param sessionId - ID of the session
     * @returns InterviewAction with feedback
     */
    endInterviewEarly(sessionId: SessionId): InterviewAction {
        try {
            this.log('info', `Ending interview early for session: ${sessionId}`);
            const action = this.interviewController.endEarly(sessionId);
            this.log('info', 'Interview ended early. Feedback generated.');
            return action;
        } catch (error) {
            this.log('error', 'Failed to end interview early', error);
            throw error;
        }
    }

    /**
     * Generate continuation prompts after feedback delivery
     * @param sessionId - ID of the completed session
     * @returns ContinuationPrompt with available options
     */
    getContinuationOptions(sessionId: SessionId): ContinuationPrompt {
        try {
            this.log('info', `Generating continuation options for session: ${sessionId}`);
            return this.interviewController.generateContinuationPrompt(sessionId);
        } catch (error) {
            this.log('error', 'Failed to generate continuation options', error);
            throw error;
        }
    }

    /**
     * Create a new session from continuation parameters
     * @param continuationOptions - Options for the new session
     * @returns SessionId of the newly created session
     */
    continueWithNewSession(continuationOptions: ContinuationOptions): SessionId {
        try {
            this.log('info', 'Creating continuation session', continuationOptions);
            const sessionId = this.interviewController.createContinuationSession(continuationOptions);
            this.log('info', `Continuation session created: ${sessionId}`);
            return sessionId;
        } catch (error) {
            this.log('error', 'Failed to create continuation session', error);
            throw error;
        }
    }

    /**
     * Get adapted response based on user behavior
     * @param sessionId - ID of the session
     * @param content - Content to adapt
     * @returns Adapted response content
     */
    getAdaptedResponse(sessionId: SessionId, content: string): string {
        try {
            return this.interviewController.getAdaptedResponse(sessionId, content);
        } catch (error) {
            this.log('error', 'Failed to adapt response', error);
            throw error;
        }
    }

    /**
     * Get acknowledgment message based on behavior type
     * @param sessionId - ID of the session
     * @returns Acknowledgment message
     */
    getAcknowledgment(sessionId: SessionId): string {
        try {
            return this.interviewController.getAcknowledgment(sessionId);
        } catch (error) {
            this.log('error', 'Failed to get acknowledgment', error);
            throw error;
        }
    }

    /**
     * Get transition message based on behavior type
     * @param sessionId - ID of the session
     * @returns Transition message
     */
    getTransition(sessionId: SessionId): string {
        try {
            return this.interviewController.getTransition(sessionId);
        } catch (error) {
            this.log('error', 'Failed to get transition', error);
            throw error;
        }
    }

    /**
     * Get current behavior type for a session
     * @param sessionId - ID of the session
     * @returns Current behavior type
     */
    getCurrentBehaviorType(sessionId: SessionId): string {
        try {
            return this.interviewController.getCurrentBehaviorType(sessionId);
        } catch (error) {
            this.log('error', 'Failed to get behavior type', error);
            throw error;
        }
    }

    /**
     * Cleanup session data (call when session is no longer needed)
     * @param sessionId - ID of the session
     */
    cleanupSession(sessionId: SessionId): void {
        try {
            this.log('info', `Cleaning up session: ${sessionId}`);
            this.interviewController.cleanup(sessionId);
            this.sessionManager.deleteSession(sessionId);
            this.log('info', 'Session cleaned up');
        } catch (error) {
            this.log('error', 'Failed to cleanup session', error);
            throw error;
        }
    }

    /**
     * Get all active sessions (for debugging/admin purposes)
     * @returns Array of session IDs
     */
    getActiveSessions(): SessionId[] {
        try {
            return this.sessionManager.getActiveSessions();
        } catch (error) {
            this.log('error', 'Failed to get active sessions', error);
            throw error;
        }
    }

    /**
     * Internal logging method
     * @private
     */
    private log(level: string, message: string, data?: any): void {
        if (this.config.debug || level === 'error' || level === 'warn') {
            this.config.logger(level, message, data);
        }
    }
}

/**
 * Create a new InterviewPrepAI instance with optional configuration
 * @param config - Configuration options
 * @returns InterviewPrepAI instance
 */
export function createInterviewPrepAI(config?: InterviewPrepConfig): InterviewPrepAI {
    return new InterviewPrepAI(config);
}

// Export all types for external use
export * from './models/types';
export { InvalidRoleInputError } from './models/RoleManager';
export { SessionError, InvalidStateTransitionError } from './services/SessionManager';
export { ResumeParsingError } from './services/ResumeParser';

// Default export
export default InterviewPrepAI;
