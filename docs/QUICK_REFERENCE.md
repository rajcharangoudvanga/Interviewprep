# InterviewPrepAI Quick Reference

## Installation

```bash
npm install interview-prep-ai
```

## Basic Setup

```typescript
import { InterviewPrepAI } from 'interview-prep-ai';

const interviewAI = new InterviewPrepAI();
```

## Common Workflows

### 1. Simple Interview (No Resume)

```typescript
// Create session
const sessionId = interviewAI.createSession('software-engineer', 'mid');

// Start interview
const question = interviewAI.startInterview(sessionId);

// Submit response
const action = interviewAI.submitResponse(sessionId, "My answer");

// Handle action
if (action.type === 'complete') {
    console.log('Feedback:', action.feedback);
}

// Cleanup
interviewAI.cleanupSession(sessionId);
```

### 2. Interview with Resume

```typescript
// Create session
const sessionId = interviewAI.createSession('software-engineer', 'mid');

// Upload resume
const resume = {
    content: 'Resume text...',
    format: 'text/plain',
    filename: 'resume.txt'
};
const analysis = interviewAI.uploadResume(sessionId, resume);

// Start interview (questions will reference resume)
const question = interviewAI.startInterview(sessionId);

// Continue as normal...
```

### 3. Early Termination

```typescript
// During interview
const action = interviewAI.endInterviewEarly(sessionId);

// Get partial feedback
console.log('Partial feedback:', action.feedback);
```

### 4. Continuation

```typescript
// After feedback
const options = interviewAI.getContinuationOptions(sessionId);

// Start new session
const newSessionId = interviewAI.continueWithNewSession({
    type: 'another-round',
    role: 'software-engineer',
    level: 'mid'
});
```

## Available Roles

- `software-engineer` - Software Engineer
- `product-manager` - Product Manager
- `data-scientist` - Data Scientist
- `frontend-engineer` - Frontend Engineer
- `backend-engineer` - Backend Engineer
- `devops-engineer` - DevOps Engineer

## Experience Levels

- `entry` - 0-2 years
- `mid` - 2-5 years
- `senior` - 5-10 years
- `lead` - 10+ years

## Action Types

### next-question
```typescript
{
    type: 'next-question',
    question: InterviewQuestion
}
```
System is moving to the next primary question.

### follow-up
```typescript
{
    type: 'follow-up',
    question: InterviewQuestion
}
```
System wants more detail on your previous answer.

### complete
```typescript
{
    type: 'complete',
    feedback: FeedbackReport
}
```
Interview is complete, feedback is available.

### redirect
```typescript
{
    type: 'redirect',
    message: string
}
```
System is redirecting you (e.g., invalid input).

## Feedback Structure

```typescript
feedback.scores.overall.weightedTotal  // 0-100
feedback.scores.overall.grade          // A, B, C, D, F

feedback.scores.communication.total    // 0-40
feedback.scores.communication.clarity  // 0-10
feedback.scores.communication.articulation  // 0-10
feedback.scores.communication.structure     // 0-10
feedback.scores.communication.professionalism  // 0-10

feedback.scores.technical.total        // 0-40
feedback.scores.technical.depth        // 0-10
feedback.scores.technical.accuracy     // 0-10
feedback.scores.technical.relevance    // 0-10
feedback.scores.technical.problemSolving  // 0-10

feedback.strengths                     // string[]
feedback.improvements                  // Improvement[]
feedback.resumeAlignment               // AlignmentFeedback (if resume uploaded)
feedback.summary                       // string
```

## Progress Tracking

```typescript
const progress = interviewAI.getProgress(sessionId);

progress.questionsAnswered      // number
progress.totalQuestions         // number
progress.percentComplete        // number (0-100)
progress.elapsedTime           // milliseconds
progress.estimatedTimeRemaining // milliseconds
```

## Behavior Types

The system adapts to these behavior patterns:

- **confused** - Needs guidance and clarification
- **efficient** - Concise, direct responses
- **chatty** - Verbose, off-topic responses
- **edge-case** - Invalid inputs or commands
- **standard** - Normal, appropriate responses

```typescript
const behaviorType = interviewAI.getCurrentBehaviorType(sessionId);
const adapted = interviewAI.getAdaptedResponse(sessionId, content);
```

## Error Handling

```typescript
import { InvalidRoleInputError, SessionError } from 'interview-prep-ai';

try {
    const sessionId = interviewAI.createSession(role, level);
} catch (error) {
    if (error instanceof InvalidRoleInputError) {
        console.log('Available options:', error.availableOptions);
    } else if (error instanceof SessionError) {
        console.log('Session error:', error.message);
    }
}
```

## Configuration

```typescript
const interviewAI = new InterviewPrepAI({
    debug: true,                          // Enable debug logging
    averageQuestionTime: 5 * 60 * 1000,  // 5 minutes per question
    logger: (level, message, data) => {   // Custom logger
        console.log(`[${level}] ${message}`, data);
    }
});
```

## Interaction Modes

```typescript
// Text mode (default)
const sessionId = interviewAI.createSession('software-engineer', 'mid', 'text');

// Voice mode
const sessionId = interviewAI.createSession('software-engineer', 'mid', 'voice');
```

## Common Patterns

### Loop Through Questions

```typescript
let action = { type: 'next-question', question: firstQuestion };

while (action.type !== 'complete') {
    if (action.type === 'next-question' || action.type === 'follow-up') {
        console.log('Question:', action.question.text);
        const response = getUserInput(); // Your input method
        action = interviewAI.submitResponse(sessionId, response);
    } else if (action.type === 'redirect') {
        console.log('Redirect:', action.message);
        break;
    }
}

if (action.type === 'complete') {
    console.log('Feedback:', action.feedback);
}
```

### Check Question Type

```typescript
if (question.type === 'technical') {
    console.log('Technical question about:', question.category);
} else if (question.type === 'behavioral') {
    console.log('Behavioral question about:', question.category);
}

if (question.resumeContext) {
    console.log('References your resume:', question.resumeContext.content);
}
```

### Handle Resume Analysis

```typescript
const analysis = interviewAI.uploadResume(sessionId, resume);

console.log('Alignment:', analysis.alignmentScore.overall + '%');

analysis.strengths.forEach(strength => {
    console.log('Strength:', strength.area, '-', strength.description);
});

analysis.gaps.forEach(gap => {
    console.log('Gap:', gap.area, '-', gap.description);
});

analysis.technicalSkills.forEach(skill => {
    console.log('Skill:', skill.name, '- Level:', skill.level);
});
```

### Display Feedback

```typescript
const feedback = action.feedback;

console.log(`Grade: ${feedback.scores.overall.grade}`);
console.log(`Score: ${feedback.scores.overall.weightedTotal}/100`);

console.log('\nStrengths:');
feedback.strengths.forEach(s => console.log(`  ✓ ${s}`));

console.log('\nImprovements:');
feedback.improvements.forEach(i => {
    console.log(`  • ${i.category} (${i.priority})`);
    console.log(`    ${i.suggestion}`);
});

if (feedback.resumeAlignment) {
    console.log('\nResume Alignment:', feedback.resumeAlignment.alignmentScore + '%');
}
```

## Useful Methods

```typescript
// Metadata
interviewAI.getAvailableRoles()
interviewAI.getAvailableExperienceLevels()

// Session
interviewAI.createSession(role, level, mode?)
interviewAI.cleanupSession(sessionId)
interviewAI.getActiveSessions()

// Interview
interviewAI.startInterview(sessionId)
interviewAI.submitResponse(sessionId, response)
interviewAI.endInterviewEarly(sessionId)

// Resume
interviewAI.uploadResume(sessionId, resumeData)

// Progress
interviewAI.getProgress(sessionId)
interviewAI.getExpectedDuration(sessionId)

// Behavior
interviewAI.getCurrentBehaviorType(sessionId)
interviewAI.getAdaptedResponse(sessionId, content)
interviewAI.getAcknowledgment(sessionId)
interviewAI.getTransition(sessionId)

// Continuation
interviewAI.getContinuationOptions(sessionId)
interviewAI.continueWithNewSession(options)
```

## Tips

1. **Always cleanup sessions** when done to free memory
2. **Upload resume before starting** for personalized questions
3. **Check progress regularly** to inform users
4. **Handle all action types** in your response loop
5. **Use try-catch** for error handling
6. **Enable debug mode** during development
7. **Provide feedback** to users about their behavior type
8. **Show expected duration** at the start
9. **Offer continuation options** after feedback
10. **Test with sample resumes** from examples directory
