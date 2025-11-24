import { JobRole, ExperienceLevel } from '../models/types';
export declare class ValidationError extends Error {
    constructor(message: string);
}
export declare function validateJobRole(role: JobRole): void;
export declare function validateExperienceLevel(level: ExperienceLevel): void;
export declare function validateScore(score: number, min?: number, max?: number): void;
//# sourceMappingURL=validation.d.ts.map