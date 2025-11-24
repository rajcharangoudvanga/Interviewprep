// Core type aliases
export type SessionId = string;
export type QuestionId = string;
export type Timestamp = number;

// Job role and experience level types
export interface JobRole {
    id: string;
    name: string;
    technicalSkills: string[];
    behavioralCompetencies: string[];
    questionCategories: QuestionCategory[];
}

export interface QuestionCategory {
    name: string;
    weight: number;
    technicalFocus: boolean;
}

export interface ExperienceLevel {
    level: 'entry' | 'mid' | 'senior' | 'lead';
    yearsMin: number;
    yearsMax: number;
    expectedDepth: number;
}

// Resume related types
export interface ResumeDocument {
    content: string;
    format: 'text' | 'pdf' | 'docx';
    filename: string;
}

export interface ParsedResume {
    rawText: string;
    sections: Map<string, string>;
    metadata: {
        parsedAt: Timestamp;
        format: string;
    };
}

export interface Skill {
    name: string;
    category: string;
    proficiency?: string;
}

export interface WorkExperience {
    company: string;
    title: string;
    duration: string;
    description: string;
    technologies?: string[];
}

export interface Project {
    name: string;
    description: string;
    technologies: string[];
    role?: string;
}

export interface Achievement {
    description: string;
    impact?: string;
    context?: string;
}

export interface Strength {
    area: string;
    evidence: string[];
    relevance: number;
}

export interface Gap {
    skill: string;
    importance: number;
    suggestion: string;
}

export interface AlignmentScore {
    overall: number;
    technical: number;
    experience: number;
    cultural: number;
}

export interface ResumeAnalysis {
    parsedResume: ParsedResume;
    strengths: Strength[];
    technicalSkills: Skill[];
    gaps: Gap[];
    alignmentScore: AlignmentScore;
    summary: string;
}

// Interview question types
export interface ResumeReference {
    section: string;
    content: string;
    relevance: string;
}

export interface InterviewQuestion {
    id: QuestionId;
    type: 'technical' | 'behavioral';
    text: string;
    category: string;
    difficulty: number;
    resumeContext?: ResumeReference;
    expectedElements?: string[];
    parentQuestionId?: QuestionId; // For follow-up questions
    followUpCount?: number; // Track number of follow-ups for this question
}

// Candidate response types
export interface CandidateResponse {
    questionId: QuestionId;
    text: string;
    timestamp: Timestamp;
    wordCount: number;
    responseTime: number;
}

// Response evaluation types
export interface ResponseEvaluation {
    questionId: QuestionId;
    depthScore: number; // 0-10
    clarityScore: number; // 0-10
    completenessScore: number; // 0-10
    needsFollowUp: boolean;
    followUpReason?: string;
    technicalAccuracy?: number; // 0-10
}

export type DepthScore = number;
export type ClarityScore = number;
export type CompletenessScore = number;

// Behavior classification types
export type BehaviorType = 'confused' | 'efficient' | 'chatty' | 'edge-case' | 'standard';

export interface UserInteraction {
    timestamp: Timestamp;
    type: string;
    content: string;
}

export interface AdaptedResponse {
    content: string;
    style: BehaviorType;
    adjustments: string[];
}

// Scoring and feedback types
export interface CommunicationScore {
    clarity: number; // 0-10
    articulation: number; // 0-10
    structure: number; // 0-10
    professionalism: number; // 0-10
    total: number; // 0-40
    grade: 'A' | 'B' | 'C' | 'D' | 'F';
}

export interface TechnicalScore {
    depth: number; // 0-10
    accuracy: number; // 0-10
    relevance: number; // 0-10
    problemSolving: number; // 0-10
    total: number; // 0-40
    grade: 'A' | 'B' | 'C' | 'D' | 'F';
}

export interface OverallScore {
    communicationWeight: number; // 0-1
    technicalWeight: number; // 0-1
    weightedTotal: number; // 0-100
    grade: 'A' | 'B' | 'C' | 'D' | 'F';
    percentile?: number;
}

export interface ScoringRubric {
    communication: CommunicationScore;
    technicalFit: TechnicalScore;
    overall: OverallScore;
}

export interface Improvement {
    category: string;
    observation: string;
    suggestion: string;
    priority: 'high' | 'medium' | 'low';
}

export interface AlignmentFeedback {
    alignmentScore: number; // 0-100
    matchedSkills: Skill[];
    missingSkills: Skill[];
    experienceGaps: string[];
    suggestions: string[];
}

export interface QuestionFeedback {
    questionId: QuestionId;
    question: string;
    response: string;
    evaluation: ResponseEvaluation;
    feedback: string;
}

export interface FeedbackReport {
    sessionId: SessionId;
    scores: ScoringRubric;
    strengths: string[];
    improvements: Improvement[];
    resumeAlignment?: AlignmentFeedback;
    questionBreakdown: QuestionFeedback[];
    summary: string;
}

// Session state types
export type SessionStatus = 'initialized' | 'in-progress' | 'completed' | 'ended-early';
export type InteractionModeType = 'voice' | 'text';

export interface SessionState {
    sessionId: SessionId;
    role: JobRole;
    experienceLevel: ExperienceLevel;
    resumeAnalysis?: ResumeAnalysis;
    questions: InterviewQuestion[];
    responses: Map<QuestionId, CandidateResponse>;
    evaluations: Map<QuestionId, ResponseEvaluation>;
    behaviorType: BehaviorType;
    interactionMode: InteractionModeType;
    startTime: Timestamp;
    endTime?: Timestamp;
    status: SessionStatus;
}

// Interview action types
export type InterviewAction =
    | { type: 'next-question'; question: InterviewQuestion }
    | { type: 'follow-up'; question: InterviewQuestion }
    | { type: 'complete'; feedback: FeedbackReport }
    | { type: 'redirect'; message: string };

export interface InterviewProgress {
    totalQuestions: number;
    answeredQuestions: number;
    currentQuestionIndex: number;
    percentComplete: number;
    estimatedTimeRemaining?: number;
}

// Session continuation types
export interface ContinuationOptions {
    type: 'new-round' | 'topic-drill';
    role?: JobRole;
    experienceLevel?: ExperienceLevel;
    drillTopic?: string;
    drillCategory?: string;
}

export interface ContinuationPrompt {
    message: string;
    options: ContinuationOption[];
}

export interface ContinuationOption {
    id: string;
    label: string;
    description: string;
    continuationOptions: ContinuationOptions;
}
