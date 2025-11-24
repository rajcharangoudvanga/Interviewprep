import { InteractionModeFactory } from './InteractionModeFactory';
import { TextInteractionMode } from './TextInteractionMode';
import { VoiceInteractionMode } from './VoiceInteractionMode';
import { InteractionModeConfig } from './InteractionMode';

describe('InteractionModeFactory', () => {
    describe('createMode', () => {
        it('should create text mode with configuration', () => {
            const config: InteractionModeConfig = {
                mode: 'text',
                textConfig: {
                    maxResponseLength: 5000,
                    enableMarkdown: true
                }
            };

            const mode = InteractionModeFactory.createMode(config);
            expect(mode).toBeInstanceOf(TextInteractionMode);
            expect(mode.getModeType()).toBe('text');
        });

        it('should create voice mode with configuration', () => {
            const config: InteractionModeConfig = {
                mode: 'voice',
                voiceConfig: {
                    speechToTextProvider: 'cloud-service',
                    textToSpeechEnabled: true,
                    language: 'en-US'
                }
            };

            const mode = InteractionModeFactory.createMode(config);
            expect(mode).toBeInstanceOf(VoiceInteractionMode);
            expect(mode.getModeType()).toBe('voice');
        });

        it('should throw error for unsupported mode', () => {
            const config = {
                mode: 'invalid-mode' as any
            };

            expect(() => InteractionModeFactory.createMode(config)).toThrow(
                'Unsupported interaction mode'
            );
        });
    });

    describe('createTextMode', () => {
        it('should create text mode with defaults', () => {
            const mode = InteractionModeFactory.createTextMode();
            expect(mode).toBeInstanceOf(TextInteractionMode);
            expect(mode.getModeType()).toBe('text');
        });
    });

    describe('createVoiceMode', () => {
        it('should create voice mode with defaults', () => {
            const mode = InteractionModeFactory.createVoiceMode();
            expect(mode).toBeInstanceOf(VoiceInteractionMode);
            expect(mode.getModeType()).toBe('voice');
        });
    });

    describe('getAvailableModes', () => {
        it('should return all available mode types', () => {
            const modes = InteractionModeFactory.getAvailableModes();
            expect(modes).toEqual(['text', 'voice']);
            expect(modes).toHaveLength(2);
        });
    });
});
