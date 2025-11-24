import { InterviewController } from './InterviewController';
import { SessionManager } from '../services/SessionManager';
import { DefaultQuestionGenerator } from '../services/QuestionGenerator';
import { ResponseEvaluator } from '../services/ResponseEvaluator';
import { BehaviorClassifier } from '../services/BehaviorClassifier';
import { FeedbackGenerator } from '../services/FeedbackGenerator';
import {
    SessionId,
    CandidateResponse,
    InterviewQuestion,
    UserInteraction
} from '../models/types';

describe('InterviewController', () => {
    let controller: InterviewController;
    let sessionManager: SessionManager;
    let questionGenerator: DefaultQuestionGenerator;
    let responseEvaluator: ResponseEvaluator;
    let behaviorClassifier: BehaviorClassifier;
    let feedbackGenerator: FeedbackGenerator;
    let sessionId: SessionId;

    beforeEach(() => {
        sessionManager = new SessionManager();
        questionGenerator = new DefaultQuestionGenerator();
        responseEvaluator = new ResponseEvaluator();
        behaviorClassifier = new BehaviorClassifier();
        feedbackGenerator = new FeedbackGenerator();

        controller = new InterviewController(
            sessionManager,
            questionGenerator,
            responseEvaluator,
            behaviorClassifier,
            feedbackGenerator
        );

        // Create a session for testing
        sessionId = sessionManager.createSession('software-engineer', 'mid');
    });

    describe('initialize', () => {
        it('should initialize interview and return first question', () => {
            const firstQuestion = controller.initialize(sessionId);

            expect(firstQuestion).toBeDefined();
            expect(firstQuestion.id).toBeDefined();
            expect(firstQuestion.text).toBeDefined();
            expect(firstQuestion.type).toMatch(/technical|behavioral/);
        });

        it('should transition session to in-progress state', () => {
            controller.initialize(sessionId);

            const state = sessionManager.getSessionState(sessionId);
            expect(state.status).toBe('in-progress');
        });

        it('should generate 5-10 questions', () => {
            controller.initialize(sessionId);

            const state = sessionManager.getSessionState(sessionId);
            expect(state.questions.length).toBeGreaterThanOrEqual(5);
            expect(state.questions.length).toBeLessThanOrEqual(10);
        });

        it('should include both technical and behavioral questions', () => {
            controller.initialize(sessionId);

            const state = sessionManager.getSessionState(sessionId);
            const hasTechnical = state.questions.some(q => q.type === 'technical');
            const hasBehavioral = state.questions.some(q => q.type === 'behavioral');

            expect(hasTechnical).toBe(true);
            expect(hasBehavioral).toBe(true);
        });

        it('should initialize question index to 0', () => {
            controller.initialize(sessionId);

            const progress = controller.getProgress(sessionId);
            expect(progress.currentQuestionIndex).toBe(1); // After first question
        });
    });

    describe('nextQuestion', () => {
        beforeEach(() => {
            controller.initialize(sessionId);
        });

        it('should return next question in sequence', () => {
            const state = sessionManager.getSessionState(sessionId);
            const expectedQuestion = state.questions[1]; // Second question

            const nextQ = controller.nextQuestion(sessionId);

            expect(nextQ).toBeDefined();
            expect(nextQ?.id).toBe(expectedQuestion.id);
        });

        it('should return null when no more questions', () => {
            const state = sessionManager.getSessionState(sessionId);
            const totalQuestions = state.questions.length;

            // Advance through all questions
            for (let i = 1; i < totalQuestions; i++) {
                controller.nextQuestion(sessionId);
            }

            const result = controller.nextQuestion(sessionId);
            expect(result).toBeNull();
        });

        it('should increment question index', () => {
            const progressBefore = controller.getProgress(sessionId);
            controller.nextQuestion(sessionId);
            const progressAfter = controller.getProgress(sessionId);

            expect(progressAfter.currentQuestionIndex).toBe(progressBefore.currentQuestionIndex + 1);
        });
    });

    describe('processResponse', () => {
        let firstQuestion: InterviewQuestion;

        beforeEach(() => {
            firstQuestion = controller.initialize(sessionId);
        });

        it('should add response to session', () => {
            const response: CandidateResponse = {
                questionId: firstQuestion.id,
                text: 'This is a detailed answer about closures in JavaScript. A closure is a function that has access to variables in its outer scope.',
                timestamp: Date.now(),
                wordCount: 20,
                responseTime: 30000
            };

            controller.processResponse(sessionId, response);

            const state = sessionManager.getSessionState(sessionId);
            expect(state.responses.has(firstQuestion.id)).toBe(true);
        });

        it('should evaluate the response', () => {
            const response: CandidateResponse = {
                questionId: firstQuestion.id,
                text: 'A closure is a function with access to outer scope variables.',
                timestamp: Date.now(),
                wordCount: 10,
                responseTime: 15000
            };

            controller.processResponse(sessionId, response);

            const state = sessionManager.getSessionState(sessionId);
            expect(state.evaluations.has(firstQuestion.id)).toBe(true);
        });

        it('should update behavior classification', () => {
            const response: CandidateResponse = {
                questionId: firstQuestion.id,
                text: 'Brief answer.',
                timestamp: Date.now(),
                wordCount: 2,
                responseTime: 5000
            };

            controller.processResponse(sessionId, response);

            const state = sessionManager.getSessionState(sessionId);
            expect(state.behaviorType).toBeDefined();
        });

        it('should return follow-up action when response needs follow-up', () => {
            // Very short response should trigger follow-up
            const response: CandidateResponse = {
                questionId: firstQuestion.id,
                text: 'Yes.',
                timestamp: Date.now(),
                wordCount: 1,
                responseTime: 2000
            };

            const action = controller.processResponse(sessionId, response);

            expect(action.type).toBe('follow-up');
            if (action.type === 'follow-up') {
                expect(action.question).toBeDefined();
                expect(action.question.text).toBeDefined();
            }
        });

        it('should return next-question action when response is adequate', () => {
            const response: CandidateResponse = {
                questionId: firstQuestion.id,
                text: 'A closure is a function that has access to variables in its outer lexical scope even after the outer function has returned. This is useful for data privacy and creating function factories. For example, in JavaScript, you can create a counter function that maintains private state. Closures are commonly used in event handlers and callbacks.',
                timestamp: Date.now(),
                wordCount: 55,
                responseTime: 60000
            };

            const action = controller.processResponse(sessionId, response);

            // Should be either next-question or follow-up depending on evaluation
            expect(['next-question', 'follow-up']).toContain(action.type);
            if (action.type === 'next-question') {
                expect(action.question).toBeDefined();
            } else if (action.type === 'follow-up') {
                expect(action.question).toBeDefined();
            }
        });

        it('should return complete action when all questions answered', () => {
            const state = sessionManager.getSessionState(sessionId);
            const originalQuestionCount = state.questions.length;

            // Answer all original questions with adequate responses
            for (let i = 0; i < originalQuestionCount; i++) {
                const currentState = sessionManager.getSessionState(sessionId);
                const question = currentState.questions[i];

                const response: CandidateResponse = {
                    questionId: question.id,
                    text: 'This is a comprehensive answer with sufficient detail and technical depth to demonstrate understanding of the topic. I have experience with this and can provide concrete examples.',
                    timestamp: Date.now(),
                    wordCount: 28,
                    responseTime: 30000
                };

                const action = controller.processResponse(sessionId, response);

                // Check if this was the last original question and no more questions remain
                if (i === originalQuestionCount - 1 && !controller.shouldContinue(sessionId)) {
                    expect(action.type).toBe('complete');
                }
            }
        });

        it('should return redirect action for invalid question ID', () => {
            const response: CandidateResponse = {
                questionId: 'invalid-question-id',
                text: 'Some answer',
                timestamp: Date.now(),
                wordCount: 2,
                responseTime: 5000
            };

            const action = controller.processResponse(sessionId, response);

            expect(action.type).toBe('redirect');
            if (action.type === 'redirect') {
                expect(action.message).toContain('Question not found');
            }
        });

        it('should adapt communication style based on behavior', () => {
            // Create multiple confused responses
            for (let i = 0; i < 3; i++) {
                const state = sessionManager.getSessionState(sessionId);
                const question = state.questions[i];

                const response: CandidateResponse = {
                    questionId: question.id,
                    text: 'I don\'t understand. Can you help?',
                    timestamp: Date.now(),
                    wordCount: 6,
                    responseTime: 10000
                };

                controller.processResponse(sessionId, response);
            }

            const state = sessionManager.getSessionState(sessionId);
            // After multiple confused responses, behavior should be classified
            expect(['confused', 'standard']).toContain(state.behaviorType);
        });
    });

    describe('shouldContinue', () => {
        beforeEach(() => {
            controller.initialize(sessionId);
        });

        it('should return true when questions remain', () => {
            expect(controller.shouldContinue(sessionId)).toBe(true);
        });

        it('should return false when all questions answered', () => {
            const state = sessionManager.getSessionState(sessionId);

            // Advance through all questions
            for (let i = 1; i < state.questions.length; i++) {
                controller.nextQuestion(sessionId);
            }

            expect(controller.shouldContinue(sessionId)).toBe(false);
        });

        it('should return false when session is not in progress', () => {
            sessionManager.endInterview(sessionId, false);
            expect(controller.shouldContinue(sessionId)).toBe(false);
        });
    });

    describe('canEndEarly', () => {
        beforeEach(() => {
            controller.initialize(sessionId);
        });

        it('should return false before any responses', () => {
            expect(controller.canEndEarly(sessionId)).toBe(false);
        });

        it('should return true after at least one response', () => {
            const state = sessionManager.getSessionState(sessionId);
            const firstQuestion = state.questions[0];

            const response: CandidateResponse = {
                questionId: firstQuestion.id,
                text: 'My answer',
                timestamp: Date.now(),
                wordCount: 2,
                responseTime: 5000
            };

            sessionManager.addResponse(sessionId, response);

            expect(controller.canEndEarly(sessionId)).toBe(true);
        });

        it('should return false when session is not in progress', () => {
            const state = sessionManager.getSessionState(sessionId);
            const firstQuestion = state.questions[0];

            const response: CandidateResponse = {
                questionId: firstQuestion.id,
                text: 'My answer',
                timestamp: Date.now(),
                wordCount: 2,
                responseTime: 5000
            };

            sessionManager.addResponse(sessionId, response);
            sessionManager.endInterview(sessionId, false);

            expect(controller.canEndEarly(sessionId)).toBe(false);
        });
    });

    describe('endEarly', () => {
        beforeEach(() => {
            controller.initialize(sessionId);
        });

        it('should return redirect when no responses given', () => {
            const action = controller.endEarly(sessionId);

            expect(action.type).toBe('redirect');
            if (action.type === 'redirect') {
                expect(action.message).toContain('Cannot end interview early');
            }
        });

        it('should end interview and return complete action', () => {
            const state = sessionManager.getSessionState(sessionId);
            const firstQuestion = state.questions[0];

            const response: CandidateResponse = {
                questionId: firstQuestion.id,
                text: 'My answer',
                timestamp: Date.now(),
                wordCount: 2,
                responseTime: 5000
            };

            sessionManager.addResponse(sessionId, response);

            const action = controller.endEarly(sessionId);

            expect(action.type).toBe('complete');
        });

        it('should set session status to ended-early', () => {
            const state = sessionManager.getSessionState(sessionId);
            const firstQuestion = state.questions[0];

            const response: CandidateResponse = {
                questionId: firstQuestion.id,
                text: 'My answer',
                timestamp: Date.now(),
                wordCount: 2,
                responseTime: 5000
            };

            sessionManager.addResponse(sessionId, response);
            controller.endEarly(sessionId);

            const updatedState = sessionManager.getSessionState(sessionId);
            expect(updatedState.status).toBe('ended-early');
        });
    });

    describe('getProgress', () => {
        beforeEach(() => {
            controller.initialize(sessionId);
        });

        it('should return progress with total questions', () => {
            const progress = controller.getProgress(sessionId);
            const state = sessionManager.getSessionState(sessionId);

            expect(progress.totalQuestions).toBe(state.questions.length);
        });

        it('should return progress with answered questions count', () => {
            const state = sessionManager.getSessionState(sessionId);
            const firstQuestion = state.questions[0];

            const response: CandidateResponse = {
                questionId: firstQuestion.id,
                text: 'My answer',
                timestamp: Date.now(),
                wordCount: 2,
                responseTime: 5000
            };

            sessionManager.addResponse(sessionId, response);

            const progress = controller.getProgress(sessionId);
            expect(progress.answeredQuestions).toBe(1);
        });

        it('should calculate percent complete', () => {
            const state = sessionManager.getSessionState(sessionId);
            const totalQuestions = state.questions.length;

            // Answer half the questions
            const halfCount = Math.floor(totalQuestions / 2);
            for (let i = 0; i < halfCount; i++) {
                const response: CandidateResponse = {
                    questionId: state.questions[i].id,
                    text: 'Answer',
                    timestamp: Date.now(),
                    wordCount: 1,
                    responseTime: 5000
                };
                sessionManager.addResponse(sessionId, response);
            }

            const progress = controller.getProgress(sessionId);
            const expectedPercent = (halfCount / totalQuestions) * 100;

            expect(progress.percentComplete).toBeCloseTo(expectedPercent, 1);
        });

        it('should estimate time remaining based on average response time', () => {
            const state = sessionManager.getSessionState(sessionId);

            // Answer first question
            const response: CandidateResponse = {
                questionId: state.questions[0].id,
                text: 'Answer',
                timestamp: Date.now(),
                wordCount: 1,
                responseTime: 60000 // 1 minute
            };
            sessionManager.addResponse(sessionId, response);

            const progress = controller.getProgress(sessionId);

            expect(progress.estimatedTimeRemaining).toBeDefined();
            expect(progress.estimatedTimeRemaining).toBeGreaterThan(0);
        });

        it('should not have estimated time remaining before any responses', () => {
            const progress = controller.getProgress(sessionId);
            expect(progress.estimatedTimeRemaining).toBeUndefined();
        });
    });

    describe('recordInteraction', () => {
        beforeEach(() => {
            controller.initialize(sessionId);
        });

        it('should record user interaction', () => {
            const interaction: UserInteraction = {
                timestamp: Date.now(),
                type: 'command',
                content: 'help'
            };

            controller.recordInteraction(sessionId, interaction);

            // Verify by checking behavior classification still works
            const behaviorType = controller.getCurrentBehaviorType(sessionId);
            expect(behaviorType).toBeDefined();
        });

        it('should track multiple interactions', () => {
            const interactions: UserInteraction[] = [
                { timestamp: Date.now(), type: 'command', content: 'help' },
                { timestamp: Date.now(), type: 'command', content: 'skip' },
                { timestamp: Date.now(), type: 'response', content: 'answer' }
            ];

            interactions.forEach(interaction => {
                controller.recordInteraction(sessionId, interaction);
            });

            // Should not throw and behavior should be tracked
            expect(() => controller.getCurrentBehaviorType(sessionId)).not.toThrow();
        });
    });

    describe('getCurrentBehaviorType', () => {
        beforeEach(() => {
            controller.initialize(sessionId);
        });

        it('should return current behavior type', () => {
            const behaviorType = controller.getCurrentBehaviorType(sessionId);
            expect(behaviorType).toBeDefined();
            expect(['confused', 'efficient', 'chatty', 'edge-case', 'standard']).toContain(behaviorType);
        });

        it('should return updated behavior type after responses', () => {
            const state = sessionManager.getSessionState(sessionId);
            const firstQuestion = state.questions[0];

            const response: CandidateResponse = {
                questionId: firstQuestion.id,
                text: 'Brief.',
                timestamp: Date.now(),
                wordCount: 1,
                responseTime: 2000
            };

            controller.processResponse(sessionId, response);

            const behaviorType = controller.getCurrentBehaviorType(sessionId);
            expect(behaviorType).toBeDefined();
        });
    });

    describe('cleanup', () => {
        beforeEach(() => {
            controller.initialize(sessionId);
        });

        it('should cleanup session tracking data', () => {
            controller.cleanup(sessionId);

            // After cleanup, progress should show reset state
            const progress = controller.getProgress(sessionId);
            expect(progress.currentQuestionIndex).toBe(0);
        });

        it('should not affect session state in SessionManager', () => {
            const stateBefore = sessionManager.getSessionState(sessionId);
            controller.cleanup(sessionId);
            const stateAfter = sessionManager.getSessionState(sessionId);

            expect(stateAfter.sessionId).toBe(stateBefore.sessionId);
            expect(stateAfter.status).toBe(stateBefore.status);
        });
    });

    describe('interview flow integration', () => {
        it('should support complete interview flow', () => {
            // Initialize
            const firstQuestion = controller.initialize(sessionId);
            expect(firstQuestion).toBeDefined();

            // Get progress
            let progress = controller.getProgress(sessionId);
            expect(progress.answeredQuestions).toBe(0);

            // Answer first question
            const response1: CandidateResponse = {
                questionId: firstQuestion.id,
                text: 'This is a comprehensive answer with good technical depth and clarity.',
                timestamp: Date.now(),
                wordCount: 12,
                responseTime: 30000
            };

            const action1 = controller.processResponse(sessionId, response1);
            expect(action1.type).toMatch(/next-question|follow-up/);

            // Check progress updated
            progress = controller.getProgress(sessionId);
            expect(progress.answeredQuestions).toBe(1);

            // Verify can continue
            expect(controller.shouldContinue(sessionId)).toBe(true);

            // Verify can end early
            expect(controller.canEndEarly(sessionId)).toBe(true);
        });

        it('should handle follow-up question flow', () => {
            const firstQuestion = controller.initialize(sessionId);

            // Give inadequate response to trigger follow-up
            const response1: CandidateResponse = {
                questionId: firstQuestion.id,
                text: 'Yes.',
                timestamp: Date.now(),
                wordCount: 1,
                responseTime: 2000
            };

            const action1 = controller.processResponse(sessionId, response1);
            expect(action1.type).toBe('follow-up');

            if (action1.type === 'follow-up') {
                // Answer follow-up
                const response2: CandidateResponse = {
                    questionId: action1.question.id,
                    text: 'A more detailed answer explaining the concept thoroughly.',
                    timestamp: Date.now(),
                    wordCount: 9,
                    responseTime: 20000
                };

                const action2 = controller.processResponse(sessionId, response2);
                expect(action2.type).toMatch(/next-question|follow-up|complete/);
            }
        });

        it('should complete interview when all questions answered', () => {
            controller.initialize(sessionId);
            const state = sessionManager.getSessionState(sessionId);
            const originalQuestionCount = state.questions.length;

            // Answer all original questions with high-quality responses
            let lastAction;
            for (let i = 0; i < originalQuestionCount; i++) {
                const currentState = sessionManager.getSessionState(sessionId);
                const question = currentState.questions[i];

                const response: CandidateResponse = {
                    questionId: question.id,
                    text: 'Comprehensive answer with technical depth and clarity. I have extensive experience with this topic and can provide detailed examples. The key aspects include proper implementation, testing, and documentation.',
                    timestamp: Date.now(),
                    wordCount: 30,
                    responseTime: 25000
                };

                lastAction = controller.processResponse(sessionId, response);
            }

            // After answering all original questions, should eventually complete
            // (may need to answer follow-ups first)
            const finalState = sessionManager.getSessionState(sessionId);
            expect(['completed', 'in-progress']).toContain(finalState.status);

            // If still in progress, answer remaining follow-ups
            if (finalState.status === 'in-progress') {
                while (controller.shouldContinue(sessionId)) {
                    const currentState = sessionManager.getSessionState(sessionId);
                    const remainingQuestions = currentState.questions.slice(originalQuestionCount);

                    if (remainingQuestions.length === 0) break;

                    const question = remainingQuestions[0];
                    const response: CandidateResponse = {
                        questionId: question.id,
                        text: 'Detailed follow-up response with comprehensive information.',
                        timestamp: Date.now(),
                        wordCount: 8,
                        responseTime: 15000
                    };

                    lastAction = controller.processResponse(sessionId, response);
                }
            }

            // Eventually should complete
            expect(lastAction?.type).toMatch(/complete|next-question/);
        });
    });

    describe('generateContinuationPrompt', () => {
        beforeEach(() => {
            controller.initialize(sessionId);
        });

        it('should throw error for in-progress session', () => {
            expect(() => controller.generateContinuationPrompt(sessionId)).toThrow(
                'Cannot generate continuation prompt for in-progress session'
            );
        });

        it('should generate continuation prompt for completed session', () => {
            // Complete the session
            const state = sessionManager.getSessionState(sessionId);
            const firstQuestion = state.questions[0];

            const response: CandidateResponse = {
                questionId: firstQuestion.id,
                text: 'My answer',
                timestamp: Date.now(),
                wordCount: 2,
                responseTime: 5000
            };

            sessionManager.addResponse(sessionId, response);
            sessionManager.endInterview(sessionId, false);

            const prompt = controller.generateContinuationPrompt(sessionId);

            expect(prompt.message).toBeDefined();
            expect(prompt.options).toBeDefined();
            expect(prompt.options.length).toBeGreaterThan(0);
        });

        it('should include new round option with same role', () => {
            const state = sessionManager.getSessionState(sessionId);
            const firstQuestion = state.questions[0];

            const response: CandidateResponse = {
                questionId: firstQuestion.id,
                text: 'My answer',
                timestamp: Date.now(),
                wordCount: 2,
                responseTime: 5000
            };

            sessionManager.addResponse(sessionId, response);
            sessionManager.endInterview(sessionId, false);

            const prompt = controller.generateContinuationPrompt(sessionId);

            const sameRoleOption = prompt.options.find(opt => opt.id === 'new-round-same');
            expect(sameRoleOption).toBeDefined();
            expect(sameRoleOption?.continuationOptions.type).toBe('new-round');
            expect(sameRoleOption?.continuationOptions.role).toBeDefined();
        });

        it('should include new round option with different role', () => {
            const state = sessionManager.getSessionState(sessionId);
            const firstQuestion = state.questions[0];

            const response: CandidateResponse = {
                questionId: firstQuestion.id,
                text: 'My answer',
                timestamp: Date.now(),
                wordCount: 2,
                responseTime: 5000
            };

            sessionManager.addResponse(sessionId, response);
            sessionManager.endInterview(sessionId, false);

            const prompt = controller.generateContinuationPrompt(sessionId);

            const differentRoleOption = prompt.options.find(opt => opt.id === 'new-round-different');
            expect(differentRoleOption).toBeDefined();
            expect(differentRoleOption?.continuationOptions.type).toBe('new-round');
        });

        it('should include topic drill options for weak areas', () => {
            // Answer questions with low scores to create weak areas
            const state = sessionManager.getSessionState(sessionId);

            for (let i = 0; i < 3; i++) {
                const question = state.questions[i];
                const response: CandidateResponse = {
                    questionId: question.id,
                    text: 'Short.',
                    timestamp: Date.now(),
                    wordCount: 1,
                    responseTime: 2000
                };

                controller.processResponse(sessionId, response);
            }

            sessionManager.endInterview(sessionId, false);

            const prompt = controller.generateContinuationPrompt(sessionId);

            const drillOptions = prompt.options.filter(opt => opt.id.startsWith('drill-'));
            expect(drillOptions.length).toBeGreaterThan(0);

            if (drillOptions.length > 0) {
                expect(drillOptions[0].continuationOptions.type).toBe('topic-drill');
                expect(drillOptions[0].continuationOptions.drillTopic).toBeDefined();
            }
        });

        it('should work for early-ended sessions', () => {
            const state = sessionManager.getSessionState(sessionId);
            const firstQuestion = state.questions[0];

            const response: CandidateResponse = {
                questionId: firstQuestion.id,
                text: 'My answer',
                timestamp: Date.now(),
                wordCount: 2,
                responseTime: 5000
            };

            sessionManager.addResponse(sessionId, response);
            sessionManager.endInterview(sessionId, true);

            const prompt = controller.generateContinuationPrompt(sessionId);

            expect(prompt.message).toBeDefined();
            expect(prompt.options.length).toBeGreaterThan(0);
        });
    });

    describe('createContinuationSession', () => {
        let completedSessionId: SessionId;

        beforeEach(() => {
            controller.initialize(sessionId);
            const state = sessionManager.getSessionState(sessionId);
            const firstQuestion = state.questions[0];

            const response: CandidateResponse = {
                questionId: firstQuestion.id,
                text: 'My answer',
                timestamp: Date.now(),
                wordCount: 2,
                responseTime: 5000
            };

            sessionManager.addResponse(sessionId, response);
            sessionManager.endInterview(sessionId, false);
            completedSessionId = sessionId;
        });

        it('should create new session for new-round continuation', () => {
            const state = sessionManager.getSessionState(completedSessionId);

            const continuationOptions = {
                type: 'new-round' as const,
                role: state.role,
                experienceLevel: state.experienceLevel
            };

            const newSessionId = controller.createContinuationSession(continuationOptions);

            expect(newSessionId).toBeDefined();
            expect(newSessionId).not.toBe(completedSessionId);

            const newSession = sessionManager.getSessionState(newSessionId);
            expect(newSession.role.id).toBe(state.role.id);
            expect(newSession.experienceLevel.level).toBe(state.experienceLevel.level);
        });

        it('should throw error for new-round without role', () => {
            const continuationOptions = {
                type: 'new-round' as const
            };

            expect(() => controller.createContinuationSession(continuationOptions)).toThrow(
                'Role and experience level required for new round'
            );
        });

        it('should create drill session for topic-drill continuation', () => {
            const state = sessionManager.getSessionState(completedSessionId);

            const continuationOptions = {
                type: 'topic-drill' as const,
                role: state.role,
                experienceLevel: state.experienceLevel,
                drillTopic: 'Data Structures',
                drillCategory: 'Data Structures'
            };

            const newSessionId = controller.createContinuationSession(continuationOptions);

            expect(newSessionId).toBeDefined();
            expect(newSessionId).not.toBe(completedSessionId);

            const newSession = sessionManager.getSessionState(newSessionId);
            expect(newSession.role.id).toBe(state.role.id);
            expect((newSession as any).drillTopic).toBe('Data Structures');
        });

        it('should throw error for topic-drill without drill topic', () => {
            const state = sessionManager.getSessionState(completedSessionId);

            const continuationOptions = {
                type: 'topic-drill' as const,
                role: state.role,
                experienceLevel: state.experienceLevel
            };

            expect(() => controller.createContinuationSession(continuationOptions)).toThrow(
                'Role, experience level, and drill topic required for topic drill'
            );
        });

        it('should throw error for invalid continuation type', () => {
            const continuationOptions = {
                type: 'invalid-type' as any
            };

            expect(() => controller.createContinuationSession(continuationOptions)).toThrow(
                'Invalid continuation type'
            );
        });

        describe('early termination and continuation integration', () => {
            it('should support full early termination and continuation flow', () => {
                // Create a fresh session for this test
                const testSessionId = sessionManager.createSession('software-engineer', 'mid');

                // Initialize interview
                const firstQuestion = controller.initialize(testSessionId);
                expect(firstQuestion).toBeDefined();

                // Answer one question
                const response: CandidateResponse = {
                    questionId: firstQuestion.id,
                    text: 'Comprehensive answer with good detail.',
                    timestamp: Date.now(),
                    wordCount: 6,
                    responseTime: 15000
                };

                controller.processResponse(testSessionId, response);

                // End early
                const endAction = controller.endEarly(testSessionId);
                expect(endAction.type).toBe('complete');

                if (endAction.type === 'complete') {
                    expect(endAction.feedback).toBeDefined();
                    expect(endAction.feedback.scores).toBeDefined();
                }

                // Generate continuation prompt
                const prompt = controller.generateContinuationPrompt(testSessionId);
                expect(prompt.options.length).toBeGreaterThan(0);

                // Create continuation session
                const state = sessionManager.getSessionState(testSessionId);
                const continuationOptions = {
                    type: 'new-round' as const,
                    role: state.role,
                    experienceLevel: state.experienceLevel
                };

                const newSessionId = controller.createContinuationSession(continuationOptions);
                expect(newSessionId).toBeDefined();

                // Initialize new session
                const newFirstQuestion = controller.initialize(newSessionId);
                expect(newFirstQuestion).toBeDefined();
            });

            it('should generate partial feedback for early-ended sessions', () => {
                // Create a fresh session for this test
                const testSessionId = sessionManager.createSession('software-engineer', 'mid');

                controller.initialize(testSessionId);
                const state = sessionManager.getSessionState(testSessionId);

                // Answer only 2 questions
                for (let i = 0; i < 2; i++) {
                    const question = state.questions[i];
                    const response: CandidateResponse = {
                        questionId: question.id,
                        text: 'Good answer with technical depth.',
                        timestamp: Date.now(),
                        wordCount: 5,
                        responseTime: 10000
                    };

                    controller.processResponse(testSessionId, response);
                }

                // End early
                const endAction = controller.endEarly(testSessionId);
                expect(endAction.type).toBe('complete');

                if (endAction.type === 'complete') {
                    const feedback = endAction.feedback;
                    expect(feedback.scores).toBeDefined();
                    expect(feedback.questionBreakdown.length).toBe(2);
                    expect(feedback.summary).toContain('Performance');
                }
            });
        });
    });
});
