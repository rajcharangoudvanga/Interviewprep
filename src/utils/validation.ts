import { JobRole, ExperienceLevel } from '../models/types';

export class ValidationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ValidationError';
    }
}

export function validateJobRole(role: JobRole): void {
    if (!role.id || !role.name) {
        throw new ValidationError('Job role must have id and name');
    }
    if (!Array.isArray(role.technicalSkills)) {
        throw new ValidationError('Job role must have technicalSkills array');
    }
    if (!Array.isArray(role.behavioralCompetencies)) {
        throw new ValidationError('Job role must have behavioralCompetencies array');
    }
}

export function validateExperienceLevel(level: ExperienceLevel): void {
    const validLevels = ['entry', 'mid', 'senior', 'lead'];
    if (!validLevels.includes(level.level)) {
        throw new ValidationError(`Experience level must be one of: ${validLevels.join(', ')}`);
    }
    if (level.yearsMin < 0 || level.yearsMax < level.yearsMin) {
        throw new ValidationError('Invalid years range for experience level');
    }
}

export function validateScore(score: number, min: number = 0, max: number = 10): void {
    if (score < min || score > max) {
        throw new ValidationError(`Score must be between ${min} and ${max}`);
    }
}
