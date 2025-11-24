import { SessionId, QuestionId } from '../models/types';

export function generateSessionId(): SessionId {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export function generateQuestionId(): QuestionId {
    return `question_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export function calculateWordCount(text: string): number {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
}
