import { TextInteractionMode } from './TextInteractionMode';
import { InterviewQuestion, FeedbackReport, InterviewAction } from '../models/types';

describe('TextInteractionMode', () => {
    let textMode: TextInteractionMode;

    beforeEach(() => {
        textMode = new TextInteractionMode();
    });

    describe('getModeType', () => {
        it('should return text as mode type', () => {
            expect(textMode.getModeType()).toBe('text');
        });
    });

    describe('formatQuestion', () => {
        it('should format a technical question', () => {
            const question: InterviewQuestion = {
                id: 'q1',
                type: 'technical',
                text: 'Explain how closures work in JavaScript',
                category: 'JavaScript',
                difficulty: 5
            };

            const formatted = textMode.formatQuestion(question);
            expect(formatted).toContain('Technical');
            expect(formatted).toContain('Explain how closures work in JavaScript');
        });

        it('should format a behavioral question', () => {
            const question: InterviewQuestion = {
                id: 'q2',
                type: 'behavioral',
                text: 'Tell me about a time you resolved a conflict',
                category: 'Leadership',
                difficulty: 4
            };

            const formatted = textMode.formatQuestion(question);
            expect(formatted).toContain('Behavioral');
            expect(formatted).toContain('Tell me about a time you resolved a conflict');
        });

        it('should include resume context when available', () => {
            const question: InterviewQuestion = {
                id: 'q3',
                type: 'technical',
                text: 'How did you implement the payment system?',
                category: 'System Design',
                difficulty: 6,
                resumeContext: {
                    section: 'experience',
                    content: 'Built payment processing system',
                    relevance: 'Direct experience with payment systems'
                }
            };

            const formatted = textMode.formatQuestion(question);
            expect(formatted).toContain('Built payment processing system');
            expect(formatted).toContain('Context from your resume');
        });
    });

    describe('formatConversationalResponse', () => {
        it('should return content as-is for text mode', () => {
            const content = 'Great answer! Let me ask you a follow-up question.';
            const formatted = textMode.formatConversationalResponse(content);
            expect(formatted).toBe(content);
        });
    });

    describe('formatFeedback', () => {
        it('should format a complete feedback report', () => {
            const feedback: FeedbackReport = {
                sessionId: 'session-1',
                scores: {
                    communication: {
                        clarity: 8,
                        articulation: 7,
                        structure: 8,
                        professionalism: 9,
                        total: 32,
                        grade: 'B'
                    },
                    technicalFit: {
                        depth: 7,
                        accuracy: 8,
                        relevance: 8,
                        problemSolving: 7,
                        total: 30,
                        grade: 'B'
                    },
                    overall: {
                        communicationWeight: 0.4,
                        technicalWeight: 0.6,
                        weightedTotal: 77,
                        grade: 'B'
                    }
                },
                strengths: ['Clear communication', 'Strong technical knowledge'],
                improvements: [
                    {
                        category: 'Technical Depth',
                        observation: 'Could provide more detail',
                        suggestion: 'Explain implementation details',
                        priority: 'medium'
                    }
                ],
                questionBreakdown: [],
                summary: 'Good overall performance with room for improvement.'
            };

            const formatted = textMode.formatFeedback(feedback);
            expect(formatted).toContain('INTERVIEW FEEDBACK REPORT');
            expect(formatted).toContain('OVERALL PERFORMANCE');
            expect(formatted).toContain('Grade: B');
            expect(formatted).toContain('COMMUNICATION SKILLS');
            expect(formatted).toContain('TECHNICAL FIT');
            expect(formatted).toContain('STRENGTHS');
            expect(formatted).toContain('Clear communication');
            expect(formatted).toContain('AREAS FOR IMPROVEMENT');
            expect(formatted).toContain('Technical Depth');
        });

        it('should include resume alignment when available', () => {
            const feedback: FeedbackReport = {
                sessionId: 'session-1',
                scores: {
                    communication: {
                        clarity: 8,
                        articulation: 7,
                        structure: 8,
                        professionalism: 9,
                        total: 32,
                        grade: 'B'
                    },
                    technicalFit: {
                        depth: 7,
                        accuracy: 8,
                        relevance: 8,
                        problemSolving: 7,
                        total: 30,
                        grade: 'B'
                    },
                    overall: {
                        communicationWeight: 0.4,
                        technicalWeight: 0.6,
                        weightedTotal: 77,
                        grade: 'B'
                    }
                },
                strengths: [],
                improvements: [],
                resumeAlignment: {
                    alignmentScore: 75,
                    matchedSkills: [
                        { name: 'JavaScript', category: 'Programming' },
                        { name: 'React', category: 'Framework' }
                    ],
                    missingSkills: [
                        { name: 'TypeScript', category: 'Programming' }
                    ],
                    experienceGaps: ['Need more backend experience'],
                    suggestions: ['Add TypeScript to your resume']
                },
                questionBreakdown: [],
                summary: 'Good performance.'
            };

            const formatted = textMode.formatFeedback(feedback);
            expect(formatted).toContain('RESUME ALIGNMENT');
            expect(formatted).toContain('Alignment Score: 75');
            expect(formatted).toContain('JavaScript');
            expect(formatted).toContain('TypeScript');
        });
    });

    describe('formatInterviewAction', () => {
        it('should format next-question action', () => {
            const action: InterviewAction = {
                type: 'next-question',
                question: {
                    id: 'q1',
                    type: 'technical',
                    text: 'What is a closure?',
                    category: 'JavaScript',
                    difficulty: 5
                }
            };

            const formatted = textMode.formatInterviewAction(action);
            expect(formatted).toContain('What is a closure?');
        });

        it('should format follow-up action', () => {
            const action: InterviewAction = {
                type: 'follow-up',
                question: {
                    id: 'q2',
                    type: 'technical',
                    text: 'Can you explain that in more detail?',
                    category: 'JavaScript',
                    difficulty: 5
                }
            };

            const formatted = textMode.formatInterviewAction(action);
            expect(formatted).toContain('Follow-up');
            expect(formatted).toContain('Can you explain that in more detail?');
        });

        it('should format redirect action', () => {
            const action: InterviewAction = {
                type: 'redirect',
                message: 'Please focus on the question asked.'
            };

            const formatted = textMode.formatInterviewAction(action);
            expect(formatted).toContain('Please focus on the question asked');
        });
    });

    describe('parseUserInput', () => {
        it('should parse text input into candidate response', () => {
            const input = 'A closure is a function that has access to variables in its outer scope.';
            const timestamp = Date.now();

            const response = textMode.parseUserInput('session-1', 'q1', input, timestamp);

            expect(response.questionId).toBe('q1');
            expect(response.text).toBe(input);
            expect(response.timestamp).toBe(timestamp);
            expect(response.wordCount).toBe(14);
        });

        it('should trim whitespace from input', () => {
            const input = '  Some answer with spaces  ';
            const response = textMode.parseUserInput('session-1', 'q1', input, Date.now());

            expect(response.text).toBe('Some answer with spaces');
        });

        it('should handle empty input', () => {
            const input = '';
            const response = textMode.parseUserInput('session-1', 'q1', input, Date.now());

            expect(response.text).toBe('');
            expect(response.wordCount).toBe(0);
        });

        it('should truncate input exceeding max length', () => {
            const longInput = 'word '.repeat(3000); // 15000 characters
            const textModeWithLimit = new TextInteractionMode({ maxResponseLength: 1000 });

            const response = textModeWithLimit.parseUserInput('session-1', 'q1', longInput, Date.now());

            expect(response.text.length).toBe(1000);
        });
    });
});
