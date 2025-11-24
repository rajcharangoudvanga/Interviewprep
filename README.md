# InterviewPrepAI

An adaptive mock interview coaching system that conducts role-specific interviews, analyzes candidate resumes, provides intelligent follow-up questions, and delivers comprehensive feedback with scoring rubrics.

## 🚀 Quick Start - Run on Localhost

```bash
# Install dependencies
npm install

# Start the web server
npm start

# Open your browser
# 👉 http://localhost:3000
```

**That's it!** You now have a full web interface to practice mock interviews.

### 🎤 Voice Mode Available!
Practice interviews by **speaking** instead of typing:
- **Text Mode:** http://localhost:3000 (type responses)
- **Voice Mode:** http://localhost:3000/index-voice.html (speak responses)

See **[START_HERE.md](START_HERE.md)** for quick start, **[VOICE_MODE_GUIDE.md](VOICE_MODE_GUIDE.md)** for voice features, or **[LOCALHOST_GUIDE.md](LOCALHOST_GUIDE.md)** for advanced usage.

## Project Structure

```
interview-prep-ai/
├── src/
│   ├── models/           # Core data models and type definitions
│   │   └── types.ts
│   ├── services/         # Business logic services
│   │   ├── SessionManager.ts
│   │   ├── ResumeParser.ts
│   │   ├── QuestionGenerator.ts
│   │   ├── ResponseEvaluator.ts
│   │   ├── BehaviorClassifier.ts
│   │   └── FeedbackGenerator.ts
│   ├── controllers/      # Interview flow controllers
│   │   └── InterviewController.ts
│   ├── utils/           # Utility functions
│   │   ├── validation.ts
│   │   └── generators.ts
│   └── index.ts         # Main exports
├── .kiro/
│   └── specs/
│       └── interview-prep-ai/
│           ├── requirements.md
│           ├── design.md
│           └── tasks.md
├── package.json
├── tsconfig.json
├── jest.config.js
└── README.md
```

## Setup

Install dependencies:
```bash
npm install
```

## Testing

Run all tests:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

## Build

Compile TypeScript:
```bash
npm run build
```

## Documentation

Comprehensive documentation is available:

- **[User Guide](docs/USER_GUIDE.md)** - Complete guide to using the system
- **[API Reference](docs/API_REFERENCE.md)** - Detailed API documentation
- **[Quick Reference](docs/QUICK_REFERENCE.md)** - Quick reference for common tasks
- **[Architecture](ARCHITECTURE.md)** - System architecture and design
- **[Integration Guide](INTEGRATION.md)** - Integration patterns and best practices

## Examples

The `examples/` directory contains comprehensive demonstrations:

### Sample Data
- **sample-roles.ts** - Example job role configurations with question banks
- **sample-resumes.ts** - Example resumes for different experience levels

### Demonstrations
- **complete-demo.ts** - Full interview flow demonstration with all features
- **behavior-examples.ts** - Examples of each behavior type adaptation

### Basic Usage
- **quick-start.ts** - Minimal code to get started quickly
- **basic-usage.ts** - Complete interview flow with detailed logging
- **error-handling.ts** - Proper error handling patterns

### Running Examples

Run the complete demo:
```bash
npm run build
ts-node examples/complete-demo.ts
```

Or run individual examples:
```bash
ts-node examples/quick-start.ts
ts-node examples/behavior-examples.ts
```

See [examples/README.md](examples/README.md) for detailed information about all examples.

## Core Components

- **SessionManager**: Orchestrates interview lifecycle
- **ResumeParser**: Extracts structured information from resumes
- **QuestionGenerator**: Generates role-specific questions
- **ResponseEvaluator**: Analyzes candidate responses
- **BehaviorClassifier**: Adapts communication style
- **FeedbackGenerator**: Produces comprehensive feedback reports
- **InterviewController**: Manages interview flow and timing

## Usage

### Basic Example

```typescript
import { createInterviewPrepAI } from './src/index';

// Create an instance
const interviewAI = createInterviewPrepAI({
    debug: true // Enable debug logging
});

// Get available roles and levels
const roles = interviewAI.getAvailableRoles();
const levels = interviewAI.getAvailableExperienceLevels();

// Create a session
const sessionId = interviewAI.createSession('software-engineer', 'mid');

// Optional: Upload resume
const resume = {
    content: 'Your resume text here...',
    format: 'text' as const,
    filename: 'resume.txt'
};
const analysis = interviewAI.uploadResume(sessionId, resume);

// Start interview
const firstQuestion = interviewAI.startInterview(sessionId);
console.log('Question:', firstQuestion.text);

// Submit response
const action = interviewAI.submitResponse(sessionId, 'My detailed answer...');

if (action.type === 'next-question') {
    console.log('Next question:', action.question.text);
} else if (action.type === 'follow-up') {
    console.log('Follow-up:', action.question.text);
} else if (action.type === 'complete') {
    console.log('Interview complete!');
    console.log('Feedback:', action.feedback);
}

// Check progress
const progress = interviewAI.getProgress(sessionId);
console.log(`Progress: ${progress.percentComplete}%`);

// End early if needed
const earlyAction = interviewAI.endInterviewEarly(sessionId);

// Get continuation options
const continuationPrompt = interviewAI.getContinuationOptions(sessionId);

// Cleanup when done
interviewAI.cleanupSession(sessionId);
```

### Complete Interview Flow

```typescript
import { createInterviewPrepAI, InterviewAction } from './src/index';

async function conductInterview() {
    const interviewAI = createInterviewPrepAI();
    
    // Setup
    const sessionId = interviewAI.createSession('data-scientist', 'senior');
    
    // Start
    let currentQuestion = interviewAI.startInterview(sessionId);
    
    // Interview loop
    while (true) {
        console.log(`\nQuestion (${currentQuestion.type}): ${currentQuestion.text}`);
        
        // Get user response (in real app, this would be from UI)
        const userResponse = 'Detailed answer here...';
        
        // Process response
        const action = interviewAI.submitResponse(sessionId, userResponse);
        
        if (action.type === 'next-question' || action.type === 'follow-up') {
            currentQuestion = action.question;
        } else if (action.type === 'complete') {
            console.log('\n=== Interview Complete ===');
            console.log(`Overall Grade: ${action.feedback.scores.overall.grade}`);
            console.log(`Score: ${action.feedback.scores.overall.weightedTotal.toFixed(1)}/100`);
            console.log('\nStrengths:');
            action.feedback.strengths.forEach(s => console.log(`- ${s}`));
            console.log('\nImprovements:');
            action.feedback.improvements.forEach(i => console.log(`- ${i.category}: ${i.suggestion}`));
            break;
        } else if (action.type === 'redirect') {
            console.log('Redirect:', action.message);
        }
    }
    
    // Cleanup
    interviewAI.cleanupSession(sessionId);
}
```

### Configuration Options

```typescript
const interviewAI = createInterviewPrepAI({
    debug: true, // Enable debug logging
    logger: (level, message, data) => {
        // Custom logger
        console.log(`[${level}] ${message}`, data);
    },
    averageQuestionTime: 5 * 60 * 1000 // 5 minutes per question
});
```

### Available Job Roles

- Software Engineer
- Product Manager
- Data Scientist
- Frontend Engineer
- Backend Engineer
- DevOps Engineer

### Experience Levels

- Entry (0-2 years)
- Mid (2-5 years)
- Senior (5-10 years)
- Lead (10+ years)

## API Reference

### Main Class: `InterviewPrepAI`

#### Session Management
- `createSession(roleIdOrName, levelName, interactionMode?)` - Create new interview session
- `getActiveSessions()` - Get all active session IDs
- `cleanupSession(sessionId)` - Cleanup session data

#### Interview Flow
- `startInterview(sessionId)` - Start interview and get first question
- `submitResponse(sessionId, response)` - Submit response and get next action
- `endInterviewEarly(sessionId)` - End interview early with partial feedback

#### Resume Management
- `uploadResume(sessionId, resumeData)` - Upload and analyze resume

#### Progress Tracking
- `getProgress(sessionId)` - Get current interview progress
- `getExpectedDuration(sessionId)` - Get expected interview duration

#### Continuation
- `getContinuationOptions(sessionId)` - Get continuation options after completion
- `continueWithNewSession(continuationOptions)` - Create continuation session

#### Behavior Adaptation
- `getCurrentBehaviorType(sessionId)` - Get current behavior classification
- `getAdaptedResponse(sessionId, content)` - Get behavior-adapted response
- `getAcknowledgment(sessionId)` - Get behavior-appropriate acknowledgment
- `getTransition(sessionId)` - Get behavior-appropriate transition

#### Role Information
- `getAvailableRoles()` - Get all available job roles
- `getAvailableExperienceLevels()` - Get all experience levels

## Testing Strategy

The project uses:
- **Jest** for unit testing
- **fast-check** for property-based testing (minimum 100 iterations per property)

All property-based tests are tagged with references to correctness properties in the design document.

## Error Handling

The system includes comprehensive error handling:

- `InvalidRoleInputError` - Thrown when invalid role or level is provided
- `SessionError` - Thrown for session-related errors
- `InvalidStateTransitionError` - Thrown for invalid state transitions
- `ResumeParsingError` - Thrown when resume parsing fails (handled gracefully)

All errors include descriptive messages and relevant context for debugging.
