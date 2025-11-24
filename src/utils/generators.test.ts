import { generateSessionId, generateQuestionId, calculateWordCount } from './generators';

describe('Generator Utilities', () => {
    describe('generateSessionId', () => {
        test('generates unique session IDs', () => {
            const id1 = generateSessionId();
            const id2 = generateSessionId();

            expect(id1).toMatch(/^session_\d+_[a-z0-9]+$/);
            expect(id2).toMatch(/^session_\d+_[a-z0-9]+$/);
            expect(id1).not.toBe(id2);
        });
    });

    describe('generateQuestionId', () => {
        test('generates unique question IDs', () => {
            const id1 = generateQuestionId();
            const id2 = generateQuestionId();

            expect(id1).toMatch(/^question_\d+_[a-z0-9]+$/);
            expect(id2).toMatch(/^question_\d+_[a-z0-9]+$/);
            expect(id1).not.toBe(id2);
        });
    });

    describe('calculateWordCount', () => {
        test('counts words correctly', () => {
            expect(calculateWordCount('hello world')).toBe(2);
            expect(calculateWordCount('  hello   world  ')).toBe(2);
            expect(calculateWordCount('')).toBe(0);
            expect(calculateWordCount('   ')).toBe(0);
            expect(calculateWordCount('single')).toBe(1);
        });
    });
});
