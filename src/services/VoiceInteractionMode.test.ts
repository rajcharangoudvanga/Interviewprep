import { VoiceInteractionMode } from './VoiceInteractionMode';
import { InterviewQuestion, FeedbackReport, InterviewAction } from '../models/types';

describe('VoiceInteractionMode', () => {
    let voiceMode: VoiceInteractionMode;

    beforeEach(() => {
        voiceMode = new VoiceInteractionMode();
    });

    describe('getModeType', () => {
        it('should return voice as mode type', () => {
            expect(voiceMode.getModeType()).toBe('voice');
        });
    });

    describe('formatQuestion', () => {
        it('should format a technical question for voice', () => {
            const question: InterviewQuestion = {
                id: 'q1',
                type: 'technical',
                text: 'Explain how closures work in JavaScript',
                category: 'JavaScript',
                difficulty: 5
            };

            const formatted = voiceMode.formatQuestion(question);
            expect(formatted).toContain('technical question');
            expect(formatted).toContain('Explain how closures work in JavaScript');
        });

        it('should format a behavioral question for voice', () => {
            const question: InterviewQuestion = {
                id: 'q2',
                type: 'behavioral',
                text: 'Tell me about a time you resolved a conflict',
                category: 'Leadership',
                difficulty: 4
            };

            const formatted = voiceMode.formatQuestion(question);
            expect(formatted).toContain('behavioral question');
            expect(formatted).toContain('Tell me about a time you resolved a conflict');
        });

        it('should include resume context in conversational style', () => {
            const question: InterviewQuestion = {
                id: 'q3',
                type: 'technical',
                text: 'How did you implement the payment system?',
                category: 'System Design',
                difficulty: 6,
                resumeContext: {
                    section: 'experience',
                    content: 'Built payment processing system',
                    relevance: 'Direct experience'
                }
            };

            const formatted = voiceMode.formatQuestion(question);
            expect(formatted).toContain('I noticed on your resume');
            expect(formatted).toContain('Built payment processing system');
        });
    });

    describe('formatConversationalResponse', () => {
        it('should remove emojis from content', () => {
            const content = '🔧 Great answer! 💬 Let me ask a follow-up.';
            const formatted = voiceMode.formatConversationalResponse(content);
            expect(formatted).not.toContain('🔧');
            expect(formatted).not.toContain('💬');
            expect(formatted).toContain('Great answer!');
        });

        it('should remove decorative lines', () => {
            const content = '═══════════\nGreat!\n─────────';
            const formatted = voiceMode.formatConversationalResponse(content);
            expect(formatted).not.toContain('═');
            expect(formatted).not.toContain('─');
            expect(formatted).toContain('Great!');
        });
    });

    describe('formatFeedback', () => {
        it('should format feedback consistently with text mode', () => {
            const feedback: FeedbackReport = {
                sessionId: 'session-1',
                scores: {
                    communication: {
                        clarity: 8,
                        articulation: 7,
                        structure: 8,
                        professionalism: 9,
                        total: 32,
                        grade: 'B'
                    },
                    technicalFit: {
                        depth: 7,
                        accuracy: 8,
                        relevance: 8,
                        problemSolving: 7,
                        total: 30,
                        grade: 'B'
                    },
                    overall: {
                        communicationWeight: 0.4,
                        technicalWeight: 0.6,
                        weightedTotal: 77,
                        grade: 'B'
                    }
                },
                strengths: ['Clear communication'],
                improvements: [],
                questionBreakdown: [],
                summary: 'Good performance.'
            };

            const formatted = voiceMode.formatFeedback(feedback);
            // Should be same format as text mode per requirements
            expect(formatted).toContain('INTERVIEW FEEDBACK REPORT');
            expect(formatted).toContain('OVERALL PERFORMANCE');
            expect(formatted).toContain('Grade: B');
        });
    });

    describe('formatInterviewAction', () => {
        it('should format follow-up action with conversational prefix', () => {
            const action: InterviewAction = {
                type: 'follow-up',
                question: {
                    id: 'q2',
                    type: 'technical',
                    text: 'Can you explain that in more detail?',
                    category: 'JavaScript',
                    difficulty: 5
                }
            };

            const formatted = voiceMode.formatInterviewAction(action);
            expect(formatted).toContain('Let me follow up on that');
            expect(formatted).toContain('Can you explain that in more detail?');
        });

        it('should format complete action with announcement', () => {
            const action: InterviewAction = {
                type: 'complete',
                feedback: {
                    sessionId: 'session-1',
                    scores: {
                        communication: {
                            clarity: 8,
                            articulation: 7,
                            structure: 8,
                            professionalism: 9,
                            total: 32,
                            grade: 'B'
                        },
                        technicalFit: {
                            depth: 7,
                            accuracy: 8,
                            relevance: 8,
                            problemSolving: 7,
                            total: 30,
                            grade: 'B'
                        },
                        overall: {
                            communicationWeight: 0.4,
                            technicalWeight: 0.6,
                            weightedTotal: 77,
                            grade: 'B'
                        }
                    },
                    strengths: [],
                    improvements: [],
                    questionBreakdown: [],
                    summary: 'Good performance.'
                }
            };

            const formatted = voiceMode.formatInterviewAction(action);
            expect(formatted).toContain("We've completed the interview");
            expect(formatted).toContain('feedback report');
        });
    });

    describe('parseUserInput', () => {
        it('should parse transcribed speech into candidate response', () => {
            const input = 'A closure is a function that has access to variables in its outer scope.';
            const timestamp = Date.now();

            const response = voiceMode.parseUserInput('session-1', 'q1', input, timestamp);

            expect(response.questionId).toBe('q1');
            expect(response.text).toBe(input);
            expect(response.timestamp).toBe(timestamp);
            expect(response.wordCount).toBe(14);
        });
    });

    describe('configuration', () => {
        it('should use default configuration', () => {
            const mode = new VoiceInteractionMode();
            expect(mode.getSpeechToTextProvider()).toBe('web-speech-api');
            expect(mode.isTextToSpeechEnabled()).toBe(true);
            expect(mode.getLanguage()).toBe('en-US');
        });

        it('should accept custom configuration', () => {
            const mode = new VoiceInteractionMode({
                speechToTextProvider: 'cloud-service',
                textToSpeechEnabled: false,
                language: 'es-ES'
            });

            expect(mode.getSpeechToTextProvider()).toBe('cloud-service');
            expect(mode.isTextToSpeechEnabled()).toBe(false);
            expect(mode.getLanguage()).toBe('es-ES');
        });
    });

    describe('speech integration placeholders', () => {
        it('should throw error for unimplemented Web Speech API', async () => {
            await expect(voiceMode.startSpeechRecognition()).rejects.toThrow(
                'Web Speech API integration not yet implemented'
            );
        });

        it('should throw error for unimplemented cloud service', async () => {
            const mode = new VoiceInteractionMode({
                speechToTextProvider: 'cloud-service'
            });

            await expect(mode.startSpeechRecognition()).rejects.toThrow(
                'Cloud speech service integration not yet implemented'
            );
        });
    });
});
