import {
    BehaviorType,
    CandidateResponse,
    UserInteraction,
    InterviewQuestion,
    AdaptedResponse
} from '../models/types';

/**
 * BehaviorClassifier analyzes response patterns and classifies user behavior
 * to enable adaptive communication styles
 */
export class BehaviorClassifier {
    // Thresholds for behavior detection
    private static readonly CONFUSION_KEYWORDS = [
        'help', 'confused', 'don\'t understand', 'not sure', 'unclear',
        'what do you mean', 'can you explain', 'i don\'t know', 'unsure'
    ];

    private static readonly EFFICIENT_WORD_COUNT_MAX = 50;
    private static readonly CHATTY_WORD_COUNT_MIN = 200;
    private static readonly OFF_TOPIC_THRESHOLD = 0.3; // 30% keyword overlap minimum

    /**
     * Classify user behavior based on response history and interactions
     * @param responses - Array of candidate responses
     * @param interactions - Array of user interactions
     * @returns Classified behavior type
     */
    classifyBehavior(
        responses: CandidateResponse[],
        interactions: UserInteraction[]
    ): BehaviorType {
        if (responses.length === 0) {
            return 'standard';
        }

        // Check for confusion signals
        const confusionCount = responses.filter(r => this.detectConfusion(r)).length;
        if (confusionCount / responses.length > 0.3) {
            return 'confused';
        }

        // Check for efficient communication
        const efficientCount = responses.filter(r => this.detectEfficiency(r)).length;
        if (efficientCount / responses.length > 0.7) {
            return 'efficient';
        }

        // Check for chatty/verbose behavior
        const verboseCount = responses.filter(r => this.detectVerbosity(r)).length;
        if (verboseCount / responses.length > 0.5) {
            return 'chatty';
        }

        // Check for edge case behaviors in interactions
        const edgeCaseCount = interactions.filter(i => this.isEdgeCaseInteraction(i)).length;
        if (edgeCaseCount > 0) {
            return 'edge-case';
        }

        return 'standard';
    }

    /**
     * Detect if a response shows confusion
     * @param response - Candidate response
     * @returns true if confusion is detected
     */
    detectConfusion(response: CandidateResponse): boolean {
        const lowerText = response.text.toLowerCase();

        // Check for confusion keywords
        const hasConfusionKeywords = BehaviorClassifier.CONFUSION_KEYWORDS.some(
            keyword => lowerText.includes(keyword)
        );

        // Check for very short responses (might indicate uncertainty)
        const isTooShort = response.wordCount < 10 && response.text.trim().length > 0;

        // Check for excessive question marks
        const questionMarkCount = (response.text.match(/\?/g) || []).length;
        const hasExcessiveQuestions = questionMarkCount > 2;

        return hasConfusionKeywords || (isTooShort && hasExcessiveQuestions);
    }

    /**
     * Detect if a response shows efficient communication
     * @param response - Candidate response
     * @returns true if efficiency is detected
     */
    detectEfficiency(response: CandidateResponse): boolean {
        // Efficient responses are concise but substantive
        const isAppropriateLength =
            response.wordCount >= 15 &&
            response.wordCount <= BehaviorClassifier.EFFICIENT_WORD_COUNT_MAX;

        // Check for structured communication (bullet points, numbered lists)
        const hasStructure = /[-•*]\s|^\d+\.|^[a-z]\)/m.test(response.text);

        // Quick response time (relative to word count)
        const wordsPerSecond = response.wordCount / (response.responseTime / 1000);
        const isQuickResponse = wordsPerSecond > 0.5;

        return isAppropriateLength && (hasStructure || isQuickResponse);
    }

    /**
     * Detect if a response is overly verbose
     * @param response - Candidate response
     * @returns true if verbosity is detected
     */
    detectVerbosity(response: CandidateResponse): boolean {
        // Chatty responses are excessively long
        const isTooLong = response.wordCount > BehaviorClassifier.CHATTY_WORD_COUNT_MIN;

        // Check for repetitive content (same words used frequently)
        const words = response.text.toLowerCase().split(/\s+/);
        const uniqueWords = new Set(words);
        const repetitionRatio = uniqueWords.size / words.length;
        const isRepetitive = repetitionRatio < 0.5;

        return isTooLong || (response.wordCount > 100 && isRepetitive);
    }

    /**
     * Detect if a response is off-topic relative to the question
     * @param response - Candidate response
     * @param question - Interview question
     * @returns true if response is off-topic
     */
    detectOffTopic(response: CandidateResponse, question: InterviewQuestion): boolean {
        // Extract keywords from question
        const questionKeywords = this.extractKeywords(question.text);

        // Extract keywords from response
        const responseKeywords = this.extractKeywords(response.text);

        // Calculate overlap
        const overlap = questionKeywords.filter(kw =>
            responseKeywords.some(rw => rw.includes(kw) || kw.includes(rw))
        );

        const overlapRatio = overlap.length / Math.max(questionKeywords.length, 1);

        return overlapRatio < BehaviorClassifier.OFF_TOPIC_THRESHOLD;
    }

    /**
     * Check if an interaction represents an edge case behavior
     * @param interaction - User interaction
     * @returns true if edge case detected
     */
    private isEdgeCaseInteraction(interaction: UserInteraction): boolean {
        const lowerContent = interaction.content.toLowerCase();

        // Check for invalid commands or impossible requests
        const edgeCasePatterns = [
            'skip all questions',
            'give me the answers',
            'just pass me',
            'hack',
            'cheat',
            'bypass'
        ];

        return edgeCasePatterns.some(pattern => lowerContent.includes(pattern));
    }

    /**
     * Extract meaningful keywords from text
     * @param text - Text to analyze
     * @returns Array of keywords
     */
    private extractKeywords(text: string): string[] {
        // Remove common stop words and extract meaningful terms
        const stopWords = new Set([
            'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
            'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'be',
            'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will',
            'would', 'should', 'could', 'may', 'might', 'can', 'this', 'that',
            'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they'
        ]);

        return text
            .toLowerCase()
            .replace(/[^\w\s]/g, ' ')
            .split(/\s+/)
            .filter(word => word.length > 3 && !stopWords.has(word));
    }
}

/**
 * CommunicationAdapter adjusts response style based on classified behavior type
 */
export class CommunicationAdapter {
    /**
     * Adapt a response based on the user's behavior type
     * @param content - Original response content
     * @param behaviorType - Classified behavior type
     * @returns Adapted response with style adjustments
     */
    adaptResponse(content: string, behaviorType: BehaviorType): AdaptedResponse {
        switch (behaviorType) {
            case 'confused':
                return this.adaptForConfused(content);
            case 'efficient':
                return this.adaptForEfficient(content);
            case 'chatty':
                return this.adaptForChatty(content);
            case 'edge-case':
                return this.adaptForEdgeCase(content);
            case 'standard':
            default:
                return this.adaptForStandard(content);
        }
    }

    /**
     * Adapt response for confused users - provide guidance and clarity
     * @param content - Original content
     * @returns Adapted response
     */
    private adaptForConfused(content: string): AdaptedResponse {
        const adjustments = [
            'Added clarifying guidance',
            'Included step-by-step explanation',
            'Simplified language'
        ];

        // Add helpful framing
        const guidancePrefix = "Let me help clarify: ";
        const guidanceSuffix = "\n\nTake your time, and feel free to ask if you need any part explained further.";

        return {
            content: guidancePrefix + content + guidanceSuffix,
            style: 'confused',
            adjustments
        };
    }

    /**
     * Adapt response for efficient users - keep it concise
     * @param content - Original content
     * @returns Adapted response
     */
    private adaptForEfficient(content: string): AdaptedResponse {
        const adjustments = [
            'Removed unnecessary explanations',
            'Kept response concise',
            'Direct communication'
        ];

        // Remove verbose explanations, keep core content
        const conciseContent = content
            .split('\n')
            .filter(line => line.trim().length > 0)
            .slice(0, 3) // Limit to key points
            .join('\n');

        return {
            content: conciseContent,
            style: 'efficient',
            adjustments
        };
    }

    /**
     * Adapt response for chatty users - redirect to focus
     * @param content - Original content
     * @returns Adapted response
     */
    private adaptForChatty(content: string): AdaptedResponse {
        const adjustments = [
            'Added focus redirect',
            'Encouraged conciseness',
            'Provided structure guidance'
        ];

        const redirectPrefix = "Thank you for the detailed response. Let's focus on the key points: ";
        const redirectSuffix = "\n\nFor the next question, try to keep your answer focused on the main points.";

        return {
            content: redirectPrefix + content + redirectSuffix,
            style: 'chatty',
            adjustments
        };
    }

    /**
     * Adapt response for edge case behaviors - explain limitations and offer alternatives
     * @param content - Original content
     * @returns Adapted response
     */
    private adaptForEdgeCase(content: string): AdaptedResponse {
        const adjustments = [
            'Explained system limitations',
            'Offered valid alternatives',
            'Redirected to appropriate actions'
        ];

        const edgeCasePrefix = "I understand what you're trying to do, but that's not possible in this interview format. ";
        const edgeCaseSuffix = "\n\nHere are the valid options:\n" +
            "- Answer the current question\n" +
            "- Request clarification\n" +
            "- End the interview early\n\n" +
            "What would you like to do?";

        return {
            content: edgeCasePrefix + content + edgeCaseSuffix,
            style: 'edge-case',
            adjustments
        };
    }

    /**
     * Standard response adaptation - maintain professional tone
     * @param content - Original content
     * @returns Adapted response
     */
    private adaptForStandard(content: string): AdaptedResponse {
        return {
            content,
            style: 'standard',
            adjustments: []
        };
    }

    /**
     * Get a style-appropriate acknowledgment for a response
     * @param behaviorType - Classified behavior type
     * @returns Acknowledgment message
     */
    getAcknowledgment(behaviorType: BehaviorType): string {
        switch (behaviorType) {
            case 'confused':
                return "I see you might need some help. Let me guide you through this.";
            case 'efficient':
                return "Great, concise answer.";
            case 'chatty':
                return "Thank you for the thorough response.";
            case 'edge-case':
                return "Let me help you with what's possible here.";
            case 'standard':
            default:
                return "Thank you for your response.";
        }
    }

    /**
     * Get a style-appropriate transition to next question
     * @param behaviorType - Classified behavior type
     * @returns Transition message
     */
    getTransition(behaviorType: BehaviorType): string {
        switch (behaviorType) {
            case 'confused':
                return "When you're ready, here's the next question:";
            case 'efficient':
                return "Next question:";
            case 'chatty':
                return "Let's move on to the next question:";
            case 'edge-case':
                return "Let's continue with the interview. Here's the next question:";
            case 'standard':
            default:
                return "Here's your next question:";
        }
    }
}
