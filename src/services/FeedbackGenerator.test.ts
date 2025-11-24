import { FeedbackGenerator } from './FeedbackGenerator';
import {
    SessionState,
    CandidateResponse,
    ResponseEvaluation,
    JobRole,
    ExperienceLevel,
    InterviewQuestion,
    ResumeAnalysis,
    QuestionId
} from '../models/types';

describe('FeedbackGenerator', () => {
    let generator: FeedbackGenerator;
    let mockRole: JobRole;
    let mockLevel: ExperienceLevel;

    beforeEach(() => {
        generator = new FeedbackGenerator();

        mockRole = {
            id: 'software-engineer',
            name: 'Software Engineer',
            technicalSkills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'SQL'],
            behavioralCompetencies: ['teamwork', 'communication', 'problem-solving'],
            questionCategories: [
                { name: 'algorithms', weight: 0.3, technicalFocus: true },
                { name: 'system design', weight: 0.3, technicalFocus: true },
                { name: 'behavioral', weight: 0.4, technicalFocus: false }
            ]
        };

        mockLevel = {
            level: 'mid',
            yearsMin: 3,
            yearsMax: 6,
            expectedDepth: 7
        };
    });

    describe('generateFeedback', () => {
        it('should generate complete feedback report for a session', () => {
            const session = createMockSession();
            const feedback = generator.generateFeedback(session);

            expect(feedback).toBeDefined();
            expect(feedback.sessionId).toBe(session.sessionId);
            expect(feedback.scores).toBeDefined();
            expect(feedback.scores.communication).toBeDefined();
            expect(feedback.scores.technicalFit).toBeDefined();
            expect(feedback.scores.overall).toBeDefined();
            expect(feedback.strengths).toBeDefined();
            expect(feedback.improvements).toBeDefined();
            expect(feedback.questionBreakdown).toBeDefined();
            expect(feedback.summary).toBeDefined();
        });

        it('should include resume alignment when resume is provided', () => {
            const session = createMockSession(true);
            const feedback = generator.generateFeedback(session);

            expect(feedback.resumeAlignment).toBeDefined();
            expect(feedback.resumeAlignment!.alignmentScore).toBeGreaterThanOrEqual(0);
            expect(feedback.resumeAlignment!.alignmentScore).toBeLessThanOrEqual(100);
        });

        it('should not include resume alignment when no resume provided', () => {
            const session = createMockSession(false);
            const feedback = generator.generateFeedback(session);

            expect(feedback.resumeAlignment).toBeUndefined();
        });
    });

    describe('scoreCommunication', () => {
        it('should calculate communication scores with all components', () => {
            const responses = createMockResponses();
            const evaluations = createMockEvaluations();

            const score = generator.scoreCommunication(responses, evaluations);

            expect(score.clarity).toBeGreaterThanOrEqual(0);
            expect(score.clarity).toBeLessThanOrEqual(10);
            expect(score.articulation).toBeGreaterThanOrEqual(0);
            expect(score.articulation).toBeLessThanOrEqual(10);
            expect(score.structure).toBeGreaterThanOrEqual(0);
            expect(score.structure).toBeLessThanOrEqual(10);
            expect(score.professionalism).toBeGreaterThanOrEqual(0);
            expect(score.professionalism).toBeLessThanOrEqual(10);
            expect(score.total).toBe(
                score.clarity + score.articulation + score.structure + score.professionalism
            );
            expect(score.total).toBeGreaterThanOrEqual(0);
            expect(score.total).toBeLessThanOrEqual(40);
            expect(['A', 'B', 'C', 'D', 'F']).toContain(score.grade);
        });

        it('should return empty score for no responses', () => {
            const score = generator.scoreCommunication([], []);

            expect(score.total).toBe(0);
            expect(score.grade).toBe('F');
        });

        it('should assign grade A for high scores', () => {
            const responses = createHighQualityResponses();
            const evaluations = createHighQualityEvaluations();

            const score = generator.scoreCommunication(responses, evaluations);

            expect(score.total).toBeGreaterThanOrEqual(32); // >= 80% of 40
            expect(score.grade).toMatch(/[AB]/);
        });
    });

    describe('scoreTechnicalFit', () => {
        it('should calculate technical scores with all components', () => {
            const responses = createMockResponses();
            const evaluations = createMockEvaluations();

            const score = generator.scoreTechnicalFit(responses, evaluations, mockRole, mockLevel);

            expect(score.depth).toBeGreaterThanOrEqual(0);
            expect(score.depth).toBeLessThanOrEqual(10);
            expect(score.accuracy).toBeGreaterThanOrEqual(0);
            expect(score.accuracy).toBeLessThanOrEqual(10);
            expect(score.relevance).toBeGreaterThanOrEqual(0);
            expect(score.relevance).toBeLessThanOrEqual(10);
            expect(score.problemSolving).toBeGreaterThanOrEqual(0);
            expect(score.problemSolving).toBeLessThanOrEqual(10);
            expect(score.total).toBe(
                score.depth + score.accuracy + score.relevance + score.problemSolving
            );
            expect(score.total).toBeGreaterThanOrEqual(0);
            expect(score.total).toBeLessThanOrEqual(40);
            expect(['A', 'B', 'C', 'D', 'F']).toContain(score.grade);
        });

        it('should return empty score for no responses', () => {
            const score = generator.scoreTechnicalFit([], [], mockRole, mockLevel);

            expect(score.total).toBe(0);
            expect(score.grade).toBe('F');
        });

        it('should score higher when responses mention role-specific skills', () => {
            const responses = createRoleSpecificResponses(mockRole);
            const evaluations = createMockEvaluations();

            const score = generator.scoreTechnicalFit(responses, evaluations, mockRole, mockLevel);

            expect(score.relevance).toBeGreaterThan(5);
        });
    });

    describe('calculateOverallScore', () => {
        it('should calculate weighted overall score correctly', () => {
            const commScore = {
                clarity: 8,
                articulation: 7,
                structure: 8,
                professionalism: 9,
                total: 32,
                grade: 'B' as const
            };

            const techScore = {
                depth: 7,
                accuracy: 8,
                relevance: 7,
                problemSolving: 8,
                total: 30,
                grade: 'B' as const
            };

            const overall = generator.calculateOverallScore(commScore, techScore);

            expect(overall.communicationWeight).toBe(0.4);
            expect(overall.technicalWeight).toBe(0.6);
            expect(overall.weightedTotal).toBeGreaterThanOrEqual(0);
            expect(overall.weightedTotal).toBeLessThanOrEqual(100);
            expect(['A', 'B', 'C', 'D', 'F']).toContain(overall.grade);

            // Verify calculation
            const commPercentage = (32 / 40) * 100;
            const techPercentage = (30 / 40) * 100;
            const expected = (commPercentage * 0.4) + (techPercentage * 0.6);
            expect(overall.weightedTotal).toBeCloseTo(expected, 1);
        });

        it('should assign correct grades based on thresholds', () => {
            const testCases = [
                { total: 36, expectedGrade: 'A' }, // 90%
                { total: 32, expectedGrade: 'B' }, // 80%
                { total: 28, expectedGrade: 'C' }, // 70%
                { total: 24, expectedGrade: 'D' }, // 60%
                { total: 20, expectedGrade: 'F' }  // 50%
            ];

            for (const testCase of testCases) {
                const commScore = {
                    clarity: testCase.total / 4,
                    articulation: testCase.total / 4,
                    structure: testCase.total / 4,
                    professionalism: testCase.total / 4,
                    total: testCase.total,
                    grade: 'C' as const
                };

                const techScore = {
                    depth: testCase.total / 4,
                    accuracy: testCase.total / 4,
                    relevance: testCase.total / 4,
                    problemSolving: testCase.total / 4,
                    total: testCase.total,
                    grade: 'C' as const
                };

                const overall = generator.calculateOverallScore(commScore, techScore);
                expect(overall.grade).toBe(testCase.expectedGrade);
            }
        });
    });

    describe('generateImprovements', () => {
        it('should generate improvements for weak areas', () => {
            const session = createMockSession();
            const scores = {
                communication: {
                    clarity: 5,
                    articulation: 6,
                    structure: 5,
                    professionalism: 8,
                    total: 24,
                    grade: 'D' as const
                },
                technicalFit: {
                    depth: 5,
                    accuracy: 6,
                    relevance: 5,
                    problemSolving: 6,
                    total: 22,
                    grade: 'F' as const
                },
                overall: {
                    communicationWeight: 0.4,
                    technicalWeight: 0.6,
                    weightedTotal: 57.5,
                    grade: 'F' as const
                }
            };
            const evaluations = createMockEvaluations();

            const improvements = generator.generateImprovements(session, scores, evaluations);

            expect(improvements.length).toBeGreaterThan(0);
            expect(improvements.every(i => i.category)).toBe(true);
            expect(improvements.every(i => i.observation)).toBe(true);
            expect(improvements.every(i => i.suggestion)).toBe(true);
            expect(improvements.every(i => ['high', 'medium', 'low'].includes(i.priority))).toBe(true);
        });

        it('should prioritize high-impact improvements', () => {
            const session = createMockSession();
            const scores = {
                communication: {
                    clarity: 4,
                    articulation: 8,
                    structure: 4,
                    professionalism: 8,
                    total: 24,
                    grade: 'D' as const
                },
                technicalFit: {
                    depth: 4,
                    accuracy: 4,
                    relevance: 8,
                    problemSolving: 8,
                    total: 24,
                    grade: 'D' as const
                },
                overall: {
                    communicationWeight: 0.4,
                    technicalWeight: 0.6,
                    weightedTotal: 60,
                    grade: 'D' as const
                }
            };
            const evaluations = createMockEvaluations();

            const improvements = generator.generateImprovements(session, scores, evaluations);
            const highPriority = improvements.filter(i => i.priority === 'high');

            expect(highPriority.length).toBeGreaterThan(0);
        });

        it('should suggest improvement when many follow-ups needed', () => {
            const session = createMockSession();
            const scores = {
                communication: {
                    clarity: 7,
                    articulation: 7,
                    structure: 7,
                    professionalism: 7,
                    total: 28,
                    grade: 'C' as const
                },
                technicalFit: {
                    depth: 7,
                    accuracy: 7,
                    relevance: 7,
                    problemSolving: 7,
                    total: 28,
                    grade: 'C' as const
                },
                overall: {
                    communicationWeight: 0.4,
                    technicalWeight: 0.6,
                    weightedTotal: 70,
                    grade: 'C' as const
                }
            };
            const evaluations = createMockEvaluations().map(e => ({
                ...e,
                needsFollowUp: true
            }));

            const improvements = generator.generateImprovements(session, scores, evaluations);
            const completenessImprovement = improvements.find(i =>
                i.category.includes('Completeness')
            );

            expect(completenessImprovement).toBeDefined();
        });
    });

    describe('evaluateResumeAlignment', () => {
        it('should evaluate resume alignment with interview performance', () => {
            const resumeAnalysis = createMockResumeAnalysis();
            const evaluations = createMockEvaluations();
            const responses = createMockResponses();

            const alignment = generator.evaluateResumeAlignment(
                resumeAnalysis,
                evaluations,
                responses
            );

            expect(alignment.alignmentScore).toBeGreaterThanOrEqual(0);
            expect(alignment.alignmentScore).toBeLessThanOrEqual(100);
            expect(Array.isArray(alignment.matchedSkills)).toBe(true);
            expect(Array.isArray(alignment.missingSkills)).toBe(true);
            expect(Array.isArray(alignment.experienceGaps)).toBe(true);
            expect(Array.isArray(alignment.suggestions)).toBe(true);
            expect(alignment.suggestions.length).toBeGreaterThan(0);
        });

        it('should identify matched skills mentioned in responses with good performance', () => {
            const resumeAnalysis = createMockResumeAnalysis();
            const evaluations: ResponseEvaluation[] = [{
                questionId: 'q1',
                depthScore: 8,
                clarityScore: 8,
                completenessScore: 8,
                needsFollowUp: false,
                technicalAccuracy: 8
            }];
            const responses: CandidateResponse[] = [{
                questionId: 'q1',
                text: 'I have experience with JavaScript and React for building web applications. I used React hooks and context API extensively.',
                timestamp: Date.now(),
                wordCount: 20,
                responseTime: 60000
            }];

            const alignment = generator.evaluateResumeAlignment(
                resumeAnalysis,
                evaluations,
                responses
            );

            expect(alignment.matchedSkills.length).toBeGreaterThan(0);
            const matchedSkillNames = alignment.matchedSkills.map(s => s.name.toLowerCase());
            expect(matchedSkillNames.some(name => name.includes('javascript') || name.includes('react'))).toBe(true);
        });

        it('should not count skills as matched if mentioned but performance was poor', () => {
            const resumeAnalysis = createMockResumeAnalysis();
            const evaluations: ResponseEvaluation[] = [{
                questionId: 'q1',
                depthScore: 3,
                clarityScore: 4,
                completenessScore: 3,
                needsFollowUp: true,
                technicalAccuracy: 3
            }];
            const responses: CandidateResponse[] = [{
                questionId: 'q1',
                text: 'I know JavaScript and React',
                timestamp: Date.now(),
                wordCount: 5,
                responseTime: 30000
            }];

            const alignment = generator.evaluateResumeAlignment(
                resumeAnalysis,
                evaluations,
                responses
            );

            // Skills mentioned but not demonstrated with sufficient depth
            expect(alignment.matchedSkills.length).toBe(0);
        });

        it('should identify experience gaps when interview performance is weak', () => {
            const resumeAnalysis = createMockResumeAnalysis();
            const evaluations: ResponseEvaluation[] = [
                {
                    questionId: 'q1',
                    depthScore: 4,
                    clarityScore: 5,
                    completenessScore: 4,
                    needsFollowUp: true,
                    technicalAccuracy: 4
                },
                {
                    questionId: 'q2',
                    depthScore: 5,
                    clarityScore: 5,
                    completenessScore: 4,
                    needsFollowUp: true,
                    technicalAccuracy: 5
                }
            ];
            const responses = createMockResponses();

            const alignment = generator.evaluateResumeAlignment(
                resumeAnalysis,
                evaluations,
                responses
            );

            expect(alignment.experienceGaps.length).toBeGreaterThan(0);
            const gapsText = alignment.experienceGaps.join(' ').toLowerCase();
            expect(gapsText).toContain('technical');
        });

        it('should provide actionable suggestions based on alignment score', () => {
            const resumeAnalysis = {
                ...createMockResumeAnalysis(),
                alignmentScore: {
                    overall: 45,
                    technical: 40,
                    experience: 50,
                    cultural: 50
                }
            };
            const evaluations = createMockEvaluations();
            const responses = createMockResponses();

            const alignment = generator.evaluateResumeAlignment(
                resumeAnalysis,
                evaluations,
                responses
            );

            expect(alignment.suggestions.length).toBeGreaterThan(0);
            const suggestionsText = alignment.suggestions.join(' ').toLowerCase();
            expect(suggestionsText).toContain('alignment');
        });

        it('should suggest highlighting demonstrated skills', () => {
            const resumeAnalysis = createMockResumeAnalysis();
            const evaluations: ResponseEvaluation[] = [{
                questionId: 'q1',
                depthScore: 9,
                clarityScore: 9,
                completenessScore: 9,
                needsFollowUp: false,
                technicalAccuracy: 9
            }];
            const responses: CandidateResponse[] = [{
                questionId: 'q1',
                text: 'I have deep experience with JavaScript, using it for complex async operations and performance optimization',
                timestamp: Date.now(),
                wordCount: 16,
                responseTime: 90000
            }];

            const alignment = generator.evaluateResumeAlignment(
                resumeAnalysis,
                evaluations,
                responses
            );

            expect(alignment.matchedSkills.length).toBeGreaterThan(0);
            const suggestionsText = alignment.suggestions.join(' ').toLowerCase();
            expect(suggestionsText).toContain('demonstrated');
        });

        it('should identify unverified skills and suggest action', () => {
            const resumeAnalysis = {
                ...createMockResumeAnalysis(),
                technicalSkills: [
                    { name: 'JavaScript', category: 'programming' },
                    { name: 'Python', category: 'programming' },
                    { name: 'Kubernetes', category: 'cloud' }
                ]
            };
            const evaluations: ResponseEvaluation[] = [{
                questionId: 'q1',
                depthScore: 8,
                clarityScore: 8,
                completenessScore: 8,
                needsFollowUp: false,
                technicalAccuracy: 8
            }];
            const responses: CandidateResponse[] = [{
                questionId: 'q1',
                text: 'I primarily work with JavaScript for frontend development',
                timestamp: Date.now(),
                wordCount: 9,
                responseTime: 60000
            }];

            const alignment = generator.evaluateResumeAlignment(
                resumeAnalysis,
                evaluations,
                responses
            );

            // Only JavaScript should be matched
            expect(alignment.matchedSkills.length).toBeLessThan(resumeAnalysis.technicalSkills.length);
            const suggestionsText = alignment.suggestions.join(' ').toLowerCase();
            expect(suggestionsText).toContain('not demonstrated');
        });

        it('should provide suggestions for missing critical skills', () => {
            const resumeAnalysis = {
                ...createMockResumeAnalysis(),
                gaps: [
                    {
                        skill: 'Docker',
                        importance: 9,
                        suggestion: 'Consider learning containerization with Docker'
                    },
                    {
                        skill: 'AWS',
                        importance: 8,
                        suggestion: 'Gain cloud platform experience'
                    }
                ]
            };
            const evaluations = createMockEvaluations();
            const responses = createMockResponses();

            const alignment = generator.evaluateResumeAlignment(
                resumeAnalysis,
                evaluations,
                responses
            );

            expect(alignment.missingSkills.length).toBeGreaterThan(0);
            const suggestionsText = alignment.suggestions.join(' ').toLowerCase();
            expect(suggestionsText).toContain('missing');
        });
    });

    // Helper functions

    function createMockSession(includeResume: boolean = false): SessionState {
        const responses = new Map<QuestionId, CandidateResponse>();
        const evaluations = new Map<QuestionId, ResponseEvaluation>();

        const mockResponses = createMockResponses();
        const mockEvaluations = createMockEvaluations();

        mockResponses.forEach(r => responses.set(r.questionId, r));
        mockEvaluations.forEach(e => evaluations.set(e.questionId, e));

        return {
            sessionId: 'test-session-1',
            role: mockRole,
            experienceLevel: mockLevel,
            resumeAnalysis: includeResume ? createMockResumeAnalysis() : undefined,
            questions: createMockQuestions(),
            responses,
            evaluations,
            behaviorType: 'standard',
            interactionMode: 'text',
            startTime: Date.now() - 3600000,
            endTime: Date.now(),
            status: 'completed'
        };
    }

    function createMockQuestions(): InterviewQuestion[] {
        return [
            {
                id: 'q1',
                type: 'technical',
                text: 'Explain how closures work in JavaScript',
                category: 'javascript',
                difficulty: 5
            },
            {
                id: 'q2',
                type: 'behavioral',
                text: 'Tell me about a time you solved a difficult problem',
                category: 'problem-solving',
                difficulty: 4
            },
            {
                id: 'q3',
                type: 'technical',
                text: 'How would you design a scalable API?',
                category: 'system design',
                difficulty: 7
            }
        ];
    }

    function createMockResponses(): CandidateResponse[] {
        return [
            {
                questionId: 'q1',
                text: 'Closures in JavaScript are functions that have access to variables from their outer scope. They allow for data encapsulation and are commonly used in callbacks and event handlers.',
                timestamp: Date.now(),
                wordCount: 30,
                responseTime: 120000
            },
            {
                questionId: 'q2',
                text: 'In my previous role, I encountered a performance issue with our database queries. First, I analyzed the slow queries using profiling tools. Then, I optimized the indexes and rewrote some queries. Finally, the response time improved by 60%.',
                timestamp: Date.now(),
                wordCount: 40,
                responseTime: 180000
            },
            {
                questionId: 'q3',
                text: 'For a scalable API, I would use a microservices architecture with load balancing. I would implement caching with Redis, use a message queue for async operations, and ensure proper authentication and rate limiting.',
                timestamp: Date.now(),
                wordCount: 35,
                responseTime: 150000
            }
        ];
    }

    function createMockEvaluations(): ResponseEvaluation[] {
        return [
            {
                questionId: 'q1',
                depthScore: 7,
                clarityScore: 8,
                completenessScore: 7,
                needsFollowUp: false,
                technicalAccuracy: 8
            },
            {
                questionId: 'q2',
                depthScore: 8,
                clarityScore: 9,
                completenessScore: 8,
                needsFollowUp: false
            },
            {
                questionId: 'q3',
                depthScore: 7,
                clarityScore: 7,
                completenessScore: 7,
                needsFollowUp: false,
                technicalAccuracy: 7
            }
        ];
    }

    function createHighQualityResponses(): CandidateResponse[] {
        return [
            {
                questionId: 'q1',
                text: 'First, let me explain the concept of closures. A closure is a function that retains access to variables from its lexical scope even after the outer function has returned. For example, when you create a function inside another function, the inner function forms a closure. This is particularly useful for data privacy and creating factory functions. In practice, closures are fundamental to JavaScript patterns like the module pattern and are extensively used in callbacks and event handlers.',
                timestamp: Date.now(),
                wordCount: 80,
                responseTime: 180000
            }
        ];
    }

    function createHighQualityEvaluations(): ResponseEvaluation[] {
        return [
            {
                questionId: 'q1',
                depthScore: 9,
                clarityScore: 9,
                completenessScore: 9,
                needsFollowUp: false,
                technicalAccuracy: 9
            }
        ];
    }

    function createRoleSpecificResponses(role: JobRole): CandidateResponse[] {
        const skillsText = role.technicalSkills.slice(0, 3).join(', ');
        return [
            {
                questionId: 'q1',
                text: `I have extensive experience with ${skillsText}. I've used these technologies to build scalable applications.`,
                timestamp: Date.now(),
                wordCount: 20,
                responseTime: 120000
            }
        ];
    }

    function createMockResumeAnalysis(): ResumeAnalysis {
        return {
            parsedResume: {
                rawText: 'Sample resume text',
                sections: new Map([['experience', 'Software Engineer at Tech Corp']]),
                metadata: {
                    parsedAt: Date.now(),
                    format: 'text'
                }
            },
            strengths: [
                {
                    area: 'Web Development',
                    evidence: ['Built React applications', 'Node.js backend'],
                    relevance: 9
                }
            ],
            technicalSkills: [
                { name: 'JavaScript', category: 'programming' },
                { name: 'React', category: 'framework' },
                { name: 'Node.js', category: 'runtime' }
            ],
            gaps: [
                {
                    skill: 'Kubernetes',
                    importance: 7,
                    suggestion: 'Consider learning container orchestration'
                }
            ],
            alignmentScore: {
                overall: 75,
                technical: 80,
                experience: 70,
                cultural: 75
            },
            summary: 'Strong technical background with web development focus'
        };
    }
});
