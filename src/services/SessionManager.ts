import {
    SessionId,
    SessionState,
    SessionStatus,
    JobRole,
    ResumeDocument,
    ResumeAnalysis,
    InterviewQuestion,
    CandidateResponse,
    ResponseEvaluation,
    BehaviorType,
    QuestionId,
    InteractionModeType
} from '../models/types';
import { RoleManager, InvalidRoleInputError } from '../models/RoleManager';
import { ResumeAnalyzer, ResumeParsingError } from './ResumeParser';
import { randomUUID } from 'crypto';

/**
 * Error thrown when session operations fail
 */
export class SessionError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'SessionError';
    }
}

/**
 * Error thrown when attempting invalid state transitions
 */
export class InvalidStateTransitionError extends SessionError {
    constructor(
        public currentState: SessionStatus,
        public attemptedAction: string
    ) {
        super(`Cannot ${attemptedAction} from state ${currentState}`);
        this.name = 'InvalidStateTransitionError';
    }
}

/**
 * SessionManager orchestrates interview lifecycle from initialization through feedback delivery
 */
export class SessionManager {
    private sessions: Map<SessionId, SessionState>;
    private roleManager: RoleManager;
    private resumeAnalyzer: ResumeAnalyzer;

    constructor() {
        this.sessions = new Map();
        this.roleManager = new RoleManager();
        this.resumeAnalyzer = new ResumeAnalyzer();
    }

    /**
     * Create a new interview session with role and experience level
     * @param roleIdOrName - Job role ID or name
     * @param levelName - Experience level (entry, mid, senior, lead)
     * @param interactionMode - Interaction mode (voice or text), defaults to text
     * @returns SessionId for the created session
     * @throws InvalidRoleInputError if role or level is invalid
     */
    createSession(roleIdOrName: string, levelName: string, interactionMode: InteractionModeType = 'text'): SessionId {
        // Validate and get role
        let role: JobRole;
        try {
            // Try as ID first
            if (this.roleManager.isValidRoleId(roleIdOrName)) {
                role = this.roleManager.getRoleById(roleIdOrName);
            } else {
                // Try as name
                role = this.roleManager.getRoleByName(roleIdOrName);
            }
        } catch (error) {
            if (error instanceof InvalidRoleInputError) {
                throw error;
            }
            throw new SessionError(`Failed to validate role: ${error}`);
        }

        // Validate and get experience level
        const experienceLevel = this.roleManager.getExperienceLevel(levelName);

        // Generate unique session ID
        const sessionId: SessionId = randomUUID();

        // Create initial session state
        const sessionState: SessionState = {
            sessionId,
            role,
            experienceLevel,
            questions: [],
            responses: new Map<QuestionId, CandidateResponse>(),
            evaluations: new Map<QuestionId, ResponseEvaluation>(),
            behaviorType: 'standard',
            interactionMode,
            startTime: Date.now(),
            status: 'initialized'
        };

        // Store session
        this.sessions.set(sessionId, sessionState);

        return sessionId;
    }

    /**
     * Upload and analyze a resume for an existing session
     * @param sessionId - ID of the session
     * @param resumeData - Resume document to parse and analyze
     * @returns ResumeAnalysis result
     * @throws SessionError if session not found or in invalid state
     */
    uploadResume(sessionId: SessionId, resumeData: ResumeDocument): ResumeAnalysis {
        const session = this.getSessionOrThrow(sessionId);

        // Can only upload resume in initialized state
        if (session.status !== 'initialized') {
            throw new InvalidStateTransitionError(session.status, 'upload resume');
        }

        try {
            // Analyze resume for the session's role
            const analysis = this.resumeAnalyzer.analyzeForRole(resumeData, session.role);

            // Update session with resume analysis
            session.resumeAnalysis = analysis;

            return analysis;
        } catch (error) {
            if (error instanceof ResumeParsingError) {
                // Log error but don't fail - graceful degradation
                console.error('Resume parsing failed:', error.message);

                // Create minimal analysis
                const minimalAnalysis: ResumeAnalysis = {
                    parsedResume: {
                        rawText: resumeData.content,
                        sections: new Map(),
                        metadata: {
                            parsedAt: Date.now(),
                            format: resumeData.format
                        }
                    },
                    strengths: [],
                    technicalSkills: [],
                    gaps: [],
                    alignmentScore: {
                        overall: 0,
                        technical: 0,
                        experience: 0,
                        cultural: 0
                    },
                    summary: 'Resume parsing failed. Proceeding with generic role-based questions.'
                };

                session.resumeAnalysis = minimalAnalysis;
                return minimalAnalysis;
            }
            throw new SessionError(`Failed to process resume: ${error}`);
        }
    }

    /**
     * Start the interview and transition to in-progress state
     * This method prepares the session for question generation
     * @param sessionId - ID of the session
     * @throws SessionError if session not found or in invalid state
     */
    startInterview(sessionId: SessionId): void {
        const session = this.getSessionOrThrow(sessionId);

        // Can only start from initialized state
        if (session.status !== 'initialized') {
            throw new InvalidStateTransitionError(session.status, 'start interview');
        }

        // Transition to in-progress
        session.status = 'in-progress';
        session.startTime = Date.now();
    }

    /**
     * End the interview session
     * @param sessionId - ID of the session
     * @param early - Whether this is an early termination
     * @throws SessionError if session not found
     */
    endInterview(sessionId: SessionId, early: boolean = false): void {
        const session = this.getSessionOrThrow(sessionId);

        // Can only end from in-progress state
        if (session.status !== 'in-progress') {
            throw new InvalidStateTransitionError(session.status, 'end interview');
        }

        // Update session state
        session.endTime = Date.now();
        session.status = early ? 'ended-early' : 'completed';
    }

    /**
     * Get the current state of a session
     * @param sessionId - ID of the session
     * @returns SessionState
     * @throws SessionError if session not found
     */
    getSessionState(sessionId: SessionId): SessionState {
        return this.getSessionOrThrow(sessionId);
    }

    /**
     * Update session questions (used by question generator)
     * @param sessionId - ID of the session
     * @param questions - Array of interview questions
     * @throws SessionError if session not found
     */
    updateQuestions(sessionId: SessionId, questions: InterviewQuestion[]): void {
        const session = this.getSessionOrThrow(sessionId);
        session.questions = questions;
    }

    /**
     * Add a response to the session
     * @param sessionId - ID of the session
     * @param response - Candidate's response
     * @throws SessionError if session not found or not in progress
     */
    addResponse(sessionId: SessionId, response: CandidateResponse): void {
        const session = this.getSessionOrThrow(sessionId);

        if (session.status !== 'in-progress') {
            throw new InvalidStateTransitionError(session.status, 'add response');
        }

        session.responses.set(response.questionId, response);
    }

    /**
     * Add an evaluation to the session
     * @param sessionId - ID of the session
     * @param evaluation - Response evaluation
     * @throws SessionError if session not found or not in progress
     */
    addEvaluation(sessionId: SessionId, evaluation: ResponseEvaluation): void {
        const session = this.getSessionOrThrow(sessionId);

        if (session.status !== 'in-progress') {
            throw new InvalidStateTransitionError(session.status, 'add evaluation');
        }

        session.evaluations.set(evaluation.questionId, evaluation);
    }

    /**
     * Update the behavior type classification for a session
     * @param sessionId - ID of the session
     * @param behaviorType - Classified behavior type
     * @throws SessionError if session not found
     */
    updateBehaviorType(sessionId: SessionId, behaviorType: BehaviorType): void {
        const session = this.getSessionOrThrow(sessionId);
        session.behaviorType = behaviorType;
    }

    /**
     * Update the interaction mode for a session
     * @param sessionId - ID of the session
     * @param interactionMode - Interaction mode (voice or text)
     * @throws SessionError if session not found
     */
    updateInteractionMode(sessionId: SessionId, interactionMode: InteractionModeType): void {
        const session = this.getSessionOrThrow(sessionId);
        session.interactionMode = interactionMode;
    }

    /**
     * Check if a session exists
     * @param sessionId - ID of the session
     * @returns true if session exists
     */
    sessionExists(sessionId: SessionId): boolean {
        return this.sessions.has(sessionId);
    }

    /**
     * Delete a session (cleanup)
     * @param sessionId - ID of the session
     */
    deleteSession(sessionId: SessionId): void {
        this.sessions.delete(sessionId);
    }

    /**
     * Get all active sessions (for debugging/admin purposes)
     * @returns Array of session IDs
     */
    getActiveSessions(): SessionId[] {
        return Array.from(this.sessions.keys());
    }

    /**
     * Get role manager instance (for external use)
     */
    getRoleManager(): RoleManager {
        return this.roleManager;
    }

    /**
     * Helper method to get session or throw error
     * @private
     */
    private getSessionOrThrow(sessionId: SessionId): SessionState {
        const session = this.sessions.get(sessionId);
        if (!session) {
            throw new SessionError(`Session not found: ${sessionId}`);
        }
        return session;
    }
}
