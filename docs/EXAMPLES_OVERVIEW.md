# Examples Overview

This document provides an overview of all example materials included with InterviewPrepAI.

## Quick Navigation

- [Sample Data](#sample-data)
- [Demo Scripts](#demo-scripts)
- [Behavior Examples](#behavior-examples)
- [Basic Usage Examples](#basic-usage-examples)
- [Running the Examples](#running-the-examples)

## Sample Data

### Sample Roles (`examples/sample-roles.ts`)

Pre-configured job roles with question banks:

1. **Software Engineer**
   - Technical skills: Data Structures, Algorithms, System Design, etc.
   - Question categories: Algorithms (25%), System Design (25%), Coding Practices (20%), Teamwork (15%), Problem Solving (15%)

2. **Product Manager**
   - Technical skills: Product Strategy, Market Analysis, User Research, etc.
   - Question categories: Product Strategy (30%), User Research (20%), Leadership (25%), Stakeholder Management (25%)

3. **Data Scientist**
   - Technical skills: Machine Learning, Statistics, Python/R, etc.
   - Question categories: Machine Learning (30%), Statistics (25%), Data Analysis (20%), Communication (15%), Business Impact (10%)

### Sample Resumes (`examples/sample-resumes.ts`)

Example resumes for different experience levels:

#### Software Engineer Resumes
- **Entry-Level (John Doe)**: Recent graduate with internship, academic projects
- **Mid-Level (Sarah Johnson)**: 4 years experience, microservices, mentoring
- **Senior (Michael Chen)**: 8+ years, staff engineer, distributed systems

#### Other Roles
- **Entry-Level Product Manager (Emily Rodriguez)**: Recent graduate with PM internship
- **Entry-Level Data Scientist (Alex Kim)**: Master's degree with ML projects

Each resume includes:
- Education and certifications
- Technical skills
- Work experience
- Projects and achievements
- Realistic content for testing resume-aware features

## Demo Scripts

### Complete Demo (`examples/complete-demo.ts`)

Comprehensive demonstration with three scenarios:

#### 1. Entry-Level Interview Demo (`demoEntryLevelInterview`)
Shows complete interview lifecycle:
- Creating session
- Uploading resume
- Starting interview
- Submitting responses (good, vague, improved)
- Behavior adaptation
- Progress tracking
- Feedback generation
- Continuation options

**Run it:**
```typescript
import { demoEntryLevelInterview } from './examples/complete-demo';
await demoEntryLevelInterview();
```

#### 2. Behavior Types Demo (`demoBehaviorTypes`)
Demonstrates all behavior adaptations:
- Confused behavior (needs guidance)
- Efficient behavior (concise responses)
- Chatty behavior (verbose, off-topic)
- Edge case behavior (invalid inputs)

**Run it:**
```typescript
import { demoBehaviorTypes } from './examples/complete-demo';
await demoBehaviorTypes();
```

#### 3. Early Termination Demo (`demoEarlyTermination`)
Shows early termination flow:
- Starting interview
- Answering partial questions
- Ending early
- Receiving partial feedback
- Getting continuation options
- Creating new session

**Run it:**
```typescript
import { demoEarlyTermination } from './examples/complete-demo';
await demoEarlyTermination();
```

#### Run All Demos
```bash
ts-node examples/complete-demo.ts
```

## Behavior Examples

### Behavior Examples (`examples/behavior-examples.ts`)

Detailed examples of each behavior type with:
- Scenario description
- Trigger conditions
- System behavior and adaptation
- Example responses

#### Confused Behavior
```typescript
Trigger: "I'm not sure what you mean. Can you explain?"
System: Provides detailed guidance and clarification
```

#### Efficient Behavior
```typescript
Trigger: "Use hash map. O(n) time, O(n) space."
System: Concise acknowledgment, fast pace
```

#### Chatty Behavior
```typescript
Trigger: Long, off-topic responses
System: Polite redirection to stay focused
```

#### Edge Case Behavior
```typescript
Trigger: "skip" or invalid commands
System: Explains limitations, offers alternatives
```

#### Standard Behavior
```typescript
Trigger: Well-structured, appropriate responses
System: Professional, encouraging tone
```

**View examples:**
```bash
ts-node examples/behavior-examples.ts
```

## Basic Usage Examples

### Quick Start (`examples/quick-start.ts`)

Minimal example to get started:
- Create instance
- Create session
- Start interview
- Submit one response
- Handle action
- Cleanup

**Perfect for:** First-time users, quick testing

### Basic Usage (`examples/basic-usage.ts`)

Complete interview flow with:
- Viewing available roles and levels
- Creating session with configuration
- Uploading resume
- Conducting full interview
- Tracking progress
- Reviewing detailed feedback
- Continuation options

**Perfect for:** Understanding full workflow, integration reference

### Error Handling (`examples/error-handling.ts`)

Demonstrates proper error handling:
- Invalid role input
- Invalid experience level
- Session not found
- Invalid state transitions
- Malformed resume handling
- Production-ready error handling pattern

**Perfect for:** Building robust applications, error recovery

## Running the Examples

### Prerequisites

Build the project first:
```bash
npm install
npm run build
```

### Run Individual Examples

```bash
# Quick start
ts-node examples/quick-start.ts

# Basic usage
ts-node examples/basic-usage.ts

# Error handling
ts-node examples/error-handling.ts

# Complete demo (all scenarios)
ts-node examples/complete-demo.ts

# Behavior examples
ts-node examples/behavior-examples.ts
```

### Import and Use in Your Code

```typescript
// Import sample data
import { sampleResumes } from './examples/sample-resumes';
import { sampleRoles } from './examples/sample-roles';

// Import demo functions
import {
    demoEntryLevelInterview,
    demoBehaviorTypes,
    demoEarlyTermination,
    runAllDemos
} from './examples/complete-demo';

// Import behavior examples
import { allBehaviorExamples, printBehaviorExamples } from './examples/behavior-examples';

// Use in your code
const resume = sampleResumes.softwareEngineer.mid;
const role = sampleRoles[0]; // Software Engineer

await demoEntryLevelInterview();
```

## Example Use Cases

### 1. Testing Resume Parsing

```typescript
import { InterviewPrepAI } from '../src/index';
import { entryLevelSWEResume, seniorSWEResume } from './sample-resumes';

const interviewAI = new InterviewPrepAI();

// Test with different experience levels
const sessionEntry = interviewAI.createSession('software-engineer', 'entry');
const analysisEntry = interviewAI.uploadResume(sessionEntry, entryLevelSWEResume);

const sessionSenior = interviewAI.createSession('software-engineer', 'senior');
const analysisSenior = interviewAI.uploadResume(sessionSenior, seniorSWEResume);

console.log('Entry alignment:', analysisEntry.alignmentScore.overall);
console.log('Senior alignment:', analysisSenior.alignmentScore.overall);
```

### 2. Testing Behavior Adaptation

```typescript
import { InterviewPrepAI } from '../src/index';

const interviewAI = new InterviewPrepAI();
const sessionId = interviewAI.createSession('software-engineer', 'mid');
interviewAI.startInterview(sessionId);

// Test different response patterns
const responses = [
    "I'm not sure what you mean",           // Confused
    "Hash map. O(n).",                      // Efficient
    "Well, you know, I think maybe...",     // Chatty
    "skip"                                   // Edge case
];

responses.forEach(response => {
    interviewAI.submitResponse(sessionId, response);
    const behavior = interviewAI.getCurrentBehaviorType(sessionId);
    console.log(`Response: "${response}" -> Behavior: ${behavior}`);
});
```

### 3. Testing Complete Interview Flow

```typescript
import { InterviewPrepAI } from '../src/index';
import { midLevelSWEResume } from './sample-resumes';

const interviewAI = new InterviewPrepAI({ debug: true });

// Setup
const sessionId = interviewAI.createSession('software-engineer', 'mid');
interviewAI.uploadResume(sessionId, midLevelSWEResume);

// Conduct interview
let question = interviewAI.startInterview(sessionId);
let action;

const responses = [
    "I would use a hash map for O(1) lookups...",
    "In my previous role, I led a team of 5 engineers...",
    "The main challenge was maintaining data consistency...",
    "I stay current by reading technical blogs and contributing to open source...",
    "For system design, I start with requirements gathering..."
];

for (const response of responses) {
    action = interviewAI.submitResponse(sessionId, response);
    if (action.type === 'complete') break;
}

// Review feedback
if (action.type === 'complete') {
    console.log('Grade:', action.feedback.scores.overall.grade);
    console.log('Score:', action.feedback.scores.overall.weightedTotal);
}
```

### 4. Testing Early Termination

```typescript
import { InterviewPrepAI } from '../src/index';

const interviewAI = new InterviewPrepAI();
const sessionId = interviewAI.createSession('software-engineer', 'entry');
interviewAI.startInterview(sessionId);

// Answer a few questions
interviewAI.submitResponse(sessionId, "Answer 1");
interviewAI.submitResponse(sessionId, "Answer 2");

// Check progress
const progress = interviewAI.getProgress(sessionId);
console.log(`Answered ${progress.questionsAnswered} of ${progress.totalQuestions}`);

// End early
const action = interviewAI.endInterviewEarly(sessionId);
console.log('Partial feedback:', action.feedback.summary);
```

## Tips for Using Examples

1. **Start with quick-start.ts** to understand the basic flow
2. **Review complete-demo.ts** for comprehensive usage patterns
3. **Study behavior-examples.ts** to understand adaptation
4. **Use sample resumes** to test resume-aware features
5. **Modify examples** to test your own scenarios
6. **Check error-handling.ts** for robust error management
7. **Run demos with debug mode** to see detailed logging

## Next Steps

After exploring the examples:

1. Read the [User Guide](USER_GUIDE.md) for detailed documentation
2. Check the [API Reference](API_REFERENCE.md) for complete API details
3. Review the [Quick Reference](QUICK_REFERENCE.md) for common patterns
4. See the [Architecture](../ARCHITECTURE.md) for system design
5. Check the [Integration Guide](../INTEGRATION.md) for integration patterns

## Contributing Examples

To add new examples:

1. Create a new file in `examples/` directory
2. Follow the existing naming convention
3. Include clear comments and documentation
4. Add entry to `examples/README.md`
5. Update this overview document
6. Test thoroughly before committing
