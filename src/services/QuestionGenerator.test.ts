import { DefaultQuestionGenerator } from './QuestionGenerator';
import { JobRole, ExperienceLevel, ResumeAnalysis, Skill, Strength, ParsedResume } from '../models/types';

describe('DefaultQuestionGenerator', () => {
    let generator: DefaultQuestionGenerator;

    beforeEach(() => {
        generator = new DefaultQuestionGenerator();
    });

    describe('generateQuestionSet', () => {
        it('should generate between 5 and 10 questions', () => {
            const role: JobRole = {
                id: 'software-engineer',
                name: 'Software Engineer',
                technicalSkills: ['JavaScript', 'TypeScript'],
                behavioralCompetencies: ['Problem Solving', 'Collaboration'],
                questionCategories: [
                    { name: 'Coding', weight: 0.5, technicalFocus: true },
                    { name: 'Behavioral', weight: 0.5, technicalFocus: false }
                ]
            };

            const level: ExperienceLevel = {
                level: 'mid',
                yearsMin: 2,
                yearsMax: 5,
                expectedDepth: 6
            };

            const questions = generator.generateQuestionSet(role, level);

            expect(questions.length).toBeGreaterThanOrEqual(5);
            expect(questions.length).toBeLessThanOrEqual(10);
        });

        it('should include both technical and behavioral questions', () => {
            const role: JobRole = {
                id: 'software-engineer',
                name: 'Software Engineer',
                technicalSkills: ['JavaScript'],
                behavioralCompetencies: ['Problem Solving'],
                questionCategories: [
                    { name: 'Coding', weight: 0.5, technicalFocus: true },
                    { name: 'Behavioral', weight: 0.5, technicalFocus: false }
                ]
            };

            const level: ExperienceLevel = {
                level: 'mid',
                yearsMin: 2,
                yearsMax: 5,
                expectedDepth: 6
            };

            const questions = generator.generateQuestionSet(role, level);

            const technicalQuestions = questions.filter(q => q.type === 'technical');
            const behavioralQuestions = questions.filter(q => q.type === 'behavioral');

            expect(technicalQuestions.length).toBeGreaterThan(0);
            expect(behavioralQuestions.length).toBeGreaterThan(0);
        });

        it('should generate resume-aware questions when resume is provided', () => {
            const role: JobRole = {
                id: 'software-engineer',
                name: 'Software Engineer',
                technicalSkills: ['JavaScript'],
                behavioralCompetencies: ['Problem Solving'],
                questionCategories: [
                    { name: 'Coding', weight: 0.5, technicalFocus: true },
                    { name: 'Behavioral', weight: 0.5, technicalFocus: false }
                ]
            };

            const level: ExperienceLevel = {
                level: 'mid',
                yearsMin: 2,
                yearsMax: 5,
                expectedDepth: 6
            };

            const skills: Skill[] = [
                { name: 'React', category: 'Frontend' },
                { name: 'Node.js', category: 'Backend' }
            ];

            const strengths: Strength[] = [
                {
                    area: 'Full Stack Development',
                    evidence: ['Built scalable web applications'],
                    relevance: 0.9
                }
            ];

            const parsedResume: ParsedResume = {
                rawText: 'Sample resume',
                sections: new Map(),
                metadata: {
                    parsedAt: Date.now(),
                    format: 'text'
                }
            };

            const resumeAnalysis: ResumeAnalysis = {
                parsedResume,
                strengths,
                technicalSkills: skills,
                gaps: [],
                alignmentScore: {
                    overall: 80,
                    technical: 85,
                    experience: 75,
                    cultural: 80
                },
                summary: 'Strong technical background'
            };

            const questions = generator.generateQuestionSet(role, level, resumeAnalysis);

            // At least one question should reference the resume
            const resumeAwareQuestions = questions.filter(q => q.resumeContext !== undefined);
            expect(resumeAwareQuestions.length).toBeGreaterThan(0);
        });

        it('should generate questions for different roles', () => {
            const roles = ['software-engineer', 'product-manager', 'data-scientist', 'frontend-engineer'];

            const level: ExperienceLevel = {
                level: 'mid',
                yearsMin: 2,
                yearsMax: 5,
                expectedDepth: 6
            };

            for (const roleId of roles) {
                const role: JobRole = {
                    id: roleId,
                    name: roleId,
                    technicalSkills: ['Skill1'],
                    behavioralCompetencies: ['Competency1'],
                    questionCategories: [
                        { name: 'Category1', weight: 1, technicalFocus: true }
                    ]
                };

                const questions = generator.generateQuestionSet(role, level);
                expect(questions.length).toBeGreaterThanOrEqual(5);
                expect(questions.length).toBeLessThanOrEqual(10);
            }
        });

        it('should assign unique IDs to each question', () => {
            const role: JobRole = {
                id: 'software-engineer',
                name: 'Software Engineer',
                technicalSkills: ['JavaScript'],
                behavioralCompetencies: ['Problem Solving'],
                questionCategories: [
                    { name: 'Coding', weight: 0.5, technicalFocus: true },
                    { name: 'Behavioral', weight: 0.5, technicalFocus: false }
                ]
            };

            const level: ExperienceLevel = {
                level: 'mid',
                yearsMin: 2,
                yearsMax: 5,
                expectedDepth: 6
            };

            const questions = generator.generateQuestionSet(role, level);
            const ids = questions.map(q => q.id);
            const uniqueIds = new Set(ids);

            expect(uniqueIds.size).toBe(questions.length);
        });

        it('should include expected elements for questions', () => {
            const role: JobRole = {
                id: 'software-engineer',
                name: 'Software Engineer',
                technicalSkills: ['JavaScript'],
                behavioralCompetencies: ['Problem Solving'],
                questionCategories: [
                    { name: 'Coding', weight: 0.5, technicalFocus: true },
                    { name: 'Behavioral', weight: 0.5, technicalFocus: false }
                ]
            };

            const level: ExperienceLevel = {
                level: 'mid',
                yearsMin: 2,
                yearsMax: 5,
                expectedDepth: 6
            };

            const questions = generator.generateQuestionSet(role, level);

            // Most questions should have expected elements
            const questionsWithElements = questions.filter(q => q.expectedElements && q.expectedElements.length > 0);
            expect(questionsWithElements.length).toBeGreaterThan(0);
        });
    });

    describe('generateFollowUp', () => {
        it('should return null when response does not need follow-up', () => {
            const question = {
                id: 'q1',
                type: 'technical' as const,
                text: 'Test question',
                category: 'Test',
                difficulty: 5
            };

            const response = {
                questionId: 'q1',
                text: 'Test response',
                timestamp: Date.now(),
                wordCount: 10,
                responseTime: 30
            };

            const evaluation = {
                questionId: 'q1',
                depthScore: 8,
                clarityScore: 9,
                completenessScore: 8,
                needsFollowUp: false
            };

            const followUp = generator.generateFollowUp(question, response, evaluation);
            expect(followUp).toBeNull();
        });

        it('should return null when maximum follow-ups (2) reached', () => {
            const question = {
                id: 'q1',
                type: 'technical' as const,
                text: 'Test question',
                category: 'Test',
                difficulty: 5,
                followUpCount: 2 // Already at max
            };

            const response = {
                questionId: 'q1',
                text: 'Short response',
                timestamp: Date.now(),
                wordCount: 5,
                responseTime: 30
            };

            const evaluation = {
                questionId: 'q1',
                depthScore: 3,
                clarityScore: 4,
                completenessScore: 3,
                needsFollowUp: true
            };

            const followUp = generator.generateFollowUp(question, response, evaluation);
            expect(followUp).toBeNull();
        });

        it('should generate technical follow-up when technology is mentioned', () => {
            const question = {
                id: 'q1',
                type: 'technical' as const,
                text: 'How do you handle state management?',
                category: 'Frontend',
                difficulty: 6
            };

            const response = {
                questionId: 'q1',
                text: 'I use React hooks and Redux for state management in my applications',
                timestamp: Date.now(),
                wordCount: 12,
                responseTime: 30
            };

            const evaluation = {
                questionId: 'q1',
                depthScore: 5,
                clarityScore: 7,
                completenessScore: 5,
                needsFollowUp: true,
                followUpReason: 'insufficient depth'
            };

            const followUp = generator.generateFollowUp(question, response, evaluation);

            expect(followUp).not.toBeNull();
            expect(followUp?.type).toBe('technical');
            expect(followUp?.text.toLowerCase()).toMatch(/react|redux/);
            expect(followUp?.parentQuestionId).toBe('q1');
            expect(followUp?.followUpCount).toBe(1);
        });

        it('should generate elaboration follow-up for low-quality response', () => {
            const question = {
                id: 'q1',
                type: 'behavioral' as const,
                text: 'Tell me about a challenging project',
                category: 'Problem Solving',
                difficulty: 5
            };

            const response = {
                questionId: 'q1',
                text: 'I worked on a project',
                timestamp: Date.now(),
                wordCount: 5,
                responseTime: 30
            };

            const evaluation = {
                questionId: 'q1',
                depthScore: 2,
                clarityScore: 5,
                completenessScore: 2,
                needsFollowUp: true,
                followUpReason: 'insufficient depth'
            };

            const followUp = generator.generateFollowUp(question, response, evaluation);

            expect(followUp).not.toBeNull();
            expect(followUp?.type).toBe('behavioral');
            expect(followUp?.parentQuestionId).toBe('q1');
            expect(followUp?.followUpCount).toBe(1);
        });

        it('should increment follow-up count correctly', () => {
            const question = {
                id: 'q1',
                type: 'technical' as const,
                text: 'Test question',
                category: 'Test',
                difficulty: 5,
                followUpCount: 1 // First follow-up already asked
            };

            const response = {
                questionId: 'q1',
                text: 'Brief answer',
                timestamp: Date.now(),
                wordCount: 5,
                responseTime: 30
            };

            const evaluation = {
                questionId: 'q1',
                depthScore: 4,
                clarityScore: 5,
                completenessScore: 4,
                needsFollowUp: true
            };

            const followUp = generator.generateFollowUp(question, response, evaluation);

            expect(followUp).not.toBeNull();
            expect(followUp?.followUpCount).toBe(2);
        });

        it('should generate different follow-ups based on evaluation reason', () => {
            const question = {
                id: 'q1',
                type: 'technical' as const,
                text: 'Explain your approach',
                category: 'Problem Solving',
                difficulty: 5
            };

            const response = {
                questionId: 'q1',
                text: 'I did something but it was unclear',
                timestamp: Date.now(),
                wordCount: 7,
                responseTime: 30
            };

            const evaluationUnclear = {
                questionId: 'q1',
                depthScore: 6,
                clarityScore: 3,
                completenessScore: 6,
                needsFollowUp: true,
                followUpReason: 'unclear explanation'
            };

            const followUp = generator.generateFollowUp(question, response, evaluationUnclear);

            expect(followUp).not.toBeNull();
            expect(followUp?.text).toBeTruthy();
        });

        it('should handle responses with no technical mentions', () => {
            const question = {
                id: 'q1',
                type: 'technical' as const,
                text: 'How do you solve problems?',
                category: 'Problem Solving',
                difficulty: 5
            };

            const response = {
                questionId: 'q1',
                text: 'I think about it carefully',
                timestamp: Date.now(),
                wordCount: 5,
                responseTime: 30
            };

            const evaluation = {
                questionId: 'q1',
                depthScore: 3,
                clarityScore: 5,
                completenessScore: 3,
                needsFollowUp: true,
                followUpReason: 'insufficient depth'
            };

            const followUp = generator.generateFollowUp(question, response, evaluation);

            // Should generate elaboration follow-up instead
            expect(followUp).not.toBeNull();
            expect(followUp?.parentQuestionId).toBe('q1');
        });
    });
});
