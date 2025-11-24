import {
    SessionId,
    InterviewQuestion,
    CandidateResponse,
    FeedbackReport,
    InterviewAction
} from '../models/types';

/**
 * Interaction mode type - voice or text
 */
export type InteractionModeType = 'voice' | 'text';

/**
 * Base interface for all interaction modes
 * Defines the contract for how users interact with the interview system
 */
export interface InteractionMode {
    /**
     * Get the mode type
     */
    getModeType(): InteractionModeType;

    /**
     * Format a question for presentation to the user
     * @param question - The interview question to format
     * @returns Formatted question string
     */
    formatQuestion(question: InterviewQuestion): string;

    /**
     * Format a conversational response during the interview
     * Short, natural responses to maintain flow
     * @param content - The content to format
     * @returns Formatted response string
     */
    formatConversationalResponse(content: string): string;

    /**
     * Format the feedback report for final delivery
     * Detailed written summary regardless of mode
     * @param feedback - The feedback report to format
     * @returns Formatted feedback string
     */
    formatFeedback(feedback: FeedbackReport): string;

    /**
     * Format an interview action response
     * @param action - The interview action to format
     * @returns Formatted action response
     */
    formatInterviewAction(action: InterviewAction): string;

    /**
     * Parse user input into a candidate response
     * @param sessionId - The session ID
     * @param questionId - The question being answered
     * @param input - Raw user input (text or transcribed speech)
     * @param timestamp - When the response was received
     * @returns Parsed candidate response
     */
    parseUserInput(
        sessionId: SessionId,
        questionId: string,
        input: string,
        timestamp: number
    ): CandidateResponse;
}

/**
 * Configuration for interaction modes
 */
export interface InteractionModeConfig {
    mode: InteractionModeType;
    // Voice-specific configuration
    voiceConfig?: {
        speechToTextProvider?: 'web-speech-api' | 'cloud-service';
        textToSpeechEnabled?: boolean;
        language?: string;
    };
    // Text-specific configuration
    textConfig?: {
        maxResponseLength?: number;
        enableMarkdown?: boolean;
    };
}
