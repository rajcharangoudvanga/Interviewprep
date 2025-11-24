import {
    SessionId,
    InterviewQuestion,
    CandidateResponse,
    FeedbackReport,
    InterviewAction
} from '../models/types';
import { InteractionMode, InteractionModeType } from './InteractionMode';

/**
 * Text-based interaction mode implementation
 * Handles text input/output for the interview system
 */
export class TextInteractionMode implements InteractionMode {
    private maxResponseLength: number;

    constructor(config?: { maxResponseLength?: number; enableMarkdown?: boolean }) {
        this.maxResponseLength = config?.maxResponseLength || 10000;
        // enableMarkdown is reserved for future use
    }

    getModeType(): InteractionModeType {
        return 'text';
    }

    /**
     * Format a question for text display
     * @param question - The interview question
     * @returns Formatted question text
     */
    formatQuestion(question: InterviewQuestion): string {
        const parts: string[] = [];

        // Question type indicator
        const typeLabel = question.type === 'technical' ? '🔧 Technical' : '💬 Behavioral';
        parts.push(`[${typeLabel}] ${question.text}`);

        // Add resume context if available
        if (question.resumeContext) {
            parts.push('');
            parts.push(`📄 Context from your resume: "${question.resumeContext.content}"`);
        }

        return parts.join('\n');
    }

    /**
     * Format a conversational response for text display
     * Keep it short and natural for interview flow
     * @param content - The content to format
     * @returns Formatted response
     */
    formatConversationalResponse(content: string): string {
        // For text mode, keep responses concise and direct
        return content;
    }

    /**
     * Format the feedback report as detailed written text
     * This is the same for both voice and text modes per requirements
     * @param feedback - The feedback report
     * @returns Formatted feedback text
     */
    formatFeedback(feedback: FeedbackReport): string {
        const sections: string[] = [];

        // Header
        sections.push('═══════════════════════════════════════════════════════');
        sections.push('           INTERVIEW FEEDBACK REPORT');
        sections.push('═══════════════════════════════════════════════════════');
        sections.push('');

        // Overall Score
        sections.push('📊 OVERALL PERFORMANCE');
        sections.push('─────────────────────────────────────────────────────');
        sections.push(`Grade: ${feedback.scores.overall.grade}`);
        sections.push(`Score: ${feedback.scores.overall.weightedTotal.toFixed(1)}/100`);
        sections.push('');

        // Communication Score
        sections.push('💬 COMMUNICATION SKILLS');
        sections.push('─────────────────────────────────────────────────────');
        sections.push(`Overall Grade: ${feedback.scores.communication.grade} (${feedback.scores.communication.total}/40)`);
        sections.push(`  • Clarity: ${feedback.scores.communication.clarity.toFixed(1)}/10`);
        sections.push(`  • Articulation: ${feedback.scores.communication.articulation.toFixed(1)}/10`);
        sections.push(`  • Structure: ${feedback.scores.communication.structure.toFixed(1)}/10`);
        sections.push(`  • Professionalism: ${feedback.scores.communication.professionalism.toFixed(1)}/10`);
        sections.push('');

        // Technical Score
        sections.push('🔧 TECHNICAL FIT');
        sections.push('─────────────────────────────────────────────────────');
        sections.push(`Overall Grade: ${feedback.scores.technicalFit.grade} (${feedback.scores.technicalFit.total}/40)`);
        sections.push(`  • Depth: ${feedback.scores.technicalFit.depth.toFixed(1)}/10`);
        sections.push(`  • Accuracy: ${feedback.scores.technicalFit.accuracy.toFixed(1)}/10`);
        sections.push(`  • Relevance: ${feedback.scores.technicalFit.relevance.toFixed(1)}/10`);
        sections.push(`  • Problem Solving: ${feedback.scores.technicalFit.problemSolving.toFixed(1)}/10`);
        sections.push('');

        // Strengths
        if (feedback.strengths.length > 0) {
            sections.push('✨ STRENGTHS');
            sections.push('─────────────────────────────────────────────────────');
            feedback.strengths.forEach(strength => {
                sections.push(`  ✓ ${strength}`);
            });
            sections.push('');
        }

        // Improvements
        if (feedback.improvements.length > 0) {
            sections.push('📈 AREAS FOR IMPROVEMENT');
            sections.push('─────────────────────────────────────────────────────');

            // Group by priority
            const highPriority = feedback.improvements.filter(i => i.priority === 'high');
            const mediumPriority = feedback.improvements.filter(i => i.priority === 'medium');
            const lowPriority = feedback.improvements.filter(i => i.priority === 'low');

            if (highPriority.length > 0) {
                sections.push('High Priority:');
                highPriority.forEach(imp => {
                    sections.push(`  🔴 ${imp.category}`);
                    sections.push(`     ${imp.observation}`);
                    sections.push(`     💡 ${imp.suggestion}`);
                    sections.push('');
                });
            }

            if (mediumPriority.length > 0) {
                sections.push('Medium Priority:');
                mediumPriority.forEach(imp => {
                    sections.push(`  🟡 ${imp.category}`);
                    sections.push(`     ${imp.observation}`);
                    sections.push(`     💡 ${imp.suggestion}`);
                    sections.push('');
                });
            }

            if (lowPriority.length > 0) {
                sections.push('Low Priority:');
                lowPriority.forEach(imp => {
                    sections.push(`  🟢 ${imp.category}`);
                    sections.push(`     ${imp.observation}`);
                    sections.push(`     💡 ${imp.suggestion}`);
                    sections.push('');
                });
            }
        }

        // Resume Alignment (if available)
        if (feedback.resumeAlignment) {
            sections.push('📄 RESUME ALIGNMENT');
            sections.push('─────────────────────────────────────────────────────');
            sections.push(`Alignment Score: ${feedback.resumeAlignment.alignmentScore.toFixed(1)}/100`);
            sections.push('');

            if (feedback.resumeAlignment.matchedSkills.length > 0) {
                sections.push('Skills Demonstrated:');
                feedback.resumeAlignment.matchedSkills.forEach(skill => {
                    sections.push(`  ✓ ${skill.name}`);
                });
                sections.push('');
            }

            if (feedback.resumeAlignment.missingSkills.length > 0) {
                sections.push('Skills to Add:');
                feedback.resumeAlignment.missingSkills.forEach(skill => {
                    sections.push(`  ○ ${skill.name}`);
                });
                sections.push('');
            }

            if (feedback.resumeAlignment.suggestions.length > 0) {
                sections.push('Resume Improvement Suggestions:');
                feedback.resumeAlignment.suggestions.forEach(suggestion => {
                    sections.push(`  • ${suggestion}`);
                });
                sections.push('');
            }
        }

        // Summary
        sections.push('📝 SUMMARY');
        sections.push('─────────────────────────────────────────────────────');
        sections.push(feedback.summary);
        sections.push('');

        sections.push('═══════════════════════════════════════════════════════');

        return sections.join('\n');
    }

    /**
     * Format an interview action for text display
     * @param action - The interview action
     * @returns Formatted action text
     */
    formatInterviewAction(action: InterviewAction): string {
        switch (action.type) {
            case 'next-question':
                return this.formatQuestion(action.question);

            case 'follow-up':
                return `\n🔍 Follow-up: ${action.question.text}`;

            case 'complete':
                return this.formatFeedback(action.feedback);

            case 'redirect':
                return `⚠️  ${action.message}`;

            default:
                return 'Unknown action';
        }
    }

    /**
     * Parse text input into a candidate response
     * @param sessionId - The session ID
     * @param questionId - The question being answered
     * @param input - Raw text input
     * @param timestamp - When the response was received
     * @returns Parsed candidate response
     */
    parseUserInput(
        _sessionId: SessionId,
        questionId: string,
        input: string,
        timestamp: number
    ): CandidateResponse {
        // Trim and validate input
        const trimmedInput = input.trim();

        // Truncate if exceeds max length
        const text = trimmedInput.length > this.maxResponseLength
            ? trimmedInput.substring(0, this.maxResponseLength)
            : trimmedInput;

        // Count words
        const wordCount = this.countWords(text);

        // Calculate response time (simplified - would need question start time in real implementation)
        const responseTime = 0; // Placeholder

        return {
            questionId,
            text,
            timestamp,
            wordCount,
            responseTime
        };
    }

    /**
     * Count words in text
     * @private
     */
    private countWords(text: string): number {
        return text.trim().split(/\s+/).filter(word => word.length > 0).length;
    }
}
