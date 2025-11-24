"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSessionId = generateSessionId;
exports.generateQuestionId = generateQuestionId;
exports.calculateWordCount = calculateWordCount;
function generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}
function generateQuestionId() {
    return `question_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}
function calculateWordCount(text) {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
}
//# sourceMappingURL=generators.js.map