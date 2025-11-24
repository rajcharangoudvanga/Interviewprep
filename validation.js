"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationError = void 0;
exports.validateJobRole = validateJobRole;
exports.validateExperienceLevel = validateExperienceLevel;
exports.validateScore = validateScore;
class ValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ValidationError';
    }
}
exports.ValidationError = ValidationError;
function validateJobRole(role) {
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
function validateExperienceLevel(level) {
    const validLevels = ['entry', 'mid', 'senior', 'lead'];
    if (!validLevels.includes(level.level)) {
        throw new ValidationError(`Experience level must be one of: ${validLevels.join(', ')}`);
    }
    if (level.yearsMin < 0 || level.yearsMax < level.yearsMin) {
        throw new ValidationError('Invalid years range for experience level');
    }
}
function validateScore(score, min = 0, max = 10) {
    if (score < min || score > max) {
        throw new ValidationError(`Score must be between ${min} and ${max}`);
    }
}
//# sourceMappingURL=validation.js.map