import { BehaviorClassifier, CommunicationAdapter } from './BehaviorClassifier';
import { CandidateResponse, UserInteraction, InterviewQuestion, BehaviorType } from '../models/types';

describe('BehaviorClassifier', () => {
    let classifier: BehaviorClassifier;

    beforeEach(() => {
        classifier = new BehaviorClassifier();
    });

    describe('detectConfusion', () => {
        it('should detect confusion from keywords', () => {
            const response: CandidateResponse = {
                questionId: 'q1',
                text: 'I am confused about this question. Can you help?',
                timestamp: Date.now(),
                wordCount: 10,
                responseTime: 5000
            };

            expect(classifier.detectConfusion(response)).toBe(true);
        });

        it('should not detect confusion in clear responses', () => {
            const response: CandidateResponse = {
                questionId: 'q1',
                text: 'I would use React hooks to manage state in functional components.',
                timestamp: Date.now(),
                wordCount: 12,
                responseTime: 5000
            };

            expect(classifier.detectConfusion(response)).toBe(false);
        });
    });

    describe('detectEfficiency', () => {
        it('should detect efficient communication', () => {
            const response: CandidateResponse = {
                questionId: 'q1',
                text: 'I use TypeScript for type safety, Jest for testing, and React for UI components.',
                timestamp: Date.now(),
                wordCount: 15,
                responseTime: 10000
            };

            expect(classifier.detectEfficiency(response)).toBe(true);
        });

        it('should not detect efficiency in very long responses', () => {
            const longText = 'word '.repeat(100);
            const response: CandidateResponse = {
                questionId: 'q1',
                text: longText,
                timestamp: Date.now(),
                wordCount: 100,
                responseTime: 30000
            };

            expect(classifier.detectEfficiency(response)).toBe(false);
        });
    });

    describe('detectVerbosity', () => {
        it('should detect verbose responses', () => {
            const longText = 'I think that maybe possibly we could potentially use React and then React hooks and React components with React state management using React context and React providers. '.repeat(3);
            const response: CandidateResponse = {
                questionId: 'q1',
                text: longText,
                timestamp: Date.now(),
                wordCount: 250,
                responseTime: 60000
            };

            expect(classifier.detectVerbosity(response)).toBe(true);
        });

        it('should not detect verbosity in concise responses', () => {
            const response: CandidateResponse = {
                questionId: 'q1',
                text: 'I would use dependency injection to improve testability.',
                timestamp: Date.now(),
                wordCount: 9,
                responseTime: 5000
            };

            expect(classifier.detectVerbosity(response)).toBe(false);
        });
    });

    describe('detectOffTopic', () => {
        it('should detect off-topic responses', () => {
            const question: InterviewQuestion = {
                id: 'q1',
                type: 'technical',
                text: 'Explain how you would implement a binary search tree',
                category: 'Data Structures',
                difficulty: 5
            };

            const response: CandidateResponse = {
                questionId: 'q1',
                text: 'I really enjoy cooking pasta and making Italian food on weekends.',
                timestamp: Date.now(),
                wordCount: 12,
                responseTime: 5000
            };

            expect(classifier.detectOffTopic(response, question)).toBe(true);
        });

        it('should not detect off-topic in relevant responses', () => {
            const question: InterviewQuestion = {
                id: 'q1',
                type: 'technical',
                text: 'Explain how you would implement a binary search tree',
                category: 'Data Structures',
                difficulty: 5
            };

            const response: CandidateResponse = {
                questionId: 'q1',
                text: 'A binary search tree is implemented with nodes where left children are smaller and right children are larger.',
                timestamp: Date.now(),
                wordCount: 20,
                responseTime: 10000
            };

            expect(classifier.detectOffTopic(response, question)).toBe(false);
        });
    });

    describe('classifyBehavior', () => {
        it('should classify as confused when multiple confused responses', () => {
            const responses: CandidateResponse[] = [
                {
                    questionId: 'q1',
                    text: 'I don\'t understand this question',
                    timestamp: Date.now(),
                    wordCount: 5,
                    responseTime: 5000
                },
                {
                    questionId: 'q2',
                    text: 'Can you help me with this?',
                    timestamp: Date.now(),
                    wordCount: 6,
                    responseTime: 5000
                }
            ];

            const behavior = classifier.classifyBehavior(responses, []);
            expect(behavior).toBe('confused');
        });

        it('should classify as efficient when responses are concise', () => {
            const responses: CandidateResponse[] = [
                {
                    questionId: 'q1',
                    text: 'I use React hooks for state management in functional components with proper dependency arrays.',
                    timestamp: Date.now(),
                    wordCount: 15,
                    responseTime: 5000
                },
                {
                    questionId: 'q2',
                    text: 'TypeScript provides compile-time type checking and better IDE support for large codebases.',
                    timestamp: Date.now(),
                    wordCount: 15,
                    responseTime: 5000
                },
                {
                    questionId: 'q3',
                    text: 'Jest offers snapshot testing, mocking capabilities, and excellent TypeScript integration for unit tests.',
                    timestamp: Date.now(),
                    wordCount: 15,
                    responseTime: 5000
                }
            ];

            const behavior = classifier.classifyBehavior(responses, []);
            expect(behavior).toBe('efficient');
        });

        it('should classify as chatty when responses are verbose', () => {
            const longText = 'word '.repeat(250);
            const responses: CandidateResponse[] = [
                {
                    questionId: 'q1',
                    text: longText,
                    timestamp: Date.now(),
                    wordCount: 250,
                    responseTime: 60000
                },
                {
                    questionId: 'q2',
                    text: longText,
                    timestamp: Date.now(),
                    wordCount: 250,
                    responseTime: 60000
                }
            ];

            const behavior = classifier.classifyBehavior(responses, []);
            expect(behavior).toBe('chatty');
        });

        it('should classify as edge-case when invalid interactions detected', () => {
            const responses: CandidateResponse[] = [
                {
                    questionId: 'q1',
                    text: 'Normal response',
                    timestamp: Date.now(),
                    wordCount: 2,
                    responseTime: 5000
                }
            ];

            const interactions: UserInteraction[] = [
                {
                    timestamp: Date.now(),
                    type: 'command',
                    content: 'skip all questions'
                }
            ];

            const behavior = classifier.classifyBehavior(responses, interactions);
            expect(behavior).toBe('edge-case');
        });

        it('should classify as standard for normal behavior', () => {
            const responses: CandidateResponse[] = [
                {
                    questionId: 'q1',
                    text: 'I would implement this feature using a modular architecture with clear separation of concerns and proper abstraction layers to ensure maintainability and scalability over time. This involves careful planning and design considerations.',
                    timestamp: Date.now(),
                    wordCount: 35,
                    responseTime: 120000 // Slower response time
                },
                {
                    questionId: 'q2',
                    text: 'The approach involves creating well-defined interfaces and using dependency injection for better testability and flexibility in the system design. We need to consider various factors when making these architectural decisions.',
                    timestamp: Date.now(),
                    wordCount: 35,
                    responseTime: 120000 // Slower response time
                }
            ];

            const behavior = classifier.classifyBehavior(responses, []);
            expect(behavior).toBe('standard');
        });

        it('should return standard for empty response array', () => {
            const behavior = classifier.classifyBehavior([], []);
            expect(behavior).toBe('standard');
        });
    });
});

describe('CommunicationAdapter', () => {
    let adapter: CommunicationAdapter;

    beforeEach(() => {
        adapter = new CommunicationAdapter();
    });

    describe('adaptResponse', () => {
        it('should add guidance for confused behavior', () => {
            const content = 'Here is the next question.';
            const adapted = adapter.adaptResponse(content, 'confused');

            expect(adapted.style).toBe('confused');
            expect(adapted.content).toContain('Let me help clarify');
            expect(adapted.content).toContain(content);
            expect(adapted.adjustments.length).toBeGreaterThan(0);
        });

        it('should keep response concise for efficient behavior', () => {
            const content = 'Here is a detailed explanation.\nWith multiple points.\nAnd more context.\nAnd even more.\nAnd extra details.';
            const adapted = adapter.adaptResponse(content, 'efficient');

            expect(adapted.style).toBe('efficient');
            expect(adapted.content.length).toBeLessThan(content.length);
            expect(adapted.adjustments).toContain('Kept response concise');
        });

        it('should add redirect for chatty behavior', () => {
            const content = 'Moving to next question.';
            const adapted = adapter.adaptResponse(content, 'chatty');

            expect(adapted.style).toBe('chatty');
            expect(adapted.content).toContain('focus on the key points');
            expect(adapted.content).toContain(content);
            expect(adapted.adjustments).toContain('Added focus redirect');
        });

        it('should explain limitations for edge-case behavior', () => {
            const content = 'That action is not available.';
            const adapted = adapter.adaptResponse(content, 'edge-case');

            expect(adapted.style).toBe('edge-case');
            expect(adapted.content).toContain('not possible');
            expect(adapted.content).toContain('valid options');
            expect(adapted.adjustments).toContain('Explained system limitations');
        });

        it('should return unchanged content for standard behavior', () => {
            const content = 'Here is your next question.';
            const adapted = adapter.adaptResponse(content, 'standard');

            expect(adapted.style).toBe('standard');
            expect(adapted.content).toBe(content);
            expect(adapted.adjustments).toEqual([]);
        });
    });

    describe('getAcknowledgment', () => {
        it('should return appropriate acknowledgments for each behavior type', () => {
            const behaviors: BehaviorType[] = ['confused', 'efficient', 'chatty', 'edge-case', 'standard'];

            behaviors.forEach(behavior => {
                const ack = adapter.getAcknowledgment(behavior);
                expect(ack).toBeTruthy();
                expect(typeof ack).toBe('string');
                expect(ack.length).toBeGreaterThan(0);
            });
        });
    });

    describe('getTransition', () => {
        it('should return appropriate transitions for each behavior type', () => {
            const behaviors: BehaviorType[] = ['confused', 'efficient', 'chatty', 'edge-case', 'standard'];

            behaviors.forEach(behavior => {
                const transition = adapter.getTransition(behavior);
                expect(transition).toBeTruthy();
                expect(typeof transition).toBe('string');
                expect(transition.length).toBeGreaterThan(0);
            });
        });

        it('should have shorter transition for efficient behavior', () => {
            const efficientTransition = adapter.getTransition('efficient');
            const standardTransition = adapter.getTransition('standard');

            expect(efficientTransition.length).toBeLessThan(standardTransition.length);
        });
    });
});
