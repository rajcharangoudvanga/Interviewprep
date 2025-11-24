import {
    SessionId,
    InterviewQuestion,
    CandidateResponse,
    FeedbackReport,
    InterviewAction
} from '../models/types';
import { InteractionMode, InteractionModeType } from './InteractionMode';
import { TextInteractionMode } from './TextInteractionMode';

/**
 * Voice-based interaction mode implementation
 * Placeholder with integration points for speech-to-text services
 */
export class VoiceInteractionMode implements InteractionMode {
    private textMode: TextInteractionMode;
    private speechToTextProvider: 'web-speech-api' | 'cloud-service';
    private textToSpeechEnabled: boolean;
    private language: string;

    constructor(config?: {
        speechToTextProvider?: 'web-speech-api' | 'cloud-service';
        textToSpeechEnabled?: boolean;
        language?: string;
    }) {
        this.textMode = new TextInteractionMode();
        this.speechToTextProvider = config?.speechToTextProvider || 'web-speech-api';
        this.textToSpeechEnabled = config?.textToSpeechEnabled ?? true;
        this.language = config?.language || 'en-US';
    }

    getModeType(): InteractionModeType {
        return 'voice';
    }

    /**
     * Format a question for voice presentation
     * Shorter, more conversational than text mode
     * @param question - The interview question
     * @returns Formatted question text for speech
     */
    formatQuestion(question: InterviewQuestion): string {
        const parts: string[] = [];

        // Simpler introduction for voice
        if (question.type === 'technical') {
            parts.push("Here's a technical question:");
        } else {
            parts.push("Let me ask you a behavioral question:");
        }

        parts.push(question.text);

        // Add resume context if available (more conversational)
        if (question.resumeContext) {
            parts.push(`I noticed on your resume you mentioned ${question.resumeContext.content}.`);
        }

        return parts.join(' ');
    }

    /**
     * Format a conversational response for voice
     * Very short and natural for spoken interaction
     * @param content - The content to format
     * @returns Formatted response for speech
     */
    formatConversationalResponse(content: string): string {
        // For voice mode, keep responses very brief and conversational
        // Remove any formatting characters that don't make sense in speech
        return content
            .replace(/[📊💬🔧📄✨📈🔴🟡🟢💡○✓]/g, '') // Remove emojis
            .replace(/═+/g, '') // Remove decorative lines
            .replace(/─+/g, ''); // Remove decorative lines
    }

    /**
     * Format the feedback report for voice delivery
     * Uses the same detailed written format as text mode per requirements
     * The feedback is always provided as detailed written summary regardless of mode
     * @param feedback - The feedback report
     * @returns Formatted feedback text
     */
    formatFeedback(feedback: FeedbackReport): string {
        // Per requirement 9.3: feedback format must be consistent across modes
        // Always provide detailed written summary
        return this.textMode.formatFeedback(feedback);
    }

    /**
     * Format an interview action for voice presentation
     * @param action - The interview action
     * @returns Formatted action for speech
     */
    formatInterviewAction(action: InterviewAction): string {
        switch (action.type) {
            case 'next-question':
                return this.formatQuestion(action.question);

            case 'follow-up':
                return `Let me follow up on that. ${action.question.text}`;

            case 'complete':
                // For voice, we might want to announce completion before showing written feedback
                const announcement = "Great! We've completed the interview. Here's your detailed feedback report.";
                return `${announcement}\n\n${this.formatFeedback(action.feedback)}`;

            case 'redirect':
                return this.formatConversationalResponse(action.message);

            default:
                return 'Unknown action';
        }
    }

    /**
     * Parse voice input (transcribed speech) into a candidate response
     * @param sessionId - The session ID
     * @param questionId - The question being answered
     * @param input - Transcribed speech text
     * @param timestamp - When the response was received
     * @returns Parsed candidate response
     */
    parseUserInput(
        sessionId: SessionId,
        questionId: string,
        input: string,
        timestamp: number
    ): CandidateResponse {
        // For voice input, we use the same parsing as text
        // The input should already be transcribed by the speech-to-text service
        return this.textMode.parseUserInput(sessionId, questionId, input, timestamp);
    }

    /**
     * Integration point: Start speech recognition
     * This would connect to Web Speech API or cloud service
     * @returns Promise that resolves with transcribed text
     */
    async startSpeechRecognition(): Promise<string> {
        // Placeholder for speech-to-text integration
        if (this.speechToTextProvider === 'web-speech-api') {
            return this.startWebSpeechAPI();
        } else {
            return this.startCloudSpeechService();
        }
    }

    /**
     * Integration point: Web Speech API
     * @private
     */
    private async startWebSpeechAPI(): Promise<string> {
        // Placeholder for Web Speech API integration
        // In a real implementation, this would use the browser's SpeechRecognition API
        // Example:
        // const recognition = new webkitSpeechRecognition();
        // recognition.lang = this.language;
        // recognition.start();
        // return new Promise((resolve) => {
        //   recognition.onresult = (event) => {
        //     const transcript = event.results[0][0].transcript;
        //     resolve(transcript);
        //   };
        // });

        throw new Error('Web Speech API integration not yet implemented. Please use text mode.');
    }

    /**
     * Integration point: Cloud speech service (e.g., Google Cloud Speech, AWS Transcribe)
     * @private
     */
    private async startCloudSpeechService(): Promise<string> {
        // Placeholder for cloud speech service integration
        // In a real implementation, this would connect to a cloud provider's API
        // Example:
        // const client = new SpeechClient();
        // const audio = { content: audioBuffer };
        // const config = { encoding: 'LINEAR16', languageCode: this.language };
        // const [response] = await client.recognize({ audio, config });
        // return response.results[0].alternatives[0].transcript;

        throw new Error('Cloud speech service integration not yet implemented. Please use text mode.');
    }

    /**
     * Integration point: Text-to-speech synthesis
     * Convert text to speech for audio feedback
     * @param text - Text to synthesize
     */
    async synthesizeSpeech(text: string): Promise<void> {
        if (!this.textToSpeechEnabled) {
            return;
        }

        // Placeholder for text-to-speech integration
        // In a real implementation, this would use Web Speech API or cloud service
        // Example (Web Speech API):
        // const utterance = new SpeechSynthesisUtterance(text);
        // utterance.lang = this.language;
        // window.speechSynthesis.speak(utterance);

        console.log(`[TTS Placeholder] Would speak: ${text.substring(0, 50)}...`);
    }

    /**
     * Get the configured speech-to-text provider
     */
    getSpeechToTextProvider(): string {
        return this.speechToTextProvider;
    }

    /**
     * Check if text-to-speech is enabled
     */
    isTextToSpeechEnabled(): boolean {
        return this.textToSpeechEnabled;
    }

    /**
     * Get the configured language
     */
    getLanguage(): string {
        return this.language;
    }
}
