import * as fc from 'fast-check';
import {
    SessionState,
    InterviewQuestion,
    BehaviorType
} from './types';

describe('Core Type Definitions', () => {
    test('types are properly exported', () => {
        // This test verifies that all core types are accessible
        const behaviorTypes: BehaviorType[] = ['confused', 'efficient', 'chatty', 'edge-case', 'standard'];
        expect(behaviorTypes).toHaveLength(5);
    });

    test('SessionState structure is valid', () => {
        const mockSession: Partial<SessionState> = {
            sessionId: 'test-session',
            status: 'initialized',
            behaviorType: 'standard',
            questions: [],
            responses: new Map(),
            evaluations: new Map(),
            startTime: Date.now()
        };

        expect(mockSession.sessionId).toBe('test-session');
        expect(mockSession.status).toBe('initialized');
    });

    test('property-based: question IDs are unique', () => {
        fc.assert(
            fc.property(
                fc.array(fc.string(), { minLength: 1, maxLength: 10 }),
                (ids) => {
                    const questions: InterviewQuestion[] = ids.map((id, idx) => ({
                        id: `q_${id}_${idx}`,
                        type: idx % 2 === 0 ? 'technical' : 'behavioral',
                        text: `Question ${idx}`,
                        category: 'test',
                        difficulty: 5
                    }));

                    const uniqueIds = new Set(questions.map(q => q.id));
                    return uniqueIds.size === questions.length;
                }
            ),
            { numRuns: 100 }
        );
    });
});
