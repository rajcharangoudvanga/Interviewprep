import { SessionManager, SessionError, InvalidStateTransitionError } from './SessionManager';
import { InvalidRoleInputError } from '../models/RoleManager';
import { ResumeDocument } from '../models/types';

describe('SessionManager', () => {
    let sessionManager: SessionManager;

    beforeEach(() => {
        sessionManager = new SessionManager();
    });

    describe('createSession', () => {
        it('should create a session with valid role ID and experience level', () => {
            const sessionId = sessionManager.createSession('software-engineer', 'mid');
            expect(sessionId).toBeDefined();
            expect(typeof sessionId).toBe('string');
            expect(sessionId.length).toBeGreaterThan(0);
        });

        it('should create a session with valid role name and experience level', () => {
            const sessionId = sessionManager.createSession('Software Engineer', 'senior');
            expect(sessionId).toBeDefined();
            expect(typeof sessionId).toBe('string');
        });

        it('should create session in initialized state', () => {
            const sessionId = sessionManager.createSession('software-engineer', 'mid');
            const state = sessionManager.getSessionState(sessionId);
            expect(state.status).toBe('initialized');
        });

        it('should set role and experience level correctly', () => {
            const sessionId = sessionManager.createSession('software-engineer', 'mid');
            const state = sessionManager.getSessionState(sessionId);
            expect(state.role.id).toBe('software-engineer');
            expect(state.experienceLevel.level).toBe('mid');
        });

        it('should initialize empty questions and responses', () => {
            const sessionId = sessionManager.createSession('software-engineer', 'mid');
            const state = sessionManager.getSessionState(sessionId);
            expect(state.questions).toEqual([]);
            expect(state.responses.size).toBe(0);
            expect(state.evaluations.size).toBe(0);
        });

        it('should set default behavior type to standard', () => {
            const sessionId = sessionManager.createSession('software-engineer', 'mid');
            const state = sessionManager.getSessionState(sessionId);
            expect(state.behaviorType).toBe('standard');
        });

        it('should set default interaction mode to text', () => {
            const sessionId = sessionManager.createSession('software-engineer', 'mid');
            const state = sessionManager.getSessionState(sessionId);
            expect(state.interactionMode).toBe('text');
        });

        it('should allow setting voice interaction mode', () => {
            const sessionId = sessionManager.createSession('software-engineer', 'mid', 'voice');
            const state = sessionManager.getSessionState(sessionId);
            expect(state.interactionMode).toBe('voice');
        });

        it('should set start time', () => {
            const before = Date.now();
            const sessionId = sessionManager.createSession('software-engineer', 'mid');
            const after = Date.now();
            const state = sessionManager.getSessionState(sessionId);
            expect(state.startTime).toBeGreaterThanOrEqual(before);
            expect(state.startTime).toBeLessThanOrEqual(after);
        });

        it('should throw InvalidRoleInputError for invalid role', () => {
            expect(() => {
                sessionManager.createSession('invalid-role', 'mid');
            }).toThrow(InvalidRoleInputError);
        });

        it('should throw InvalidRoleInputError for invalid experience level', () => {
            expect(() => {
                sessionManager.createSession('software-engineer', 'invalid-level');
            }).toThrow(InvalidRoleInputError);
        });

        it('should handle case-insensitive role names', () => {
            const sessionId = sessionManager.createSession('software engineer', 'mid');
            const state = sessionManager.getSessionState(sessionId);
            expect(state.role.name).toBe('Software Engineer');
        });

        it('should handle case-insensitive experience levels', () => {
            const sessionId = sessionManager.createSession('software-engineer', 'MID');
            const state = sessionManager.getSessionState(sessionId);
            expect(state.experienceLevel.level).toBe('mid');
        });

        it('should generate unique session IDs', () => {
            const sessionId1 = sessionManager.createSession('software-engineer', 'mid');
            const sessionId2 = sessionManager.createSession('software-engineer', 'mid');
            expect(sessionId1).not.toBe(sessionId2);
        });
    });

    describe('uploadResume', () => {
        let sessionId: string;
        let sampleResume: ResumeDocument;

        beforeEach(() => {
            sessionId = sessionManager.createSession('software-engineer', 'mid');
            sampleResume = {
                content: `
                    John Doe
                    Software Engineer
                    
                    Skills:
                    Python, JavaScript, React, Node.js, SQL, AWS
                    
                    Experience:
                    Senior Software Engineer at Tech Corp
                    2020 - Present
                    - Built scalable web applications using React and Node.js
                    - Implemented CI/CD pipelines with AWS
                    
                    Projects:
                    E-commerce Platform
                    Built a full-stack e-commerce platform using React, Node.js, and PostgreSQL
                `,
                format: 'text',
                filename: 'resume.txt'
            };
        });

        it('should successfully upload and analyze resume', () => {
            const analysis = sessionManager.uploadResume(sessionId, sampleResume);
            expect(analysis).toBeDefined();
            expect(analysis.parsedResume).toBeDefined();
            expect(analysis.summary).toBeDefined();
        });

        it('should update session with resume analysis', () => {
            sessionManager.uploadResume(sessionId, sampleResume);
            const state = sessionManager.getSessionState(sessionId);
            expect(state.resumeAnalysis).toBeDefined();
            expect(state.resumeAnalysis?.parsedResume).toBeDefined();
        });

        it('should extract technical skills from resume', () => {
            const analysis = sessionManager.uploadResume(sessionId, sampleResume);
            expect(analysis.technicalSkills).toBeInstanceOf(Array);
            expect(analysis.technicalSkills.length).toBeGreaterThan(0);
        });

        it('should calculate alignment score', () => {
            const analysis = sessionManager.uploadResume(sessionId, sampleResume);
            expect(analysis.alignmentScore).toBeDefined();
            expect(analysis.alignmentScore.overall).toBeGreaterThanOrEqual(0);
            expect(analysis.alignmentScore.overall).toBeLessThanOrEqual(100);
        });

        it('should identify strengths and gaps', () => {
            const analysis = sessionManager.uploadResume(sessionId, sampleResume);
            expect(analysis.strengths).toBeInstanceOf(Array);
            expect(analysis.gaps).toBeInstanceOf(Array);
        });

        it('should throw error if session not found', () => {
            expect(() => {
                sessionManager.uploadResume('non-existent-session', sampleResume);
            }).toThrow(SessionError);
        });

        it('should throw InvalidStateTransitionError if not in initialized state', () => {
            sessionManager.startInterview(sessionId);
            expect(() => {
                sessionManager.uploadResume(sessionId, sampleResume);
            }).toThrow(InvalidStateTransitionError);
        });

        it('should handle malformed resume gracefully', () => {
            const malformedResume: ResumeDocument = {
                content: '',
                format: 'text',
                filename: 'empty.txt'
            };

            // Should not throw, but return minimal analysis
            const analysis = sessionManager.uploadResume(sessionId, malformedResume);
            expect(analysis).toBeDefined();
            expect(analysis.alignmentScore.overall).toBeDefined();
            // Empty resume should have low alignment
            expect(analysis.alignmentScore.overall).toBeLessThanOrEqual(20);
        });
    });

    describe('startInterview', () => {
        let sessionId: string;

        beforeEach(() => {
            sessionId = sessionManager.createSession('software-engineer', 'mid');
        });

        it('should transition session to in-progress state', () => {
            sessionManager.startInterview(sessionId);
            const state = sessionManager.getSessionState(sessionId);
            expect(state.status).toBe('in-progress');
        });

        it('should update start time', () => {
            const before = Date.now();
            sessionManager.startInterview(sessionId);
            const after = Date.now();
            const state = sessionManager.getSessionState(sessionId);
            expect(state.startTime).toBeGreaterThanOrEqual(before);
            expect(state.startTime).toBeLessThanOrEqual(after);
        });

        it('should throw error if session not found', () => {
            expect(() => {
                sessionManager.startInterview('non-existent-session');
            }).toThrow(SessionError);
        });

        it('should throw InvalidStateTransitionError if already in progress', () => {
            sessionManager.startInterview(sessionId);
            expect(() => {
                sessionManager.startInterview(sessionId);
            }).toThrow(InvalidStateTransitionError);
        });
    });

    describe('endInterview', () => {
        let sessionId: string;

        beforeEach(() => {
            sessionId = sessionManager.createSession('software-engineer', 'mid');
            sessionManager.startInterview(sessionId);
        });

        it('should transition session to completed state', () => {
            sessionManager.endInterview(sessionId, false);
            const state = sessionManager.getSessionState(sessionId);
            expect(state.status).toBe('completed');
        });

        it('should transition session to ended-early state when early flag is true', () => {
            sessionManager.endInterview(sessionId, true);
            const state = sessionManager.getSessionState(sessionId);
            expect(state.status).toBe('ended-early');
        });

        it('should set end time', () => {
            const before = Date.now();
            sessionManager.endInterview(sessionId, false);
            const after = Date.now();
            const state = sessionManager.getSessionState(sessionId);
            expect(state.endTime).toBeDefined();
            expect(state.endTime!).toBeGreaterThanOrEqual(before);
            expect(state.endTime!).toBeLessThanOrEqual(after);
        });

        it('should throw error if session not found', () => {
            expect(() => {
                sessionManager.endInterview('non-existent-session', false);
            }).toThrow(SessionError);
        });

        it('should throw InvalidStateTransitionError if not in progress', () => {
            const newSessionId = sessionManager.createSession('software-engineer', 'mid');
            expect(() => {
                sessionManager.endInterview(newSessionId, false);
            }).toThrow(InvalidStateTransitionError);
        });
    });

    describe('getSessionState', () => {
        it('should return session state for valid session', () => {
            const sessionId = sessionManager.createSession('software-engineer', 'mid');
            const state = sessionManager.getSessionState(sessionId);
            expect(state).toBeDefined();
            expect(state.sessionId).toBe(sessionId);
        });

        it('should throw error if session not found', () => {
            expect(() => {
                sessionManager.getSessionState('non-existent-session');
            }).toThrow(SessionError);
        });

        it('should return current state with all properties', () => {
            const sessionId = sessionManager.createSession('software-engineer', 'mid');
            const state = sessionManager.getSessionState(sessionId);
            expect(state).toHaveProperty('sessionId');
            expect(state).toHaveProperty('role');
            expect(state).toHaveProperty('experienceLevel');
            expect(state).toHaveProperty('questions');
            expect(state).toHaveProperty('responses');
            expect(state).toHaveProperty('evaluations');
            expect(state).toHaveProperty('behaviorType');
            expect(state).toHaveProperty('startTime');
            expect(state).toHaveProperty('status');
        });
    });

    describe('updateQuestions', () => {
        let sessionId: string;

        beforeEach(() => {
            sessionId = sessionManager.createSession('software-engineer', 'mid');
        });

        it('should update session questions', () => {
            const questions = [
                {
                    id: 'q1',
                    type: 'technical' as const,
                    text: 'What is a closure?',
                    category: 'JavaScript',
                    difficulty: 5
                }
            ];
            sessionManager.updateQuestions(sessionId, questions);
            const state = sessionManager.getSessionState(sessionId);
            expect(state.questions).toEqual(questions);
        });

        it('should throw error if session not found', () => {
            expect(() => {
                sessionManager.updateQuestions('non-existent-session', []);
            }).toThrow(SessionError);
        });
    });

    describe('addResponse', () => {
        let sessionId: string;

        beforeEach(() => {
            sessionId = sessionManager.createSession('software-engineer', 'mid');
            sessionManager.startInterview(sessionId);
        });

        it('should add response to session', () => {
            const response = {
                questionId: 'q1',
                text: 'A closure is...',
                timestamp: Date.now(),
                wordCount: 10,
                responseTime: 30000
            };
            sessionManager.addResponse(sessionId, response);
            const state = sessionManager.getSessionState(sessionId);
            expect(state.responses.get('q1')).toEqual(response);
        });

        it('should throw error if session not found', () => {
            const response = {
                questionId: 'q1',
                text: 'Answer',
                timestamp: Date.now(),
                wordCount: 1,
                responseTime: 1000
            };
            expect(() => {
                sessionManager.addResponse('non-existent-session', response);
            }).toThrow(SessionError);
        });

        it('should throw InvalidStateTransitionError if not in progress', () => {
            const newSessionId = sessionManager.createSession('software-engineer', 'mid');
            const response = {
                questionId: 'q1',
                text: 'Answer',
                timestamp: Date.now(),
                wordCount: 1,
                responseTime: 1000
            };
            expect(() => {
                sessionManager.addResponse(newSessionId, response);
            }).toThrow(InvalidStateTransitionError);
        });
    });

    describe('addEvaluation', () => {
        let sessionId: string;

        beforeEach(() => {
            sessionId = sessionManager.createSession('software-engineer', 'mid');
            sessionManager.startInterview(sessionId);
        });

        it('should add evaluation to session', () => {
            const evaluation = {
                questionId: 'q1',
                depthScore: 8,
                clarityScore: 7,
                completenessScore: 9,
                needsFollowUp: false
            };
            sessionManager.addEvaluation(sessionId, evaluation);
            const state = sessionManager.getSessionState(sessionId);
            expect(state.evaluations.get('q1')).toEqual(evaluation);
        });

        it('should throw error if session not found', () => {
            const evaluation = {
                questionId: 'q1',
                depthScore: 8,
                clarityScore: 7,
                completenessScore: 9,
                needsFollowUp: false
            };
            expect(() => {
                sessionManager.addEvaluation('non-existent-session', evaluation);
            }).toThrow(SessionError);
        });

        it('should throw InvalidStateTransitionError if not in progress', () => {
            const newSessionId = sessionManager.createSession('software-engineer', 'mid');
            const evaluation = {
                questionId: 'q1',
                depthScore: 8,
                clarityScore: 7,
                completenessScore: 9,
                needsFollowUp: false
            };
            expect(() => {
                sessionManager.addEvaluation(newSessionId, evaluation);
            }).toThrow(InvalidStateTransitionError);
        });
    });

    describe('updateBehaviorType', () => {
        let sessionId: string;

        beforeEach(() => {
            sessionId = sessionManager.createSession('software-engineer', 'mid');
        });

        it('should update behavior type', () => {
            sessionManager.updateBehaviorType(sessionId, 'confused');
            const state = sessionManager.getSessionState(sessionId);
            expect(state.behaviorType).toBe('confused');
        });

        it('should handle all behavior types', () => {
            const behaviorTypes: Array<'confused' | 'efficient' | 'chatty' | 'edge-case' | 'standard'> =
                ['confused', 'efficient', 'chatty', 'edge-case', 'standard'];

            behaviorTypes.forEach(type => {
                sessionManager.updateBehaviorType(sessionId, type);
                const state = sessionManager.getSessionState(sessionId);
                expect(state.behaviorType).toBe(type);
            });
        });

        it('should throw error if session not found', () => {
            expect(() => {
                sessionManager.updateBehaviorType('non-existent-session', 'confused');
            }).toThrow(SessionError);
        });
    });

    describe('sessionExists', () => {
        it('should return true for existing session', () => {
            const sessionId = sessionManager.createSession('software-engineer', 'mid');
            expect(sessionManager.sessionExists(sessionId)).toBe(true);
        });

        it('should return false for non-existent session', () => {
            expect(sessionManager.sessionExists('non-existent-session')).toBe(false);
        });
    });

    describe('deleteSession', () => {
        it('should delete existing session', () => {
            const sessionId = sessionManager.createSession('software-engineer', 'mid');
            expect(sessionManager.sessionExists(sessionId)).toBe(true);
            sessionManager.deleteSession(sessionId);
            expect(sessionManager.sessionExists(sessionId)).toBe(false);
        });

        it('should not throw error for non-existent session', () => {
            expect(() => {
                sessionManager.deleteSession('non-existent-session');
            }).not.toThrow();
        });
    });

    describe('getActiveSessions', () => {
        it('should return empty array when no sessions exist', () => {
            const sessions = sessionManager.getActiveSessions();
            expect(sessions).toEqual([]);
        });

        it('should return all active session IDs', () => {
            const sessionId1 = sessionManager.createSession('software-engineer', 'mid');
            const sessionId2 = sessionManager.createSession('product-manager', 'senior');
            const sessions = sessionManager.getActiveSessions();
            expect(sessions).toContain(sessionId1);
            expect(sessions).toContain(sessionId2);
            expect(sessions.length).toBe(2);
        });

        it('should not include deleted sessions', () => {
            const sessionId1 = sessionManager.createSession('software-engineer', 'mid');
            const sessionId2 = sessionManager.createSession('product-manager', 'senior');
            sessionManager.deleteSession(sessionId1);
            const sessions = sessionManager.getActiveSessions();
            expect(sessions).not.toContain(sessionId1);
            expect(sessions).toContain(sessionId2);
            expect(sessions.length).toBe(1);
        });
    });

    describe('getRoleManager', () => {
        it('should return role manager instance', () => {
            const roleManager = sessionManager.getRoleManager();
            expect(roleManager).toBeDefined();
            expect(roleManager.getAvailableRoles).toBeDefined();
            expect(roleManager.getAvailableExperienceLevels).toBeDefined();
        });
    });

    describe('session lifecycle', () => {
        it('should support complete session lifecycle', () => {
            // Create session
            const sessionId = sessionManager.createSession('software-engineer', 'mid');
            let state = sessionManager.getSessionState(sessionId);
            expect(state.status).toBe('initialized');

            // Upload resume
            const resume: ResumeDocument = {
                content: 'Skills: Python, JavaScript',
                format: 'text',
                filename: 'resume.txt'
            };
            sessionManager.uploadResume(sessionId, resume);
            state = sessionManager.getSessionState(sessionId);
            expect(state.resumeAnalysis).toBeDefined();

            // Start interview
            sessionManager.startInterview(sessionId);
            state = sessionManager.getSessionState(sessionId);
            expect(state.status).toBe('in-progress');

            // Add questions
            const questions = [
                {
                    id: 'q1',
                    type: 'technical' as const,
                    text: 'Question 1',
                    category: 'Coding',
                    difficulty: 5
                }
            ];
            sessionManager.updateQuestions(sessionId, questions);

            // Add response
            const response = {
                questionId: 'q1',
                text: 'My answer',
                timestamp: Date.now(),
                wordCount: 2,
                responseTime: 5000
            };
            sessionManager.addResponse(sessionId, response);

            // Add evaluation
            const evaluation = {
                questionId: 'q1',
                depthScore: 8,
                clarityScore: 7,
                completenessScore: 9,
                needsFollowUp: false
            };
            sessionManager.addEvaluation(sessionId, evaluation);

            // Update behavior
            sessionManager.updateBehaviorType(sessionId, 'efficient');

            // End interview
            sessionManager.endInterview(sessionId, false);
            state = sessionManager.getSessionState(sessionId);
            expect(state.status).toBe('completed');
            expect(state.endTime).toBeDefined();
        });
    });
});
