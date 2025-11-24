# InterviewPrepAI API Reference

## Table of Contents

1. [Main Class](#main-class)
2. [Types and Interfaces](#types-and-interfaces)
3. [Error Types](#error-types)
4. [Enums](#enums)

## Main Class

### InterviewPrepAI

The main class that provides the public API for the InterviewPrepAI system.

#### Constructor

```typescript
constructor(config?: InterviewPrepConfig)
```

**Parameters:**
- `config` (optional): Configuration object

**InterviewPrepConfig:**
```typescript
interface InterviewPrepConfig {
    debug?: boolean;                    // Enable debug logging
    logger?: (level: string, message: string, data?: any) => void;
    averageQuestionTime?: number;       // Average time per question in ms
}
```

**Example:**
```typescript
const interviewAI = new InterviewPrepAI({
    debug: true,
    averageQuestionTime: 5 * 60 * 1000  // 5 minutes
});
```

---

### Methods

#### getAvailableRoles()

Get list of available job roles.

```typescript
getAvailableRoles(): JobRole[]
```

**Returns:** Array of `JobRole` objects

**Example:**
```typescript
const roles = interviewAI.getAvailableRoles();
roles.forEach(role => {
    console.log(`${role.name} (${role.id})`);
});
```

---

#### getAvailableExperienceLevels()

Get list of available experience levels.

```typescript
getAvailableExperienceLevels(): ExperienceLevel[]
```

**Returns:** Array of `ExperienceLevel` objects

**Example:**
```typescript
const levels = interviewAI.getAvailableExperienceLevels();
```

---

#### createSession()

Create a new interview session.

```typescript
createSession(
    roleIdOrName: string,
    levelName: string,
    interactionMode?: InteractionModeType
): SessionId
```

**Parameters:**
- `roleIdOrName`: Job role ID or name (e.g., 'software-engineer' or 'Software Engineer')
- `levelName`: Experience level ('entry', 'mid', 'senior', 'lead')
- `interactionMode` (optional): 'text' or 'voice' (default: 'text')

**Returns:** `SessionId` (string)

**Throws:** `InvalidRoleInputError` if role or level is invalid

**Example:**
```typescript
const sessionId = interviewAI.createSession('software-engineer', 'mid', 'text');
```

---

#### uploadResume()

Upload and analyze a resume for an existing session.

```typescript
uploadResume(sessionId: SessionId, resumeData: ResumeDocument): ResumeAnalysis
```

**Parameters:**
- `sessionId`: ID of the session
- `resumeData`: Resume document object

**Returns:** `ResumeAnalysis` object

**Throws:** `ResumeParsingError` if parsing fails (non-fatal, interview continues)

**Example:**
```typescript
const resume = {
    content: 'Resume text content...',
    format: 'text/plain',
    filename: 'resume.txt'
};
const analysis = interviewAI.uploadResume(sessionId, resume);
```

---

#### startInterview()

Start the interview and get the first question.

```typescript
startInterview(sessionId: SessionId): InterviewQuestion
```

**Parameters:**
- `sessionId`: ID of the session

**Returns:** First `InterviewQuestion`

**Throws:** `SessionError` if session not found or invalid state

**Example:**
```typescript
const firstQuestion = interviewAI.startInterview(sessionId);
console.log(firstQuestion.text);
```

---

#### submitResponse()

Submit a response to the current question and get the next action.

```typescript
submitResponse(
    sessionId: SessionId,
    response: CandidateResponse | string
): InterviewAction
```

**Parameters:**
- `sessionId`: ID of the session
- `response`: Candidate's response (can be `CandidateResponse` object or just text string)

**Returns:** `InterviewAction` indicating what to do next

**Example:**
```typescript
const action = interviewAI.submitResponse(sessionId, "My answer here");

switch (action.type) {
    case 'next-question':
        console.log('Next:', action.question.text);
        break;
    case 'follow-up':
        console.log('Follow-up:', action.question.text);
        break;
    case 'complete':
        console.log('Feedback:', action.feedback);
        break;
    case 'redirect':
        console.log('Redirect:', action.message);
        break;
}
```

---

#### getProgress()

Get the current progress of the interview.

```typescript
getProgress(sessionId: SessionId): InterviewProgress
```

**Parameters:**
- `sessionId`: ID of the session

**Returns:** `InterviewProgress` object

**Example:**
```typescript
const progress = interviewAI.getProgress(sessionId);
console.log(`${progress.percentComplete}% complete`);
```

---

#### getExpectedDuration()

Get the expected interview duration.

```typescript
getExpectedDuration(sessionId: SessionId): number
```

**Parameters:**
- `sessionId`: ID of the session

**Returns:** Expected duration in milliseconds

**Example:**
```typescript
const duration = interviewAI.getExpectedDuration(sessionId);
console.log(`Expected: ${duration / 60000} minutes`);
```

---

#### endInterviewEarly()

End the interview early.

```typescript
endInterviewEarly(sessionId: SessionId): InterviewAction
```

**Parameters:**
- `sessionId`: ID of the session

**Returns:** `InterviewAction` with type 'complete' and partial feedback

**Example:**
```typescript
const action = interviewAI.endInterviewEarly(sessionId);
console.log('Partial feedback:', action.feedback);
```

---

#### getContinuationOptions()

Generate continuation prompts after feedback delivery.

```typescript
getContinuationOptions(sessionId: SessionId): ContinuationPrompt
```

**Parameters:**
- `sessionId`: ID of the completed session

**Returns:** `ContinuationPrompt` with available options

**Example:**
```typescript
const prompt = interviewAI.getContinuationOptions(sessionId);
console.log(prompt.message);
prompt.options.forEach(opt => console.log(opt.label));
```

---

#### continueWithNewSession()

Create a new session from continuation parameters.

```typescript
continueWithNewSession(continuationOptions: ContinuationOptions): SessionId
```

**Parameters:**
- `continuationOptions`: Options for the new session

**Returns:** `SessionId` of the newly created session

**Example:**
```typescript
const newSessionId = interviewAI.continueWithNewSession({
    type: 'another-round',
    role: 'software-engineer',
    level: 'mid'
});
```

---

#### getAdaptedResponse()

Get adapted response based on user behavior.

```typescript
getAdaptedResponse(sessionId: SessionId, content: string): string
```

**Parameters:**
- `sessionId`: ID of the session
- `content`: Content to adapt

**Returns:** Adapted response content

---

#### getAcknowledgment()

Get acknowledgment message based on behavior type.

```typescript
getAcknowledgment(sessionId: SessionId): string
```

**Parameters:**
- `sessionId`: ID of the session

**Returns:** Acknowledgment message

---

#### getTransition()

Get transition message based on behavior type.

```typescript
getTransition(sessionId: SessionId): string
```

**Parameters:**
- `sessionId`: ID of the session

**Returns:** Transition message

---

#### getCurrentBehaviorType()

Get current behavior type for a session.

```typescript
getCurrentBehaviorType(sessionId: SessionId): string
```

**Parameters:**
- `sessionId`: ID of the session

**Returns:** Current behavior type ('confused', 'efficient', 'chatty', 'edge-case', 'standard')

---

#### cleanupSession()

Cleanup session data (call when session is no longer needed).

```typescript
cleanupSession(sessionId: SessionId): void
```

**Parameters:**
- `sessionId`: ID of the session

**Example:**
```typescript
interviewAI.cleanupSession(sessionId);
```

---

#### getActiveSessions()

Get all active sessions (for debugging/admin purposes).

```typescript
getActiveSessions(): SessionId[]
```

**Returns:** Array of session IDs

---

## Types and Interfaces

### SessionId

```typescript
type SessionId = string;
```

Unique identifier for an interview session.

---

### JobRole

```typescript
interface JobRole {
    id: string;
    name: string;
    technicalSkills: string[];
    behavioralCompetencies: string[];
    questionCategories: QuestionCategory[];
}
```

---

### QuestionCategory

```typescript
interface QuestionCategory {
    name: string;
    weight: number;
    technicalFocus: boolean;
}
```

---

### ExperienceLevel

```typescript
interface ExperienceLevel {
    level: 'entry' | 'mid' | 'senior' | 'lead';
    yearsMin: number;
    yearsMax: number;
    expectedDepth: number;
}
```

---

### ResumeDocument

```typescript
interface ResumeDocument {
    content: string;
    format: string;
    filename: string;
}
```

---

### ResumeAnalysis

```typescript
interface ResumeAnalysis {
    parsedResume: ParsedResume;
    strengths: Strength[];
    technicalSkills: Skill[];
    gaps: Gap[];
    alignmentScore: AlignmentScore;
    summary: string;
}
```

---

### InterviewQuestion

```typescript
interface InterviewQuestion {
    id: QuestionId;
    type: 'technical' | 'behavioral';
    text: string;
    category: string;
    difficulty: number;
    resumeContext?: ResumeReference;
    expectedElements?: string[];
}
```

---

### CandidateResponse

```typescript
interface CandidateResponse {
    questionId: QuestionId;
    text: string;
    timestamp: number;
    wordCount: number;
    responseTime: number;
}
```

---

### InterviewAction

```typescript
type InterviewAction = 
    | { type: 'next-question'; question: InterviewQuestion }
    | { type: 'follow-up'; question: InterviewQuestion }
    | { type: 'complete'; feedback: FeedbackReport }
    | { type: 'redirect'; message: string };
```

---

### InterviewProgress

```typescript
interface InterviewProgress {
    questionsAnswered: number;
    totalQuestions: number;
    percentComplete: number;
    elapsedTime: number;
    estimatedTimeRemaining: number;
}
```

---

### FeedbackReport

```typescript
interface FeedbackReport {
    sessionId: SessionId;
    scores: ScoringRubric;
    strengths: string[];
    improvements: Improvement[];
    resumeAlignment?: AlignmentFeedback;
    questionBreakdown: QuestionFeedback[];
    summary: string;
}
```

---

### ScoringRubric

```typescript
interface ScoringRubric {
    communication: CommunicationScore;
    technical: TechnicalScore;
    overall: OverallScore;
}
```

---

### CommunicationScore

```typescript
interface CommunicationScore {
    clarity: number;           // 0-10
    articulation: number;      // 0-10
    structure: number;         // 0-10
    professionalism: number;   // 0-10
    total: number;             // 0-40
    grade: 'A' | 'B' | 'C' | 'D' | 'F';
}
```

---

### TechnicalScore

```typescript
interface TechnicalScore {
    depth: number;             // 0-10
    accuracy: number;          // 0-10
    relevance: number;         // 0-10
    problemSolving: number;    // 0-10
    total: number;             // 0-40
    grade: 'A' | 'B' | 'C' | 'D' | 'F';
}
```

---

### OverallScore

```typescript
interface OverallScore {
    communicationWeight: number;  // 0-1
    technicalWeight: number;      // 0-1
    weightedTotal: number;        // 0-100
    grade: 'A' | 'B' | 'C' | 'D' | 'F';
    percentile?: number;
}
```

---

### Improvement

```typescript
interface Improvement {
    category: string;
    observation: string;
    suggestion: string;
    priority: 'high' | 'medium' | 'low';
}
```

---

### ContinuationPrompt

```typescript
interface ContinuationPrompt {
    message: string;
    options: ContinuationOption[];
}
```

---

### ContinuationOption

```typescript
interface ContinuationOption {
    type: ContinuationType;
    label: string;
    description: string;
    parameters?: any;
}
```

---

### ContinuationOptions

```typescript
interface ContinuationOptions {
    type: ContinuationType;
    role?: string;
    level?: string;
    drillTopic?: string;
}
```

---

## Error Types

### InvalidRoleInputError

Thrown when an invalid role or experience level is provided.

```typescript
class InvalidRoleInputError extends Error {
    availableOptions: {
        roles: JobRole[];
        levels: ExperienceLevel[];
    };
}
```

**Example:**
```typescript
try {
    const sessionId = interviewAI.createSession('invalid-role', 'entry');
} catch (error) {
    if (error instanceof InvalidRoleInputError) {
        console.log('Available roles:', error.availableOptions.roles);
        console.log('Available levels:', error.availableOptions.levels);
    }
}
```

---

### SessionError

Thrown when session operations fail.

```typescript
class SessionError extends Error {
    sessionId?: SessionId;
}
```

---

### InvalidStateTransitionError

Thrown when an invalid state transition is attempted.

```typescript
class InvalidStateTransitionError extends SessionError {
    currentState: string;
    attemptedAction: string;
}
```

---

### ResumeParsingError

Thrown when resume parsing fails (non-fatal).

```typescript
class ResumeParsingError extends Error {
    resumeData: ResumeDocument;
}
```

---

## Enums

### InteractionModeType

```typescript
type InteractionModeType = 'text' | 'voice';
```

---

### BehaviorType

```typescript
type BehaviorType = 'confused' | 'efficient' | 'chatty' | 'edge-case' | 'standard';
```

---

### ContinuationType

```typescript
type ContinuationType = 'another-round' | 'topic-drill' | 'different-role';
```

---

### SessionStatus

```typescript
type SessionStatus = 'initialized' | 'in-progress' | 'completed' | 'ended-early';
```

---

## Factory Function

### createInterviewPrepAI()

Convenience factory function to create an InterviewPrepAI instance.

```typescript
function createInterviewPrepAI(config?: InterviewPrepConfig): InterviewPrepAI
```

**Example:**
```typescript
import { createInterviewPrepAI } from 'interview-prep-ai';

const interviewAI = createInterviewPrepAI({ debug: true });
```
