import { ResponseEvaluator } from './ResponseEvaluator';
import { InterviewQuestion, CandidateResponse } from '../models/types';

describe('ResponseEvaluator', () => {
    let evaluator: ResponseEvaluator;

    beforeEach(() => {
        evaluator = new ResponseEvaluator();
    });

    describe('evaluate', () => {
        it('should return evaluation with all required scores', () => {
            const question: InterviewQuestion = {
                id: 'q1',
                type: 'technical',
                text: 'Explain the difference between a stack and a queue.',
                category: 'Data Structures',
                difficulty: 5,
                expectedElements: ['stack', 'queue', 'LIFO', 'FIFO']
            };

            const response: CandidateResponse = {
                questionId: 'q1',
                text: 'A stack is a LIFO data structure where the last element added is the first one removed. A queue is a FIFO data structure where the first element added is the first one removed. Stacks are used for function call management, while queues are used for task scheduling.',
                timestamp: Date.now(),
                wordCount: 50,
                responseTime: 60000
            };

            const evaluation = evaluator.evaluate(question, response);

            expect(evaluation.questionId).toBe('q1');
            expect(evaluation.depthScore).toBeGreaterThanOrEqual(0);
            expect(evaluation.depthScore).toBeLessThanOrEqual(10);
            expect(evaluation.clarityScore).toBeGreaterThanOrEqual(0);
            expect(evaluation.clarityScore).toBeLessThanOrEqual(10);
            expect(evaluation.completenessScore).toBeGreaterThanOrEqual(0);
            expect(evaluation.completenessScore).toBeLessThanOrEqual(10);
            expect(evaluation.technicalAccuracy).toBeGreaterThanOrEqual(0);
            expect(evaluation.technicalAccuracy).toBeLessThanOrEqual(10);
            expect(typeof evaluation.needsFollowUp).toBe('boolean');
        });

        it('should include technical accuracy for technical questions', () => {
            const question: InterviewQuestion = {
                id: 'q2',
                type: 'technical',
                text: 'What is the time complexity of quicksort?',
                category: 'Algorithms',
                difficulty: 6
            };

            const response: CandidateResponse = {
                questionId: 'q2',
                text: 'The average time complexity of quicksort is O(n log n), but the worst case is O(n^2) when the pivot selection is poor.',
                timestamp: Date.now(),
                wordCount: 25,
                responseTime: 45000
            };

            const evaluation = evaluator.evaluate(question, response);

            expect(evaluation.technicalAccuracy).toBeDefined();
            expect(evaluation.technicalAccuracy).toBeGreaterThanOrEqual(0);
            expect(evaluation.technicalAccuracy).toBeLessThanOrEqual(10);
        });

        it('should not include technical accuracy for behavioral questions', () => {
            const question: InterviewQuestion = {
                id: 'q3',
                type: 'behavioral',
                text: 'Tell me about a time you worked with a difficult team member.',
                category: 'Collaboration',
                difficulty: 5
            };

            const response: CandidateResponse = {
                questionId: 'q3',
                text: 'In my previous role, I worked with a colleague who was resistant to feedback. I scheduled a one-on-one meeting to understand their perspective and found common ground. We established clear communication channels and the relationship improved significantly.',
                timestamp: Date.now(),
                wordCount: 45,
                responseTime: 90000
            };

            const evaluation = evaluator.evaluate(question, response);

            expect(evaluation.technicalAccuracy).toBeUndefined();
        });
    });

    describe('assessDepth', () => {
        it('should score higher for longer responses with technical content', () => {
            const shortResponse: CandidateResponse = {
                questionId: 'q1',
                text: 'It is a data structure.',
                timestamp: Date.now(),
                wordCount: 5,
                responseTime: 10000
            };

            const longTechnicalResponse: CandidateResponse = {
                questionId: 'q1',
                text: 'A hash table is a data structure that implements an associative array using a hash function to compute an index. It provides O(1) average-case complexity for insertions, deletions, and lookups. The hash function maps keys to array indices, and collision resolution strategies like chaining or open addressing handle cases where multiple keys hash to the same index.',
                timestamp: Date.now(),
                wordCount: 60,
                responseTime: 120000
            };

            const question: InterviewQuestion = {
                id: 'q1',
                type: 'technical',
                text: 'Explain hash tables',
                category: 'Data Structures',
                difficulty: 5
            };

            const shortScore = evaluator.assessDepth(shortResponse, question);
            const longScore = evaluator.assessDepth(longTechnicalResponse, question);

            expect(longScore).toBeGreaterThan(shortScore);
        });

        it('should return score in valid range 0-10', () => {
            const response: CandidateResponse = {
                questionId: 'q1',
                text: 'Test response with some technical keywords like algorithm, complexity, and optimization.',
                timestamp: Date.now(),
                wordCount: 12,
                responseTime: 30000
            };

            const score = evaluator.assessDepth(response);

            expect(score).toBeGreaterThanOrEqual(0);
            expect(score).toBeLessThanOrEqual(10);
        });
    });

    describe('assessClarity', () => {
        it('should score higher for well-structured responses', () => {
            const unstructuredResponse: CandidateResponse = {
                questionId: 'q1',
                text: 'well its like you know when you have stuff and then you do things with it and sometimes it works',
                timestamp: Date.now(),
                wordCount: 20,
                responseTime: 30000
            };

            const structuredResponse: CandidateResponse = {
                questionId: 'q1',
                text: 'First, we need to understand the problem. Second, we design a solution using appropriate data structures. Third, we implement the algorithm. Finally, we test and optimize for performance. For example, when building a cache, we might use a hash map for O(1) lookups.',
                timestamp: Date.now(),
                wordCount: 45,
                responseTime: 90000
            };

            const unstructuredScore = evaluator.assessClarity(unstructuredResponse);
            const structuredScore = evaluator.assessClarity(structuredResponse);

            expect(structuredScore).toBeGreaterThan(unstructuredScore);
        });

        it('should return score in valid range 0-10', () => {
            const response: CandidateResponse = {
                questionId: 'q1',
                text: 'This is a test response with reasonable structure.',
                timestamp: Date.now(),
                wordCount: 9,
                responseTime: 20000
            };

            const score = evaluator.assessClarity(response);

            expect(score).toBeGreaterThanOrEqual(0);
            expect(score).toBeLessThanOrEqual(10);
        });
    });

    describe('assessCompleteness', () => {
        it('should score based on coverage of expected elements', () => {
            const expectedElements = ['stack', 'queue', 'LIFO', 'FIFO', 'use cases'];

            const completeResponse: CandidateResponse = {
                questionId: 'q1',
                text: 'A stack is a LIFO data structure, while a queue is a FIFO data structure. Stacks are used for function calls, and queues are used for task scheduling. These are common use cases.',
                timestamp: Date.now(),
                wordCount: 35,
                responseTime: 60000
            };

            const incompleteResponse: CandidateResponse = {
                questionId: 'q1',
                text: 'A stack is a data structure.',
                timestamp: Date.now(),
                wordCount: 6,
                responseTime: 15000
            };

            const completeScore = evaluator.assessCompleteness(completeResponse, expectedElements);
            const incompleteScore = evaluator.assessCompleteness(incompleteResponse, expectedElements);

            expect(completeScore).toBeGreaterThan(incompleteScore);
        });

        it('should return 10 when all expected elements are covered', () => {
            const expectedElements = ['algorithm', 'complexity'];

            const response: CandidateResponse = {
                questionId: 'q1',
                text: 'The algorithm has O(n) time complexity.',
                timestamp: Date.now(),
                wordCount: 7,
                responseTime: 20000
            };

            const score = evaluator.assessCompleteness(response, expectedElements);

            expect(score).toBe(10);
        });

        it('should use heuristic scoring when no expected elements provided', () => {
            const response: CandidateResponse = {
                questionId: 'q1',
                text: 'We faced a problem with performance. Our solution was to implement caching. The result was a 50% improvement in response time.',
                timestamp: Date.now(),
                wordCount: 25,
                responseTime: 50000
            };

            const score = evaluator.assessCompleteness(response, []);

            expect(score).toBeGreaterThanOrEqual(0);
            expect(score).toBeLessThanOrEqual(10);
        });

        it('should return score in valid range 0-10', () => {
            const response: CandidateResponse = {
                questionId: 'q1',
                text: 'Test response.',
                timestamp: Date.now(),
                wordCount: 2,
                responseTime: 10000
            };

            const score = evaluator.assessCompleteness(response, ['test']);

            expect(score).toBeGreaterThanOrEqual(0);
            expect(score).toBeLessThanOrEqual(10);
        });
    });

    describe('needsFollowUp', () => {
        it('should return true when depth score is below threshold', () => {
            const evaluation = {
                questionId: 'q1',
                depthScore: 4,
                clarityScore: 8,
                completenessScore: 8,
                needsFollowUp: false
            };

            const result = evaluator.needsFollowUp(evaluation);

            expect(result).toBe(true);
        });

        it('should return true when completeness score is below threshold', () => {
            const evaluation = {
                questionId: 'q1',
                depthScore: 8,
                clarityScore: 8,
                completenessScore: 4,
                needsFollowUp: false
            };

            const result = evaluator.needsFollowUp(evaluation);

            expect(result).toBe(true);
        });

        it('should return true when technical accuracy is below threshold', () => {
            const evaluation = {
                questionId: 'q1',
                depthScore: 8,
                clarityScore: 8,
                completenessScore: 8,
                technicalAccuracy: 4,
                needsFollowUp: false
            };

            const result = evaluator.needsFollowUp(evaluation);

            expect(result).toBe(true);
        });

        it('should return true when clarity is very low', () => {
            const evaluation = {
                questionId: 'q1',
                depthScore: 8,
                clarityScore: 2,
                completenessScore: 8,
                needsFollowUp: false
            };

            const result = evaluator.needsFollowUp(evaluation);

            expect(result).toBe(true);
        });

        it('should return false when all scores are above threshold', () => {
            const evaluation = {
                questionId: 'q1',
                depthScore: 8,
                clarityScore: 8,
                completenessScore: 8,
                technicalAccuracy: 8,
                needsFollowUp: false
            };

            const result = evaluator.needsFollowUp(evaluation);

            expect(result).toBe(false);
        });
    });

    describe('integration', () => {
        it('should determine follow-up is needed for low-quality response', () => {
            const question: InterviewQuestion = {
                id: 'q1',
                type: 'technical',
                text: 'Explain how a hash table works.',
                category: 'Data Structures',
                difficulty: 5,
                expectedElements: ['hash function', 'collision', 'complexity', 'implementation']
            };

            const lowQualityResponse: CandidateResponse = {
                questionId: 'q1',
                text: 'It stores data.',
                timestamp: Date.now(),
                wordCount: 3,
                responseTime: 10000
            };

            const evaluation = evaluator.evaluate(question, lowQualityResponse);

            expect(evaluation.needsFollowUp).toBe(true);
            expect(evaluation.followUpReason).toBeDefined();
        });

        it('should determine follow-up is not needed for high-quality response', () => {
            const question: InterviewQuestion = {
                id: 'q1',
                type: 'technical',
                text: 'Explain how a hash table works.',
                category: 'Data Structures',
                difficulty: 5,
                expectedElements: ['hash function', 'collision', 'complexity', 'implementation']
            };

            const highQualityResponse: CandidateResponse = {
                questionId: 'q1',
                text: 'A hash table uses a hash function to map keys to array indices for efficient data storage and retrieval. When collisions occur (multiple keys mapping to the same index), we use techniques like chaining or open addressing. The average-case time complexity for operations is O(1). Implementation typically involves an array and a good hash function to minimize collisions.',
                timestamp: Date.now(),
                wordCount: 60,
                responseTime: 120000
            };

            const evaluation = evaluator.evaluate(question, highQualityResponse);

            expect(evaluation.needsFollowUp).toBe(false);
            expect(evaluation.followUpReason).toBeUndefined();
        });
    });
});
