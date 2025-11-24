# Design Document

## Overview

InterviewPrepAI is a conversational AI system that conducts adaptive mock interviews with resume-aware question generation, intelligent follow-up capabilities, and comprehensive performance evaluation. The system architecture separates concerns into distinct layers: resume parsing and analysis, interview orchestration, question generation, response evaluation, and feedback synthesis. The design emphasizes modularity to support multiple interaction modes (voice and text), adaptive behavior based on user patterns, and extensibility for adding new job roles and evaluation criteria.

## Architecture

The system follows a layered architecture with clear separation between:

1. **Presentation Layer**: Handles user interaction through voice and text interfaces
2. **Interview Orchestration Layer**: Manages interview session state, flow control, and timing
3. **Intelligence Layer**: Contains resume analysis, question generation, response evaluation, and behavior adaptation logic
4. **Data Layer**: Stores interview templates, scoring rubrics, job role definitions, and session history

### Key Architectural Decisions

- **Stateful Session Management**: Each interview session maintains state including selected role, experience level, parsed resume data, question history, responses, and behavior classification
- **Plugin-based Question Generation**: Question generators are role-specific plugins that can be extended without modifying core logic
- **Scoring Pipeline**: Evaluation uses a pipeline pattern where multiple scorers contribute to the final rubric
- **Behavior Classifier**: Real-time classification of user behavior patterns to adapt communication style

## Components and Interfaces

### 1. Session Manager

**Responsibility**: Orchestrates interview lifecycle from initialization through feedback delivery

**Interface**:
```typescript
interface SessionManager {
  createSession(role: JobRole, level: ExperienceLevel): SessionId
  uploadResume(sessionId: SessionId, resumeData: ResumeDocument): ResumeAnalysis
  startInterview(sessionId: SessionId): InterviewQuestion
  submitResponse(sessionId: SessionId, response: CandidateResponse): InterviewAction
  endInterview(sessionId: SessionId): FeedbackReport
  getSessionState(sessionId: SessionId): SessionState
}
```

### 2. Resume Parser

**Responsibility**: Extracts structured information from resume documents

**Interface**:
```typescript
interface ResumeParser {
  parse(document: ResumeDocument): ParsedResume
  extractSkills(parsedResume: ParsedResume): Skill[]
  extractExperience(parsedResume: ParsedResume): WorkExperience[]
  extractProjects(parsedResume: ParsedResume): Project[]
  extractAchievements(parsedResume: ParsedResume): Achievement[]
}

interface ResumeAnalyzer {
  analyzeForRole(parsedResume: ParsedResume, role: JobRole): ResumeAnalysis
  identifyStrengths(parsedResume: ParsedResume, role: JobRole): Strength[]
  identifyGaps(parsedResume: ParsedResume, role: JobRole): Gap[]
  calculateAlignment(parsedResume: ParsedResume, role: JobRole): AlignmentScore
}
```

### 3. Question Generator

**Responsibility**: Generates role-specific technical and behavioral questions

**Interface**:
```typescript
interface QuestionGenerator {
  generateQuestionSet(
    role: JobRole, 
    level: ExperienceLevel, 
    resumeAnalysis?: ResumeAnalysis
  ): InterviewQuestion[]
  
  generateFollowUp(
    question: InterviewQuestion, 
    response: CandidateResponse, 
    evaluation: ResponseEvaluation
  ): InterviewQuestion | null
}

interface InterviewQuestion {
  id: QuestionId
  type: 'technical' | 'behavioral'
  text: string
  category: string
  difficulty: number
  resumeContext?: ResumeReference
  expectedElements?: string[]
}
```

### 4. Response Evaluator

**Responsibility**: Analyzes candidate responses for depth, clarity, and completeness

**Interface**:
```typescript
interface ResponseEvaluator {
  evaluate(
    question: InterviewQuestion, 
    response: CandidateResponse
  ): ResponseEvaluation
  
  assessDepth(response: CandidateResponse): DepthScore
  assessClarity(response: CandidateResponse): ClarityScore
  assessCompleteness(
    response: CandidateResponse, 
    expectedElements: string[]
  ): CompletenessScore
  
  needsFollowUp(evaluation: ResponseEvaluation): boolean
}
```

### 5. Behavior Classifier

**Responsibility**: Classifies user behavior patterns and adapts communication style

**Interface**:
```typescript
interface BehaviorClassifier {
  classifyBehavior(
    responses: CandidateResponse[], 
    interactions: UserInteraction[]
  ): BehaviorType
  
  detectConfusion(response: CandidateResponse): boolean
  detectEfficiency(response: CandidateResponse): boolean
  detectVerbosity(response: CandidateResponse): boolean
  detectOffTopic(response: CandidateResponse, question: InterviewQuestion): boolean
}

type BehaviorType = 'confused' | 'efficient' | 'chatty' | 'edge-case' | 'standard'

interface CommunicationAdapter {
  adaptResponse(
    content: string, 
    behaviorType: BehaviorType
  ): AdaptedResponse
}
```

### 6. Feedback Generator

**Responsibility**: Produces comprehensive feedback reports with scoring rubrics

**Interface**:
```typescript
interface FeedbackGenerator {
  generateFeedback(session: SessionState): FeedbackReport
  
  scoreCommunication(responses: CandidateResponse[]): CommunicationScore
  scoreTechnicalFit(
    responses: CandidateResponse[], 
    role: JobRole, 
    level: ExperienceLevel
  ): TechnicalScore
  
  calculateOverallScore(
    communication: CommunicationScore, 
    technical: TechnicalScore
  ): OverallScore
  
  generateImprovements(
    session: SessionState, 
    scores: ScoringRubric
  ): Improvement[]
  
  evaluateResumeAlignment(
    resumeAnalysis: ResumeAnalysis, 
    interviewPerformance: ResponseEvaluation[]
  ): AlignmentFeedback
}
```

### 7. Interview Controller

**Responsibility**: Manages interview flow, timing, and state transitions

**Interface**:
```typescript
interface InterviewController {
  initialize(sessionId: SessionId): void
  nextQuestion(): InterviewQuestion | null
  processResponse(response: CandidateResponse): InterviewAction
  shouldContinue(): boolean
  canEndEarly(): boolean
  getProgress(): InterviewProgress
}

type InterviewAction = 
  | { type: 'next-question', question: InterviewQuestion }
  | { type: 'follow-up', question: InterviewQuestion }
  | { type: 'complete', feedback: FeedbackReport }
  | { type: 'redirect', message: string }
```

## Data Models

### Core Entities

```typescript
interface SessionState {
  sessionId: SessionId
  role: JobRole
  experienceLevel: ExperienceLevel
  resumeAnalysis?: ResumeAnalysis
  questions: InterviewQuestion[]
  responses: Map<QuestionId, CandidateResponse>
  evaluations: Map<QuestionId, ResponseEvaluation>
  behaviorType: BehaviorType
  startTime: Timestamp
  endTime?: Timestamp
  status: 'initialized' | 'in-progress' | 'completed' | 'ended-early'
}

interface ResumeAnalysis {
  parsedResume: ParsedResume
  strengths: Strength[]
  technicalSkills: Skill[]
  gaps: Gap[]
  alignmentScore: AlignmentScore
  summary: string
}

interface CandidateResponse {
  questionId: QuestionId
  text: string
  timestamp: Timestamp
  wordCount: number
  responseTime: number
}

interface ResponseEvaluation {
  questionId: QuestionId
  depthScore: number // 0-10
  clarityScore: number // 0-10
  completenessScore: number // 0-10
  needsFollowUp: boolean
  followUpReason?: string
  technicalAccuracy?: number // 0-10
}

interface ScoringRubric {
  communication: CommunicationScore
  technicalFit: TechnicalScore
  overall: OverallScore
}

interface CommunicationScore {
  clarity: number // 0-10
  articulation: number // 0-10
  structure: number // 0-10
  professionalism: number // 0-10
  total: number // 0-40
  grade: 'A' | 'B' | 'C' | 'D' | 'F'
}

interface TechnicalScore {
  depth: number // 0-10
  accuracy: number // 0-10
  relevance: number // 0-10
  problemSolving: number // 0-10
  total: number // 0-40
  grade: 'A' | 'B' | 'C' | 'D' | 'F'
}

interface OverallScore {
  communicationWeight: number // 0-1
  technicalWeight: number // 0-1
  weightedTotal: number // 0-100
  grade: 'A' | 'B' | 'C' | 'D' | 'F'
  percentile?: number
}

interface FeedbackReport {
  sessionId: SessionId
  scores: ScoringRubric
  strengths: string[]
  improvements: Improvement[]
  resumeAlignment?: AlignmentFeedback
  questionBreakdown: QuestionFeedback[]
  summary: string
}

interface Improvement {
  category: string
  observation: string
  suggestion: string
  priority: 'high' | 'medium' | 'low'
}

interface AlignmentFeedback {
  alignmentScore: number // 0-100
  matchedSkills: Skill[]
  missingSkills: Skill[]
  experienceGaps: string[]
  suggestions: string[]
}
```

### Job Role Definitions

```typescript
interface JobRole {
  id: string
  name: string
  technicalSkills: string[]
  behavioralCompetencies: string[]
  questionCategories: QuestionCategory[]
}

interface QuestionCategory {
  name: string
  weight: number
  technicalFocus: boolean
}

interface ExperienceLevel {
  level: 'entry' | 'mid' | 'senior' | 'lead'
  yearsMin: number
  yearsMax: number
  expectedDepth: number
}
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Invalid input error handling

*For any* invalid job role or experience level input, the system should return an error response that displays available valid options and requests a valid selection.

**Validates: Requirements 1.4**

### Property 2: Resume analysis completeness

*For any* successfully parsed resume, the analysis output should contain non-empty strengths, technical skills, and gaps fields, along with a summary and alignment score.

**Validates: Requirements 2.2**

### Property 3: Resume parsing error recovery

*For any* malformed or unparseable resume document, the system should notify the candidate of the parsing failure and proceed with generic role-based questions without blocking the interview.

**Validates: Requirements 2.3**

### Property 4: Question set validity

*For any* job role and experience level combination, the generated question set should contain between 5 and 10 questions, include both technical and behavioral question types, and when a resume is provided, at least one question should reference resume-specific content.

**Validates: Requirements 3.1, 3.2, 3.3**

### Property 5: Response evaluation completeness

*For any* candidate response to an interview question, the evaluation should produce numeric scores for depth, clarity, and completeness, each within the range 0-10.

**Validates: Requirements 4.1**

### Property 6: Follow-up generation logic

*For any* response with depth or completeness scores below a threshold (e.g., 6), the system should generate a follow-up question; for responses with scores above the threshold, the system should proceed to the next primary question without generating a follow-up.

**Validates: Requirements 4.2, 4.4**

### Property 7: Technical follow-up generation

*For any* response that mentions specific technologies or methodologies (detected through keyword matching), the system should generate a follow-up question that probes deeper understanding of those specific technical topics.

**Validates: Requirements 4.3**

### Property 8: Follow-up count limit invariant

*For any* primary interview question, the total number of follow-up questions generated should never exceed 2, regardless of response quality.

**Validates: Requirements 4.5**

### Property 9: Behavior-based communication adaptation

*For any* candidate response classified with a specific behavior type (confused, efficient, chatty, edge-case), the adapted system response should match the expected communication style for that behavior type: guidance for confused, concise for efficient, redirect for chatty, and alternatives for edge-case.

**Validates: Requirements 5.1, 5.2, 5.3, 5.4**

### Property 10: Feedback report completeness

*For any* completed interview session, the generated feedback report should contain: a scoring rubric with communication and technical scores, an overall weighted score, a list of strengths, a list of improvements with actionable suggestions, and coverage of all questions and responses from the session.

**Validates: Requirements 6.1, 6.5, 6.6**

### Property 11: Scoring rubric validity

*For any* interview session, the scoring rubric should contain communication scores (clarity, articulation, structure, professionalism) and technical scores (depth, accuracy, relevance, problem-solving), each component in range 0-10, with correctly calculated totals and an overall weighted score in range 0-100.

**Validates: Requirements 6.2, 6.3, 6.4**

### Property 12: Early termination feedback generation

*For any* interview session ended early by the candidate, the system should generate a feedback report based on all responses provided up to the termination point, with scores calculated proportionally to the completed questions.

**Validates: Requirements 7.2**

### Property 13: Session continuation

*For any* valid continuation parameters (role, level, drill topic) selected after feedback delivery, the system should successfully create and initialize a new interview session with those parameters.

**Validates: Requirements 7.5**

### Property 14: Resume-role alignment analysis

*For any* resume and target job role, the alignment analysis should produce an alignment score (0-100), identify matched skills present in both resume and role requirements, and identify missing skills expected for the role but absent from the resume.

**Validates: Requirements 8.1, 8.3**

### Property 15: Resume alignment feedback inclusion

*For any* interview session where a resume was provided, the final feedback report should include a resume alignment evaluation section containing the alignment score, matched skills, missing skills, experience gaps, and specific suggestions for resume improvement.

**Validates: Requirements 8.2, 8.4**

### Property 16: Feedback format consistency

*For any* interaction mode (voice or text), the final feedback report should be provided as a detailed written summary with all scoring and improvement sections present.

**Validates: Requirements 9.3**

### Property 17: Session completion on question exhaustion

*For any* interview session where all planned questions have been answered, the system should automatically conclude the interview and transition to feedback generation without requiring explicit termination.

**Validates: Requirements 10.3**

## Error Handling

### Resume Parsing Errors

- **Malformed Documents**: When resume parsing fails due to format issues, the system logs the error, notifies the candidate with a user-friendly message, and continues with generic questions
- **Missing Required Fields**: If critical resume sections cannot be extracted, the system proceeds with partial analysis and flags gaps in the resume analysis report
- **Unsupported Formats**: The system validates file format before parsing and rejects unsupported formats with clear guidance on accepted formats

### Session State Errors

- **Invalid State Transitions**: The session manager validates all state transitions and prevents invalid operations (e.g., submitting response before receiving question)
- **Timeout Handling**: Long-running operations (parsing, question generation) have timeouts with graceful degradation
- **Concurrent Access**: Session state is protected against concurrent modifications through appropriate locking mechanisms

### Question Generation Errors

- **Insufficient Question Pool**: If the question generator cannot produce the minimum required questions, it falls back to a curated default question set for the role
- **Resume Context Unavailable**: When resume-specific questions cannot be generated, the system uses role-based questions exclusively

### Evaluation Errors

- **Empty Responses**: Empty or whitespace-only responses receive minimum scores and trigger clarification prompts
- **Evaluation Service Failures**: If response evaluation fails, the system uses fallback heuristics (word count, keyword matching) for basic scoring

### Feedback Generation Errors

- **Incomplete Session Data**: Feedback generator handles sessions with missing data by generating partial feedback with appropriate disclaimers
- **Scoring Calculation Errors**: Invalid score values are clamped to valid ranges, and calculation errors are logged with fallback to default scoring

## Testing Strategy

### Unit Testing Approach

The system will use unit tests to verify:

- **Component Interfaces**: Each component's public interface behaves correctly with valid inputs
- **Edge Cases**: Boundary conditions like empty resumes, single-question interviews, maximum follow-up limits
- **Error Conditions**: Proper error handling for malformed inputs, parsing failures, and invalid state transitions
- **Data Transformations**: Correct transformation of raw data into structured models (resume parsing, score calculations)
- **Integration Points**: Proper interaction between components (session manager → question generator, evaluator → feedback generator)

Example unit test cases:
- Resume parser correctly extracts skills from a sample resume
- Question generator produces exactly 5-10 questions for a given role
- Behavior classifier correctly identifies confused user from help-seeking responses
- Scoring rubric calculation produces correct weighted overall score
- Session state transitions follow valid state machine rules

### Property-Based Testing Approach

The system will use property-based testing to verify universal correctness properties across all inputs. We will use **fast-check** (for TypeScript/JavaScript implementation) as the property-based testing library.

**Configuration**:
- Each property-based test will run a minimum of **100 iterations** to ensure thorough random input coverage
- Each property-based test will be tagged with a comment explicitly referencing the correctness property from this design document
- Tag format: `// Feature: interview-prep-ai, Property {number}: {property_text}`
- Each correctness property will be implemented by a SINGLE property-based test

**Property Test Coverage**:

Property-based tests will verify:

1. **Resume Analysis Properties**: For randomly generated resume documents, analysis always produces complete output with all required fields
2. **Question Generation Properties**: For random role/level/resume combinations, question sets always meet count, type, and relevance requirements
3. **Evaluation Properties**: For random response texts, evaluation always produces scores in valid ranges
4. **Follow-up Logic Properties**: For random response quality levels, follow-up generation follows the defined rules
5. **Behavior Adaptation Properties**: For random behavior classifications, adapted responses match expected styles
6. **Scoring Properties**: For random session data, scoring rubrics always calculate correctly with valid ranges
7. **Feedback Completeness Properties**: For random completed sessions, feedback reports always contain all required sections
8. **Alignment Properties**: For random resume/role pairs, alignment analysis produces valid scores and gap identification

**Example Property-Based Test Structure**:

```typescript
// Feature: interview-prep-ai, Property 11: Scoring rubric validity
test('scoring rubric has valid ranges and correct calculations', () => {
  fc.assert(
    fc.property(
      fc.array(generateCandidateResponse(), { minLength: 5, maxLength: 10 }),
      fc.record({ role: generateJobRole(), level: generateExperienceLevel() }),
      (responses, context) => {
        const feedback = feedbackGenerator.generateFeedback({
          responses,
          ...context
        });
        
        // All component scores in range 0-10
        expect(feedback.scores.communication.clarity).toBeGreaterThanOrEqual(0);
        expect(feedback.scores.communication.clarity).toBeLessThanOrEqual(10);
        // ... similar for all components
        
        // Totals calculated correctly
        const commTotal = 
          feedback.scores.communication.clarity +
          feedback.scores.communication.articulation +
          feedback.scores.communication.structure +
          feedback.scores.communication.professionalism;
        expect(feedback.scores.communication.total).toBe(commTotal);
        
        // Overall score in range 0-100
        expect(feedback.scores.overall.weightedTotal).toBeGreaterThanOrEqual(0);
        expect(feedback.scores.overall.weightedTotal).toBeLessThanOrEqual(100);
      }
    ),
    { numRuns: 100 }
  );
});
```

### Integration Testing

Integration tests will verify:
- End-to-end interview flow from session creation through feedback delivery
- Resume upload, parsing, and integration into question generation
- Multi-turn conversations with follow-up question chains
- Behavior adaptation across multiple responses
- Session state persistence and recovery

### Test Data Generation

For property-based testing, we will implement smart generators:
- **Resume Generator**: Creates realistic resume documents with varying structures, skills, and experience levels
- **Response Generator**: Produces candidate responses with controlled characteristics (length, technical content, clarity)
- **Role/Level Generator**: Generates valid job role and experience level combinations
- **Session State Generator**: Creates valid session states at different stages of completion

These generators will constrain the input space intelligently to focus on realistic scenarios while still exploring edge cases.

## Implementation Notes

### Technology Recommendations

- **Language**: TypeScript for type safety and better tooling
- **Testing Framework**: Jest for unit tests, fast-check for property-based tests
- **Resume Parsing**: Consider libraries like pdf-parse for PDF resumes, or integrate with document parsing APIs
- **NLP/AI**: Integration with LLM APIs (OpenAI, Anthropic) for question generation, response evaluation, and feedback synthesis
- **State Management**: In-memory state for MVP, with clear interfaces for future persistence layer
- **Voice Integration**: Web Speech API for browser-based voice, or cloud speech services for production

### Scalability Considerations

- Question generation and response evaluation are stateless and can be cached
- Session state can be persisted to database for multi-session support
- Feedback generation can be asynchronous for long sessions
- Resume parsing can be offloaded to background workers

### Future Enhancements

- Multi-language support for international candidates
- Video interview mode with facial expression analysis
- Collaborative interview mode with multiple interviewers
- Historical performance tracking across multiple sessions
- Custom question bank creation for specific companies
- Interview recording and playback for self-review
