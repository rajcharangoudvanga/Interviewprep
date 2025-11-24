# InterviewPrepAI Examples

This directory contains example code and demonstrations for the InterviewPrepAI system.

## Files Overview

### Sample Data

- **`sample-roles.ts`** - Example job role configurations with question banks
  - Software Engineer role
  - Product Manager role
  - Data Scientist role

- **`sample-resumes.ts`** - Example resume documents for different experience levels
  - Entry-level Software Engineer
  - Mid-level Software Engineer
  - Senior Software Engineer
  - Entry-level Product Manager
  - Entry-level Data Scientist

### Demonstrations

- **`complete-demo.ts`** - Complete interview flow demonstration
  - Shows full interview lifecycle from start to finish
  - Demonstrates resume upload and analysis
  - Shows behavior adaptation
  - Displays feedback generation
  - Demonstrates continuation options

- **`behavior-examples.ts`** - Examples of each behavior type
  - Confused behavior (needs guidance)
  - Efficient behavior (concise responses)
  - Chatty behavior (verbose responses)
  - Edge case behavior (invalid inputs)
  - Standard behavior (normal responses)

### Basic Usage Examples

- **`quick-start.ts`** - Minimal example to get started quickly
- **`basic-usage.ts`** - Common usage patterns
- **`error-handling.ts`** - Error handling examples

## Running the Examples

### Prerequisites

Make sure you have built the project:

```bash
npm run build
```

### Run Complete Demo

```bash
npm run dev
# or
ts-node examples/complete-demo.ts
```

This will run all three demo scenarios:
1. Entry-level interview with resume
2. Behavior type demonstrations
3. Early termination and continuation

### Run Individual Demos

```typescript
import { demoEntryLevelInterview, demoBehaviorTypes, demoEarlyTermination } from './examples/complete-demo';

// Run specific demo
await demoEntryLevelInterview();
```

### View Behavior Examples

```bash
ts-node examples/behavior-examples.ts
```

This will print detailed examples of how the system adapts to different behavior types.

## Example Scenarios

### Scenario 1: Entry-Level Software Engineer

```typescript
import { InterviewPrepAI } from '../src/index';
import { entryLevelSWEResume } from './sample-resumes';

const interviewAI = new InterviewPrepAI();

// Create session for entry-level software engineer
const sessionId = interviewAI.createSession('software-engineer', 'entry');

// Upload resume for personalized questions
const analysis = interviewAI.uploadResume(sessionId, entryLevelSWEResume);
console.log('Alignment Score:', analysis.alignmentScore.overall);

// Start interview
const firstQuestion = interviewAI.startInterview(sessionId);
console.log('Question:', firstQuestion.text);

// Submit response
const action = interviewAI.submitResponse(sessionId, "My answer...");
```

### Scenario 2: Mid-Level with Efficient Behavior

```typescript
import { midLevelSWEResume } from './sample-resumes';

const sessionId = interviewAI.createSession('software-engineer', 'mid');
interviewAI.uploadResume(sessionId, midLevelSWEResume);
interviewAI.startInterview(sessionId);

// Concise, technical response
const action = interviewAI.submitResponse(
    sessionId,
    "Use hash map. O(n) time, O(n) space."
);

// System adapts with concise acknowledgment
const behaviorType = interviewAI.getCurrentBehaviorType(sessionId);
console.log('Behavior:', behaviorType); // 'efficient'
```

### Scenario 3: Confused Candidate

```typescript
const sessionId = interviewAI.createSession('software-engineer', 'entry');
interviewAI.startInterview(sessionId);

// Confused response
const action = interviewAI.submitResponse(
    sessionId,
    "I'm not sure what you mean. Can you explain?"
);

// System provides guidance
const adapted = interviewAI.getAdaptedResponse(
    sessionId,
    'Let me clarify the question.'
);
console.log('Adapted:', adapted); // Detailed, helpful explanation
```

### Scenario 4: Early Termination

```typescript
const sessionId = interviewAI.createSession('software-engineer', 'mid');
interviewAI.startInterview(sessionId);

// Answer a few questions
interviewAI.submitResponse(sessionId, "Answer 1");
interviewAI.submitResponse(sessionId, "Answer 2");

// End early
const action = interviewAI.endInterviewEarly(sessionId);
console.log('Partial feedback:', action.feedback);

// Get continuation options
const options = interviewAI.getContinuationOptions(sessionId);
console.log('Continue with:', options.options.map(o => o.label));
```

### Scenario 5: Resume-Aware Questions

```typescript
import { seniorSWEResume } from './sample-resumes';

const sessionId = interviewAI.createSession('software-engineer', 'senior');

// Upload senior-level resume
const analysis = interviewAI.uploadResume(sessionId, seniorSWEResume);

// Questions will reference resume content
const question = interviewAI.startInterview(sessionId);
console.log(question.text);
// Example: "I see you architected a payment processing platform at MegaCorp.
//           Can you describe the fault-tolerance mechanisms you implemented?"
```

## Sample Resumes

### Entry-Level Software Engineer (John Doe)
- Recent graduate with internship experience
- Skills: Python, JavaScript, React, Node.js
- Projects: E-commerce website, task management app
- Good for: Entry-level interview practice

### Mid-Level Software Engineer (Sarah Johnson)
- 4 years of experience
- Skills: Full-stack development, microservices, cloud (AWS)
- Experience: Led technical initiatives, mentored juniors
- Good for: Mid-level interview practice

### Senior Software Engineer (Michael Chen)
- 8+ years of experience
- Skills: System architecture, distributed systems, multi-cloud
- Experience: Staff engineer, led critical infrastructure projects
- Good for: Senior/lead interview practice

### Entry-Level Product Manager (Emily Rodriguez)
- Recent graduate with PM internship
- Skills: User research, roadmap planning, analytics
- Good for: Entry-level PM interview practice

### Entry-Level Data Scientist (Alex Kim)
- Master's degree in Data Science
- Skills: Python, ML, data analysis, visualization
- Projects: Churn prediction, sentiment analysis
- Good for: Entry-level DS interview practice

## Behavior Type Examples

### Confused Behavior
**Trigger:** "I'm not sure what you mean"
**System Response:** Provides detailed guidance and clarification

### Efficient Behavior
**Trigger:** "Hash map. O(n) time."
**System Response:** Concise acknowledgment, fast pace

### Chatty Behavior
**Trigger:** Long, off-topic responses
**System Response:** Polite redirection to stay focused

### Edge Case Behavior
**Trigger:** "skip" or invalid commands
**System Response:** Explains limitations, offers alternatives

### Standard Behavior
**Trigger:** Well-structured, appropriate responses
**System Response:** Professional, encouraging tone

## Tips for Using Examples

1. **Start with quick-start.ts** to understand basic flow
2. **Review complete-demo.ts** for comprehensive usage
3. **Study behavior-examples.ts** to understand adaptation
4. **Use sample resumes** to test resume-aware features
5. **Modify examples** to test your own scenarios

## Creating Custom Examples

You can create your own examples by:

1. **Custom Resumes:**
```typescript
const myResume: ResumeDocument = {
    content: 'Your resume text...',
    format: 'text/plain',
    filename: 'my_resume.txt'
};
```

2. **Custom Scenarios:**
```typescript
const sessionId = interviewAI.createSession('your-role', 'your-level');
// ... your custom flow
```

3. **Custom Behavior Testing:**
```typescript
// Test specific response patterns
const responses = [
    "Very detailed technical response...",
    "Short response",
    "I don't understand",
    "skip"
];

responses.forEach(response => {
    const action = interviewAI.submitResponse(sessionId, response);
    console.log('Behavior:', interviewAI.getCurrentBehaviorType(sessionId));
});
```

## Next Steps

- Read the [User Guide](../docs/USER_GUIDE.md) for detailed documentation
- Check the [API Reference](../docs/API_REFERENCE.md) for complete API details
- Review the [Architecture](../ARCHITECTURE.md) for system design
- See [Integration Guide](../INTEGRATION.md) for integration patterns
