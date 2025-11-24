# InterviewPrepAI System Architecture

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        External User/Client                      │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                     InterviewPrepAI (Main API)                   │
│  - createSession()                                               │
│  - uploadResume()                                                │
│  - startInterview()                                              │
│  - submitResponse()                                              │
│  - getProgress()                                                 │
│  - endInterviewEarly()                                           │
│  - getContinuationOptions()                                      │
└────────────────────────────┬────────────────────────────────────┘
                             │
                ┌────────────┴────────────┐
                ▼                         ▼
┌───────────────────────────┐  ┌──────────────────────────────┐
│    SessionManager         │  │   InterviewController        │
│  - Session lifecycle      │  │  - Interview flow            │
│  - State management       │  │  - Question progression      │
│  - Resume integration     │  │  - Timing & progress         │
└───────┬───────────────────┘  └────────┬─────────────────────┘
        │                                │
        ├─────────────┐                  ├──────────────┬──────────────┐
        ▼             ▼                  ▼              ▼              ▼
┌──────────┐  ┌──────────────┐  ┌──────────────┐ ┌──────────┐ ┌──────────┐
│RoleManager│  │ResumeAnalyzer│  │QuestionGen   │ │ResponseEval│ │Behavior  │
│          │  │              │  │              │ │            │ │Classifier│
│- Validate│  │- Parse       │  │- Generate    │ │- Evaluate  │ │          │
│  roles   │  │- Analyze     │  │  questions   │ │  responses │ │- Classify│
│- Validate│  │- Align       │  │- Follow-ups  │ │- Score     │ │  behavior│
│  levels  │  │              │  │              │ │            │ │- Adapt   │
└──────────┘  └──────┬───────┘  └──────────────┘ └──────────┬─┘ └────┬─────┘
                     │                                       │        │
                     ▼                                       │        │
              ┌──────────────┐                              │        │
              │ResumeParser  │                              │        │
              │              │                              │        │
              │- Extract     │                              │        │
              │  sections    │                              │        │
              │- Parse skills│                              │        │
              │- Parse exp   │                              │        │
              └──────────────┘                              │        │
                                                            │        │
                                    ┌───────────────────────┴────────┘
                                    ▼
                            ┌──────────────────┐
                            │FeedbackGenerator │
                            │                  │
                            │- Score comm      │
                            │- Score technical │
                            │- Generate report │
                            │- Resume alignment│
                            └──────────────────┘
```

## Component Responsibilities

### 1. InterviewPrepAI (Main API)
**Purpose:** Public interface for external interaction

**Responsibilities:**
- Provide clean, intuitive API
- Handle configuration
- Manage logging
- Coordinate between SessionManager and InterviewController
- Handle errors and provide meaningful error messages

**Key Methods:**
- Session management
- Interview flow control
- Progress tracking
- Behavior adaptation access

### 2. SessionManager
**Purpose:** Manage interview session lifecycle

**Responsibilities:**
- Create and initialize sessions
- Store session state
- Validate role and level inputs
- Integrate resume analysis
- Manage state transitions
- Track active sessions

**Dependencies:**
- RoleManager (for validation)
- ResumeAnalyzer (for resume processing)

### 3. InterviewController
**Purpose:** Orchestrate interview flow

**Responsibilities:**
- Initialize interviews with question generation
- Process candidate responses
- Determine next actions (next question, follow-up, complete)
- Track interview progress
- Handle early termination
- Generate continuation options
- Coordinate behavior adaptation

**Dependencies:**
- SessionManager (for state access)
- QuestionGenerator (for questions)
- ResponseEvaluator (for scoring)
- BehaviorClassifier (for adaptation)
- FeedbackGenerator (for reports)

### 4. RoleManager
**Purpose:** Manage job roles and experience levels

**Responsibilities:**
- Store predefined roles
- Validate role inputs
- Provide available options
- Return role definitions

**Data:**
- 6 predefined job roles
- 4 experience levels
- Technical skills per role
- Behavioral competencies per role

### 5. ResumeAnalyzer & ResumeParser
**Purpose:** Extract and analyze resume information

**Responsibilities:**
- Parse resume documents
- Extract skills, experience, projects
- Analyze alignment with job role
- Identify strengths and gaps
- Calculate alignment scores
- Handle parsing errors gracefully

**Features:**
- Section extraction
- Skill identification
- Experience parsing
- Gap analysis

### 6. QuestionGenerator
**Purpose:** Generate interview questions

**Responsibilities:**
- Generate role-specific questions
- Create resume-aware questions
- Generate follow-up questions
- Maintain question diversity
- Enforce follow-up limits (max 2 per question)

**Question Types:**
- Technical questions (60%)
- Behavioral questions (40%)
- Resume-specific questions
- Follow-up questions

### 7. ResponseEvaluator
**Purpose:** Analyze candidate responses

**Responsibilities:**
- Evaluate response depth
- Assess clarity
- Measure completeness
- Calculate technical accuracy
- Determine if follow-up needed
- Provide evaluation scores (0-10)

**Evaluation Dimensions:**
- Depth (technical content)
- Clarity (structure and coherence)
- Completeness (coverage of expected elements)
- Technical accuracy (for technical questions)

### 8. BehaviorClassifier & CommunicationAdapter
**Purpose:** Adapt communication based on user behavior

**Responsibilities:**
- Classify user behavior patterns
- Detect confusion, efficiency, verbosity
- Adapt response style
- Provide appropriate acknowledgments
- Generate context-aware transitions

**Behavior Types:**
- Confused (needs guidance)
- Efficient (prefers concise)
- Chatty (needs redirection)
- Edge-case (needs alternatives)
- Standard (default)

### 9. FeedbackGenerator
**Purpose:** Generate comprehensive feedback reports

**Responsibilities:**
- Score communication quality
- Score technical fit
- Calculate overall weighted score
- Identify strengths
- Generate improvement suggestions
- Evaluate resume alignment
- Create question-by-question breakdown
- Generate summary

**Scoring Components:**
- Communication (clarity, articulation, structure, professionalism)
- Technical (depth, accuracy, relevance, problem-solving)
- Overall (weighted combination)
- Grades (A-F based on percentages)

## Data Flow

### Session Creation Flow
```
User Request
    ↓
InterviewPrepAI.createSession()
    ↓
SessionManager.createSession()
    ↓
RoleManager.validate()
    ↓
Session State Created
    ↓
Session ID Returned
```

### Resume Upload Flow
```
Resume Document
    ↓
InterviewPrepAI.uploadResume()
    ↓
SessionManager.uploadResume()
    ↓
ResumeAnalyzer.analyzeForRole()
    ↓
ResumeParser.parse()
    ↓
Extract Skills, Experience, Projects
    ↓
Calculate Alignment
    ↓
Identify Strengths & Gaps
    ↓
Resume Analysis Returned
```

### Interview Start Flow
```
Start Request
    ↓
InterviewPrepAI.startInterview()
    ↓
InterviewController.initialize()
    ↓
QuestionGenerator.generateQuestionSet()
    ↓
Questions Stored in Session
    ↓
Session Status → 'in-progress'
    ↓
First Question Returned
```

### Response Processing Flow
```
Candidate Response
    ↓
InterviewPrepAI.submitResponse()
    ↓
InterviewController.processResponse()
    ↓
ResponseEvaluator.evaluate()
    ↓
BehaviorClassifier.classifyBehavior()
    ↓
Decision: Follow-up Needed?
    ├─ Yes → QuestionGenerator.generateFollowUp()
    └─ No → Get Next Question
    ↓
More Questions?
    ├─ Yes → Return Next Question
    └─ No → Generate Feedback
    ↓
InterviewAction Returned
```

### Feedback Generation Flow
```
Interview Complete
    ↓
FeedbackGenerator.generateFeedback()
    ↓
Score Communication
    ↓
Score Technical Fit
    ↓
Calculate Overall Score
    ↓
Identify Strengths
    ↓
Generate Improvements
    ↓
Evaluate Resume Alignment (if resume provided)
    ↓
Generate Question Breakdown
    ↓
Create Summary
    ↓
Feedback Report Returned
```

## State Management

### Session States
```
initialized → in-progress → completed
                    ↓
              ended-early
```

### State Transitions
- **initialized → in-progress**: `startInterview()`
- **in-progress → completed**: All questions answered
- **in-progress → ended-early**: `endInterviewEarly()`

### Invalid Transitions
- Cannot upload resume after starting interview
- Cannot submit response before starting interview
- Cannot start interview twice

## Error Handling Strategy

### Error Types
1. **InvalidRoleInputError** - Invalid role or level
2. **SessionError** - Session not found or general session error
3. **InvalidStateTransitionError** - Invalid state transition attempt
4. **ResumeParsingError** - Resume parsing failure (handled gracefully)

### Error Handling Approach
```
Public API Method
    ↓
Try {
    Business Logic
    ↓
    Return Result
}
Catch (Error) {
    Log Error with Context
    ↓
    Throw Appropriate Error Type
}
```

### Graceful Degradation
- Resume parsing errors don't block interviews
- Missing data results in partial analysis
- System continues with reduced functionality

## Configuration

### Default Configuration
```typescript
{
    debug: false,
    logger: console logging,
    averageQuestionTime: 3 minutes
}
```

### Custom Configuration
```typescript
{
    debug: true,
    logger: customLoggerFunction,
    averageQuestionTime: 5 minutes
}
```

## Testing Architecture

### Test Layers
1. **Unit Tests** - Individual component testing
2. **Integration Tests** - Component interaction testing
3. **Property-Based Tests** - Universal correctness properties

### Test Coverage
- 313 total tests
- 15 test suites
- All components covered
- Edge cases tested
- Error conditions verified

## Performance Considerations

### Memory
- In-memory session storage (MVP)
- Cleanup methods prevent leaks
- Session tracking for monitoring

### Scalability
- Stateless service components
- Clear persistence interfaces
- Caching opportunities identified

### Optimization Opportunities
- Question generation caching
- Resume analysis caching
- Evaluation result caching
- Async feedback generation

## Security Considerations

### Input Validation
- Role and level validation
- Resume format validation
- Response text sanitization

### Data Privacy
- Session data isolation
- Cleanup on completion
- No persistent storage (MVP)

### Future Security Enhancements
- Authentication/authorization
- Rate limiting
- Input sanitization
- Secure session tokens
- Encrypted storage

## Deployment Architecture (Future)

```
┌─────────────────────────────────────────┐
│           Load Balancer                 │
└────────────┬────────────────────────────┘
             │
    ┌────────┴────────┐
    ▼                 ▼
┌─────────┐      ┌─────────┐
│ API     │      │ API     │
│ Server  │      │ Server  │
│ (Node)  │      │ (Node)  │
└────┬────┘      └────┬────┘
     │                │
     └────────┬───────┘
              ▼
     ┌────────────────┐
     │   Redis        │
     │   (Sessions)   │
     └────────────────┘
              │
              ▼
     ┌────────────────┐
     │   PostgreSQL   │
     │   (Persistence)│
     └────────────────┘
```

## Conclusion

The InterviewPrepAI system follows a clean, layered architecture with:
- Clear separation of concerns
- Well-defined component responsibilities
- Proper error handling throughout
- Flexible configuration
- Comprehensive testing
- Scalability considerations
- Security awareness

The architecture supports the current MVP requirements while providing clear paths for future enhancements.
