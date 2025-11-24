import * as fc from 'fast-check';
import { JobRole, ExperienceLevel, ResumeDocument, ParsedResume, Skill, WorkExperience, Project, Achievement, Strength, Gap, AlignmentScore, ResumeAnalysis, InterviewQuestion, CandidateResponse, ResponseEvaluation, SessionState, BehaviorType, SessionStatus, InteractionModeType, QuestionId, SessionId, QuestionCategory, ResumeReference } from '../models/types';
/**
 * Test data generators for property-based testing using fast-check
 * These generators produce valid, realistic test data for all core types
 */
export declare const arbSessionId: () => fc.Arbitrary<SessionId>;
export declare const arbQuestionId: () => fc.Arbitrary<QuestionId>;
export declare const arbTimestamp: () => fc.Arbitrary<number>;
export declare const arbBehaviorType: () => fc.Arbitrary<BehaviorType>;
export declare const arbSessionStatus: () => fc.Arbitrary<SessionStatus>;
export declare const arbInteractionMode: () => fc.Arbitrary<InteractionModeType>;
export declare const arbQuestionCategory: () => fc.Arbitrary<QuestionCategory>;
export declare const arbJobRole: () => fc.Arbitrary<JobRole>;
export declare const arbExperienceLevel: () => fc.Arbitrary<ExperienceLevel>;
export declare const arbSkill: () => fc.Arbitrary<Skill>;
export declare const arbWorkExperience: () => fc.Arbitrary<WorkExperience>;
export declare const arbProject: () => fc.Arbitrary<Project>;
export declare const arbAchievement: () => fc.Arbitrary<Achievement>;
export declare const arbStrength: () => fc.Arbitrary<Strength>;
export declare const arbGap: () => fc.Arbitrary<Gap>;
export declare const arbAlignmentScore: () => fc.Arbitrary<AlignmentScore>;
export declare const arbParsedResume: () => fc.Arbitrary<ParsedResume>;
export declare const arbResumeDocument: () => fc.Arbitrary<ResumeDocument>;
export declare const arbResumeAnalysis: () => fc.Arbitrary<ResumeAnalysis>;
export declare const arbResumeReference: () => fc.Arbitrary<ResumeReference>;
export declare const arbInterviewQuestion: () => fc.Arbitrary<InterviewQuestion>;
/**
 * Generate a question set with controlled characteristics
 * @param minCount Minimum number of questions (default 5)
 * @param maxCount Maximum number of questions (default 10)
 * @param ensureMix Ensure mix of technical and behavioral (default true)
 */
export declare const arbQuestionSet: (minCount?: number, maxCount?: number, ensureMix?: boolean) => fc.Arbitrary<InterviewQuestion[]>;
/**
 * Generate candidate response with controllable characteristics
 * @param minWords Minimum word count (default 10)
 * @param maxWords Maximum word count (default 200)
 */
export declare const arbCandidateResponse: (minWords?: number, maxWords?: number) => fc.Arbitrary<CandidateResponse>;
/**
 * Generate a short/low-quality response (for testing follow-up logic)
 */
export declare const arbShortResponse: () => fc.Arbitrary<CandidateResponse>;
/**
 * Generate a detailed/high-quality response
 */
export declare const arbDetailedResponse: () => fc.Arbitrary<CandidateResponse>;
/**
 * Generate response with technical mentions
 */
export declare const arbTechnicalResponse: () => fc.Arbitrary<CandidateResponse>;
export declare const arbResponseEvaluation: () => fc.Arbitrary<ResponseEvaluation>;
/**
 * Generate evaluation that needs follow-up (low scores)
 */
export declare const arbLowQualityEvaluation: () => fc.Arbitrary<ResponseEvaluation>;
/**
 * Generate evaluation that doesn't need follow-up (high scores)
 */
export declare const arbHighQualityEvaluation: () => fc.Arbitrary<ResponseEvaluation>;
/**
 * Generate session state at various completion stages
 * @param status Optional specific status to generate
 */
export declare const arbSessionState: (status?: SessionStatus) => fc.Arbitrary<SessionState>;
/**
 * Generate initialized session (no questions answered yet)
 */
export declare const arbInitializedSession: () => fc.Arbitrary<SessionState>;
/**
 * Generate in-progress session with some answered questions
 */
export declare const arbInProgressSession: () => fc.Arbitrary<SessionState>;
/**
 * Generate completed session with all questions answered
 */
export declare const arbCompletedSession: () => fc.Arbitrary<SessionState>;
/**
 * Generate early-terminated session
 */
export declare const arbEarlyTerminatedSession: () => fc.Arbitrary<SessionState>;
//# sourceMappingURL=testGenerators.d.ts.map