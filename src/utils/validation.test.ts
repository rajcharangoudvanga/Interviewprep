import { validateJobRole, validateExperienceLevel, validateScore, ValidationError } from './validation';
import { JobRole, ExperienceLevel } from '../models/types';

describe('Validation Utilities', () => {
    describe('validateJobRole', () => {
        test('accepts valid job role', () => {
            const validRole: JobRole = {
                id: 'swe',
                name: 'Software Engineer',
                technicalSkills: ['JavaScript', 'TypeScript'],
                behavioralCompetencies: ['Communication', 'Teamwork'],
                questionCategories: []
            };

            expect(() => validateJobRole(validRole)).not.toThrow();
        });

        test('rejects job role without id', () => {
            const invalidRole = {
                id: '',
                name: 'Software Engineer',
                technicalSkills: [],
                behavioralCompetencies: [],
                questionCategories: []
            };

            expect(() => validateJobRole(invalidRole)).toThrow(ValidationError);
        });
    });

    describe('validateExperienceLevel', () => {
        test('accepts valid experience level', () => {
            const validLevel: ExperienceLevel = {
                level: 'mid',
                yearsMin: 3,
                yearsMax: 7,
                expectedDepth: 7
            };

            expect(() => validateExperienceLevel(validLevel)).not.toThrow();
        });

        test('rejects invalid level string', () => {
            const invalidLevel = {
                level: 'invalid' as any,
                yearsMin: 0,
                yearsMax: 5,
                expectedDepth: 5
            };

            expect(() => validateExperienceLevel(invalidLevel)).toThrow(ValidationError);
        });
    });

    describe('validateScore', () => {
        test('accepts score within range', () => {
            expect(() => validateScore(5, 0, 10)).not.toThrow();
            expect(() => validateScore(0, 0, 10)).not.toThrow();
            expect(() => validateScore(10, 0, 10)).not.toThrow();
        });

        test('rejects score outside range', () => {
            expect(() => validateScore(-1, 0, 10)).toThrow(ValidationError);
            expect(() => validateScore(11, 0, 10)).toThrow(ValidationError);
        });
    });
});
