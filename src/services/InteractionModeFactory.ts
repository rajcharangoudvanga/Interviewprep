import { InteractionMode, InteractionModeConfig, InteractionModeType } from './InteractionMode';
import { TextInteractionMode } from './TextInteractionMode';
import { VoiceInteractionMode } from './VoiceInteractionMode';

/**
 * Factory for creating interaction mode instances
 * Manages the creation and configuration of different interaction modes
 */
export class InteractionModeFactory {
    /**
     * Create an interaction mode instance based on configuration
     * @param config - Configuration for the interaction mode
     * @returns Configured interaction mode instance
     */
    static createMode(config: InteractionModeConfig): InteractionMode {
        switch (config.mode) {
            case 'text':
                return new TextInteractionMode(config.textConfig);

            case 'voice':
                return new VoiceInteractionMode(config.voiceConfig);

            default:
                throw new Error(`Unsupported interaction mode: ${config.mode}`);
        }
    }

    /**
     * Create a text interaction mode with default configuration
     * @returns Text interaction mode instance
     */
    static createTextMode(): InteractionMode {
        return new TextInteractionMode();
    }

    /**
     * Create a voice interaction mode with default configuration
     * @returns Voice interaction mode instance
     */
    static createVoiceMode(): InteractionMode {
        return new VoiceInteractionMode();
    }

    /**
     * Get available interaction mode types
     * @returns Array of supported mode types
     */
    static getAvailableModes(): InteractionModeType[] {
        return ['text', 'voice'];
    }
}
