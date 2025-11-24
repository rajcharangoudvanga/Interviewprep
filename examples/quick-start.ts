/**
 * Quick Start Example - Minimal code to get started
 */

import { createInterviewPrepAI } from '../src/index';

// Create instance
const interviewAI = createInterviewPrepAI();

// Create session
const sessionId = interviewAI.createSession('software-engineer', 'mid');

// Start interview
const firstQuestion = interviewAI.startInterview(sessionId);
console.log('Question:', firstQuestion.text);

// Submit response
const action = interviewAI.submitResponse(
    sessionId,
    'I would use a hash map for O(1) lookups and implement the solution iteratively to avoid stack overflow.'
);

// Handle next action
if (action.type === 'next-question') {
    console.log('Next question:', action.question.text);
} else if (action.type === 'follow-up') {
    console.log('Follow-up:', action.question.text);
} else if (action.type === 'complete') {
    console.log('Interview complete!');
    console.log('Grade:', action.feedback.scores.overall.grade);
    console.log('Score:', action.feedback.scores.overall.weightedTotal);
}

// Cleanup
interviewAI.cleanupSession(sessionId);
