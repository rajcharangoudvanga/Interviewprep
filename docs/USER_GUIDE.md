# InterviewPrepAI User Guide

## Table of Contents

1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [Basic Usage](#basic-usage)
4. [Advanced Features](#advanced-features)
5. [API Reference](#api-reference)
6. [Examples](#examples)
7. [Troubleshooting](#troubleshooting)

## Introduction

InterviewPrepAI is an adaptive mock interview coaching system that helps candidates practice for job interviews. The system provides:

- **Role-specific questions** tailored to your target position
- **Resume analysis** to align questions with your background
- **Intelligent follow-ups** based on your responses
- **Adaptive communication** that adjusts to your behavior
- **Comprehensive feedback** with detailed scoring rubrics

## Getting Started

### Installation

```bash
npm install interview-prep-ai
```

### Quick Start

```typescript
import { InterviewPrepAI } from 'interview-prep-ai';

// Create an instance
const interviewAI = new InterviewPrepAI();

// Create a session
const sessionId = interviewAI.createSession('software-engineer', 'entry');

// Start the interview
const firstQuestion = interviewAI.startInterview(sessionId);
console.log(firstQuestion.text);

// Submit a response
const action = interviewAI.submitResponse(sessionId, "My answer here...");

// Handle the action
if (action.type === 'next-question') {
    console.log(action.question.text);
} else if (action.type === 'complete') {
    console.log(action.feedback);
}
```

## Basic Usage

### Step 1: Choose Your Role and Level

First, see what roles and experience levels are available:

```typescript
const roles = interviewAI.getAvailableRoles();
const levels = interviewAI.getAvailableExperienceLevels();

console.log('Available roles:', roles.map(r => r.name));
console.log('Available levels:', levels.map(l => l.level));
```

Available roles include:
- Software Engineer
- Product Manager
- Data Scientist
- UX Designer
- DevOps Engineer

Experience levels:
- **Entry** (0-2 years)
- **Mid** (2-5 years)
- **Senior** (5-10 years)
- **Lead** (10+ years)

### Step 2: Create a Session

```typescript
const sessionId = interviewAI.createSession('software-engineer', 'mid');
```

If you provide an invalid role or level, the system will throw an `InvalidRoleInputError` with available options.

### Step 3: Upload Your Resume (Optional)

Uploading a resume allows the system to generate personalized questions:

```typescript
const resumeData = {
    content: '... your resume text ...',
    format: 'text/plain',
    filename: 'resume.txt'
};

const analysis = interviewAI.uploadResume(sessionId, resumeData);

console.log('Alignment Score:', analysis.alignmentScore.overall);
console.log('Strengths:', analysis.strengths);
console.log('Gaps:', analysis.gaps);
```

### Step 4: Start the Interview

```typescript
const firstQuestion = interviewAI.startInterview(sessionId);

console.log('Question:', firstQuestion.text);
console.log('Type:', firstQuestion.type); // 'technical' or 'behavioral'
console.log('Category:', firstQuestion.category);
```

### Step 5: Answer Questions

Submit your responses and handle the system's actions:

```typescript
const action = interviewAI.submitResponse(sessionId, yourAnswer);

switch (action.type) {
    case 'next-question':
        // System is moving to the next question
        console.log('Next question:', action.question.text);
        break;
        
    case 'follow-up':
        // System wants more detail
        console.log('Follow-up:', action.question.text);
        break;
        
    case 'complete':
        // Interview is complete
        console.log('Feedback:', action.feedback);
        break;
        
    case 'redirect':
        // System is redirecting you
        console.log('Message:', action.message);
        break;
}
```

### Step 6: Review Feedback

When the interview completes, you'll receive comprehensive feedback:

```typescript
const feedback = action.feedback;

// Overall scores
console.log('Overall Score:', feedback.scores.overall.weightedTotal);
console.log('Grade:', feedback.scores.overall.grade);

// Communication scores
console.log('Communication:', feedback.scores.communication.total);
console.log('  Clarity:', feedback.scores.communication.clarity);
console.log('  Articulation:', feedback.scores.communication.articulation);

// Technical scores
console.log('Technical:', feedback.scores.technical.total);
console.log('  Depth:', feedback.scores.technical.depth);
console.log('  Accuracy:', feedback.scores.technical.accuracy);

// Strengths and improvements
console.log('Strengths:', feedback.strengths);
console.log('Improvements:', feedback.improvements);

// Resume alignment (if resume was uploaded)
if (feedback.resumeAlignment) {
    console.log('Resume Alignment:', feedback.resumeAlignment.alignmentScore);
}
```

## Advanced Features

### Tracking Progress

Monitor your progress during the interview:

```typescript
const progress = interviewAI.getProgress(sessionId);

console.log(`${progress.questionsAnswered}/${progress.totalQuestions} questions`);
console.log(`${progress.percentComplete}% complete`);
console.log(`Elapsed time: ${progress.elapsedTime}ms`);
```

### Expected Duration

Get the expected interview duration:

```typescript
const duration = interviewAI.getExpectedDuration(sessionId);
console.log(`Expected duration: ${duration / 60000} minutes`);
```

### Early Termination

End the interview early if needed:

```typescript
const action = interviewAI.endInterviewEarly(sessionId);

// You'll still receive feedback based on answered questions
console.log('Partial feedback:', action.feedback);
```

### Continuation Options

After receiving feedback, you can continue practicing:

```typescript
const continuationPrompt = interviewAI.getContinuationOptions(sessionId);

console.log(continuationPrompt.message);
continuationPrompt.options.forEach(option => {
    console.log(`- ${option.label}: ${option.description}`);
});

// Start a new session
const newSessionId = interviewAI.continueWithNewSession({
    type: 'another-round',
    role: 'software-engineer',
    level: 'mid'
});
```

### Behavior Adaptation

The system adapts its communication style based on your behavior:

```typescript
// Check current behavior type
const behaviorType = interviewAI.getCurrentBehaviorType(sessionId);
console.log('Behavior:', behaviorType); // 'confused', 'efficient', 'chatty', etc.

// Get adapted responses
const adapted = interviewAI.getAdaptedResponse(sessionId, 'Some content');
console.log('Adapted:', adapted);

// Get acknowledgments and transitions
const ack = interviewAI.getAcknowledgment(sessionId);
const transition = interviewAI.getTransition(sessionId);
```

### Interaction Modes

Choose between text and voice modes:

```typescript
// Text mode (default)
const textSession = interviewAI.createSession('software-engineer', 'entry', 'text');

// Voice mode
const voiceSession = interviewAI.createSession('software-engineer', 'entry', 'voice');
```

### Session Management

Manage multiple sessions:

```typescript
// Get all active sessions
const sessions = interviewAI.getActiveSessions();
console.log('Active sessions:', sessions);

// Cleanup when done
interviewAI.cleanupSession(sessionId);
```

## API Reference

### InterviewPrepAI Class

#### Constructor

```typescript
new InterviewPrepAI(config?: InterviewPrepConfig)
```

Configuration options:
- `debug`: Enable debug logging (default: false)
- `logger`: Custom logger function
- `averageQuestionTime`: Average time per question in ms (default: 180000)

#### Methods

**Session Management**
- `createSession(role, level, mode?)`: Create a new interview session
- `cleanupSession(sessionId)`: Clean up session data
- `getActiveSessions()`: Get all active session IDs

**Interview Flow**
- `startInterview(sessionId)`: Start the interview and get first question
- `submitResponse(sessionId, response)`: Submit a response and get next action
- `endInterviewEarly(sessionId)`: End interview early with partial feedback

**Resume**
- `uploadResume(sessionId, resumeData)`: Upload and analyze resume

**Progress & Status**
- `getProgress(sessionId)`: Get current interview progress
- `getExpectedDuration(sessionId)`: Get expected interview duration
- `getCurrentBehaviorType(sessionId)`: Get current behavior classification

**Continuation**
- `getContinuationOptions(sessionId)`: Get continuation options after feedback
- `continueWithNewSession(options)`: Create new session from continuation

**Adaptation**
- `getAdaptedResponse(sessionId, content)`: Get behavior-adapted response
- `getAcknowledgment(sessionId)`: Get acknowledgment message
- `getTransition(sessionId)`: Get transition message

**Metadata**
- `getAvailableRoles()`: Get list of available job roles
- `getAvailableExperienceLevels()`: Get list of experience levels

## Examples

### Example 1: Complete Interview Flow

See `examples/complete-demo.ts` for a full demonstration.

### Example 2: Resume-Aware Interview

```typescript
const interviewAI = new InterviewPrepAI();

// Create session
const sessionId = interviewAI.createSession('software-engineer', 'mid');

// Upload resume
const resume = {
    content: 'Your resume content here...',
    format: 'text/plain',
    filename: 'resume.txt'
};
const analysis = interviewAI.uploadResume(sessionId, resume);

// Start interview - questions will reference your resume
const question = interviewAI.startInterview(sessionId);
console.log(question.text);
// Example: "I see you worked with React at TechCorp. Can you describe..."
```

### Example 3: Handling Different Behavior Types

See `examples/behavior-examples.ts` for detailed examples of each behavior type.

### Example 4: Early Termination and Continuation

```typescript
// Start interview
const sessionId = interviewAI.createSession('software-engineer', 'entry');
interviewAI.startInterview(sessionId);

// Answer some questions
interviewAI.submitResponse(sessionId, 'Answer 1');
interviewAI.submitResponse(sessionId, 'Answer 2');

// Need to stop early
const action = interviewAI.endInterviewEarly(sessionId);
console.log('Partial feedback:', action.feedback);

// Get continuation options
const options = interviewAI.getContinuationOptions(sessionId);

// Continue with same role
const newSession = interviewAI.continueWithNewSession({
    type: 'another-round',
    role: 'software-engineer',
    level: 'entry'
});
```

## Troubleshooting

### Common Issues

**Issue: InvalidRoleInputError**
```
Solution: Check available roles and levels using:
- interviewAI.getAvailableRoles()
- interviewAI.getAvailableExperienceLevels()
```

**Issue: Resume parsing fails**
```
Solution: The system will notify you and continue with generic questions.
Ensure your resume is in plain text format.
```

**Issue: Session not found**
```
Solution: Verify the sessionId is correct and the session hasn't been cleaned up.
```

**Issue: Invalid state transition**
```
Solution: Follow the proper flow:
1. Create session
2. (Optional) Upload resume
3. Start interview
4. Submit responses
5. Handle completion
```

### Debug Mode

Enable debug mode for detailed logging:

```typescript
const interviewAI = new InterviewPrepAI({ debug: true });
```

### Custom Logger

Provide a custom logger:

```typescript
const interviewAI = new InterviewPrepAI({
    logger: (level, message, data) => {
        console.log(`[${level}] ${message}`, data);
    }
});
```

## Best Practices

1. **Always handle all action types** when submitting responses
2. **Upload resume before starting** for personalized questions
3. **Clean up sessions** when done to free memory
4. **Check progress regularly** to inform the user
5. **Handle errors gracefully** with try-catch blocks
6. **Use continuation options** to encourage continued practice

## Support

For issues, questions, or contributions, please visit the project repository.
