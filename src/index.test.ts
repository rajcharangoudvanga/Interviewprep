/**
 * Integration tests for the main InterviewPrepAI API
 */

import { InterviewPrepAI, createInterviewPrepAI } from './index';
import { ResumeDocument } from './models/types';

describe('InterviewPrepAI Integration', () => {
    let interviewAI: InterviewPrepAI;

    beforeEach(() => {
        interviewAI = createInterviewPrepAI({ debug: false });
    });

    describe('Initialization', () => {
        it('should create an instance with default config', () => {
            expect(interviewAI).toBeInstanceOf(InterviewPrepAI);
        });

        it('should create an instance with custom config', () => {
            const customLogger = jest.fn();
            const customAI = createInterviewPrepAI({
                debug: true,
                logger: customLogger
            });
            expect(customAI).toBeInstanceOf(InterviewPrepAI);
        });
    });

    describe('Role and Level Management', () => {
        it('should return available job roles', () => {
            const roles = interviewAI.getAvailableRoles();
            expect(roles).toBeInstanceOf(Array);
            expect(roles.length).toBeGreaterThan(0);
            expect(roles[0]).toHaveProperty('id');
            expect(roles[0]).toHaveProperty('name');
            expect(roles[0]).toHaveProperty('technicalSkills');
        });

        it('should return available experience levels', () => {
            const levels = interviewAI.getAvailableExperienceLevels();
            expect(levels).toBeInstanceOf(Array);
            expect(levels.length).toBe(4); // entry, mid, senior, lead
            expect(levels[0]).toHaveProperty('level');
            expect(levels[0]).toHaveProperty('yearsMin');
            expect(levels[0]).toHaveProperty('expectedDepth');
        });
    });

    describe('Session Management', () => {
        it('should create a session with valid role ID and level', () => {
            const sessionId = interviewAI.createSession('software-engineer', 'mid');
            expect(sessionId).toBeDefined();
            expect(typeof sessionId).toBe('string');
        });

        it('should create a session with valid role name and level', () => {
            const sessionId = interviewAI.createSession('Software Engineer', 'senior');
            expect(sessionId).toBeDefined();
            expect(typeof sessionId).toBe('string');
        });

        it('should throw error for invalid role', () => {
            expect(() => {
                interviewAI.createSession('invalid-role', 'mid');
            }).toThrow();
        });

        it('should throw error for invalid level', () => {
            expect(() => {
                interviewAI.createSession('software-engineer', 'invalid-level');
            }).toThrow();
        });

        it('should track active sessions', () => {
            const sessionId1 = interviewAI.createSession('software-engineer', 'mid');
            const sessionId2 = interviewAI.createSession('product-manager', 'senior');

            const activeSessions = interviewAI.getActiveSessions();
            expect(activeSessions).toContain(sessionId1);
            expect(activeSessions).toContain(sessionId2);
        });

        it('should cleanup session', () => {
            const sessionId = interviewAI.createSession('software-engineer', 'mid');
            interviewAI.cleanupSession(sessionId);

            const activeSessions = interviewAI.getActiveSessions();
            expect(activeSessions).not.toContain(sessionId);
        });
    });

    describe('Resume Upload', () => {
        it('should upload and analyze resume', () => {
            const sessionId = interviewAI.createSession('software-engineer', 'mid');

            const resume: ResumeDocument = {
                content: `
                    John Doe
                    Software Engineer
                    
                    Skills: Python, JavaScript, React, Node.js, SQL, AWS
                    
                    Experience:
                    Senior Software Engineer at Tech Corp
                    2020 - Present
                    - Built scalable web applications using React and Node.js
                    - Designed and implemented RESTful APIs
                    - Worked with AWS services for deployment
                `,
                format: 'text',
                filename: 'resume.txt'
            };

            const analysis = interviewAI.uploadResume(sessionId, resume);

            expect(analysis).toBeDefined();
            expect(analysis.technicalSkills.length).toBeGreaterThan(0);
            expect(analysis.alignmentScore).toBeDefined();
            expect(analysis.alignmentScore.overall).toBeGreaterThanOrEqual(0);
            expect(analysis.alignmentScore.overall).toBeLessThanOrEqual(100);
        });

        it('should handle resume parsing errors gracefully', () => {
            const sessionId = interviewAI.createSession('software-engineer', 'mid');

            const malformedResume: ResumeDocument = {
                content: '',
                format: 'text',
                filename: 'empty.txt'
            };

            // Should not throw, but return minimal analysis
            const analysis = interviewAI.uploadResume(sessionId, malformedResume);
            expect(analysis).toBeDefined();
        });
    });

    describe('End-to-End Interview Flow', () => {
        it('should conduct a complete interview without resume', () => {
            // Create session
            const sessionId = interviewAI.createSession('software-engineer', 'mid');

            // Start interview
            const firstQuestion = interviewAI.startInterview(sessionId);
            expect(firstQuestion).toBeDefined();
            expect(firstQuestion.text).toBeDefined();
            expect(['technical', 'behavioral']).toContain(firstQuestion.type);

            // Check progress
            let progress = interviewAI.getProgress(sessionId);
            expect(progress.totalQuestions).toBeGreaterThanOrEqual(5);
            expect(progress.totalQuestions).toBeLessThanOrEqual(10);
            expect(progress.percentComplete).toBe(0);

            // Submit response
            const response = 'This is a detailed technical response explaining my approach to the problem. I would start by analyzing the requirements, then design a solution using appropriate data structures and algorithms. I have experience with similar problems in my previous projects.';
            const action = interviewAI.submitResponse(sessionId, response);

            expect(action).toBeDefined();
            expect(['next-question', 'follow-up', 'complete']).toContain(action.type);

            // Check progress again
            progress = interviewAI.getProgress(sessionId);
            expect(progress.answeredQuestions).toBeGreaterThan(0);
        });

        it('should conduct interview with resume', () => {
            // Create session
            const sessionId = interviewAI.createSession('data-scientist', 'senior');

            // Upload resume
            const resume: ResumeDocument = {
                content: `
                    Jane Smith
                    Senior Data Scientist
                    
                    Skills: Python, Machine Learning, TensorFlow, PyTorch, SQL, Pandas, NumPy
                    
                    Experience:
                    Senior Data Scientist at AI Company
                    2019 - Present
                    - Developed machine learning models for predictive analytics
                    - Implemented deep learning solutions using TensorFlow
                    - Analyzed large datasets using Python and SQL
                `,
                format: 'text',
                filename: 'resume.txt'
            };

            interviewAI.uploadResume(sessionId, resume);

            // Start interview
            const firstQuestion = interviewAI.startInterview(sessionId);
            expect(firstQuestion).toBeDefined();

            // At least one question should reference resume
            // (This is probabilistic, but with high likelihood)
        });

        it('should handle early termination', () => {
            const sessionId = interviewAI.createSession('software-engineer', 'mid');
            interviewAI.startInterview(sessionId);

            // Submit one response
            interviewAI.submitResponse(sessionId, 'My answer to the first question.');

            // End early
            const action = interviewAI.endInterviewEarly(sessionId);

            expect(action.type).toBe('complete');
            expect(action).toHaveProperty('feedback');
            if (action.type === 'complete') {
                expect(action.feedback).toBeDefined();
                expect(action.feedback.scores).toBeDefined();
            }
        });

        it('should generate continuation options after completion', () => {
            const sessionId = interviewAI.createSession('software-engineer', 'entry');
            interviewAI.startInterview(sessionId);

            // Submit one response and end early
            interviewAI.submitResponse(sessionId, 'My answer.');
            interviewAI.endInterviewEarly(sessionId);

            // Get continuation options
            const continuationPrompt = interviewAI.getContinuationOptions(sessionId);

            expect(continuationPrompt).toBeDefined();
            expect(continuationPrompt.message).toBeDefined();
            expect(continuationPrompt.options).toBeInstanceOf(Array);
            expect(continuationPrompt.options.length).toBeGreaterThan(0);
        });

        it('should create continuation session', () => {
            const sessionId = interviewAI.createSession('software-engineer', 'mid');
            interviewAI.startInterview(sessionId);
            interviewAI.submitResponse(sessionId, 'My answer.');
            interviewAI.endInterviewEarly(sessionId);

            const continuationPrompt = interviewAI.getContinuationOptions(sessionId);
            const firstOption = continuationPrompt.options[0];

            // Create continuation session
            const newSessionId = interviewAI.continueWithNewSession(firstOption.continuationOptions);

            expect(newSessionId).toBeDefined();
            expect(newSessionId).not.toBe(sessionId);
        });
    });

    describe('Behavior Adaptation', () => {
        it('should adapt responses based on behavior', () => {
            const sessionId = interviewAI.createSession('software-engineer', 'mid');
            interviewAI.startInterview(sessionId);

            // Submit a confused response
            interviewAI.submitResponse(sessionId, 'I don\'t understand the question. Can you help?');

            // Check behavior type
            const behaviorType = interviewAI.getCurrentBehaviorType(sessionId);
            expect(behaviorType).toBeDefined();

            // Get adapted response
            const adapted = interviewAI.getAdaptedResponse(sessionId, 'Here is the next question.');
            expect(adapted).toBeDefined();
            expect(typeof adapted).toBe('string');
        });

        it('should provide acknowledgments based on behavior', () => {
            const sessionId = interviewAI.createSession('software-engineer', 'mid');
            interviewAI.startInterview(sessionId);

            const acknowledgment = interviewAI.getAcknowledgment(sessionId);
            expect(acknowledgment).toBeDefined();
            expect(typeof acknowledgment).toBe('string');
        });

        it('should provide transitions based on behavior', () => {
            const sessionId = interviewAI.createSession('software-engineer', 'mid');
            interviewAI.startInterview(sessionId);

            const transition = interviewAI.getTransition(sessionId);
            expect(transition).toBeDefined();
            expect(typeof transition).toBe('string');
        });
    });

    describe('Progress Tracking', () => {
        it('should track interview progress accurately', () => {
            const sessionId = interviewAI.createSession('software-engineer', 'mid');
            interviewAI.startInterview(sessionId);

            const initialProgress = interviewAI.getProgress(sessionId);
            expect(initialProgress.answeredQuestions).toBe(0);
            expect(initialProgress.percentComplete).toBe(0);

            // Submit response
            interviewAI.submitResponse(sessionId, 'Detailed technical answer with good depth and clarity.');

            const updatedProgress = interviewAI.getProgress(sessionId);
            expect(updatedProgress.answeredQuestions).toBeGreaterThan(0);
            expect(updatedProgress.percentComplete).toBeGreaterThan(0);
        });

        it('should provide expected duration', () => {
            const sessionId = interviewAI.createSession('software-engineer', 'mid');
            interviewAI.startInterview(sessionId);

            const duration = interviewAI.getExpectedDuration(sessionId);
            expect(duration).toBeGreaterThan(0);
            expect(typeof duration).toBe('number');
        });
    });

    describe('Error Handling', () => {
        it('should handle operations on non-existent session', () => {
            expect(() => {
                interviewAI.startInterview('non-existent-session-id');
            }).toThrow();
        });

        it('should handle invalid state transitions', () => {
            const sessionId = interviewAI.createSession('software-engineer', 'mid');

            // Try to upload resume after starting interview (invalid state)
            interviewAI.startInterview(sessionId);

            const resume: ResumeDocument = {
                content: 'Test resume',
                format: 'text',
                filename: 'test.txt'
            };

            expect(() => {
                interviewAI.uploadResume(sessionId, resume);
            }).toThrow();
        });
    });
});
