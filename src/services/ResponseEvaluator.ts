import {
    InterviewQuestion,
    CandidateResponse,
    ResponseEvaluation,
    DepthScore,
    ClarityScore,
    CompletenessScore
} from '../models/types';

/**
 * ResponseEvaluator analyzes candidate responses for depth, clarity, and completeness
 * to determine response quality and whether follow-up questions are needed
 */
export class ResponseEvaluator {
    // Thresholds for determining if follow-up is needed
    private readonly FOLLOW_UP_THRESHOLD = 6; // Scores below this trigger follow-ups
    private readonly MIN_WORD_COUNT_TECHNICAL = 30; // Minimum words for technical questions
    private readonly MIN_WORD_COUNT_BEHAVIORAL = 50; // Minimum words for behavioral questions

    // Technical keywords for depth assessment
    private readonly TECHNICAL_KEYWORDS = [
        'algorithm', 'complexity', 'performance', 'optimization', 'architecture',
        'design', 'pattern', 'implementation', 'database', 'api', 'framework',
        'testing', 'deployment', 'scalability', 'security', 'authentication',
        'authorization', 'cache', 'queue', 'microservice', 'container', 'cloud',
        'distributed', 'concurrent', 'asynchronous', 'synchronous', 'protocol',
        'interface', 'abstraction', 'inheritance', 'polymorphism', 'encapsulation'
    ];

    // Structure indicators for clarity assessment
    private readonly STRUCTURE_INDICATORS = [
        'first', 'second', 'third', 'finally', 'then', 'next', 'after',
        'because', 'therefore', 'however', 'additionally', 'furthermore',
        'for example', 'such as', 'specifically', 'in particular'
    ];

    /**
     * Evaluate a candidate's response to an interview question
     * @param question - The interview question being answered
     * @param response - The candidate's response
     * @returns ResponseEvaluation with scores and follow-up determination
     */
    evaluate(
        question: InterviewQuestion,
        response: CandidateResponse
    ): ResponseEvaluation {
        // Assess individual dimensions
        const depthScore = this.assessDepth(response, question);
        const clarityScore = this.assessClarity(response);
        const completenessScore = this.assessCompleteness(response, question.expectedElements || []);

        // Assess technical accuracy for technical questions
        let technicalAccuracy: number | undefined;
        if (question.type === 'technical') {
            technicalAccuracy = this.assessTechnicalAccuracy(response, question);
        }

        // Determine if follow-up is needed
        const needsFollowUp = this.needsFollowUp({
            questionId: question.id,
            depthScore,
            clarityScore,
            completenessScore,
            needsFollowUp: false, // placeholder
            technicalAccuracy
        });

        // Determine follow-up reason if needed
        let followUpReason: string | undefined;
        if (needsFollowUp) {
            followUpReason = this.determineFollowUpReason(
                depthScore,
                clarityScore,
                completenessScore,
                technicalAccuracy
            );
        }

        return {
            questionId: question.id,
            depthScore,
            clarityScore,
            completenessScore,
            needsFollowUp,
            followUpReason,
            technicalAccuracy
        };
    }

    /**
     * Assess the depth of a response based on length and technical content
     * @param response - The candidate's response
     * @param question - The interview question (for context)
     * @returns DepthScore (0-10)
     */
    assessDepth(response: CandidateResponse, question?: InterviewQuestion): DepthScore {
        const text = response.text.toLowerCase();
        const wordCount = response.wordCount;

        // Base score from word count
        let score = 0;

        // Determine minimum expected word count based on question type
        const minWords = question?.type === 'technical'
            ? this.MIN_WORD_COUNT_TECHNICAL
            : this.MIN_WORD_COUNT_BEHAVIORAL;

        // Score based on word count (0-5 points)
        if (wordCount < minWords * 0.5) {
            score += 1; // Very short
        } else if (wordCount < minWords) {
            score += 3; // Short but somewhat adequate
        } else if (wordCount < minWords * 2) {
            score += 5; // Good length
        } else if (wordCount < minWords * 3) {
            score += 4; // Comprehensive
        } else {
            score += 3; // Potentially too verbose
        }

        // Additional points for technical content (0-5 points)
        const technicalKeywordCount = this.countKeywords(text, this.TECHNICAL_KEYWORDS);
        const technicalDensity = technicalKeywordCount / Math.max(wordCount / 10, 1);

        if (technicalDensity >= 2) {
            score += 5; // High technical density
        } else if (technicalDensity >= 1) {
            score += 4; // Good technical content
        } else if (technicalDensity >= 0.5) {
            score += 3; // Moderate technical content
        } else if (technicalDensity >= 0.2) {
            score += 2; // Some technical content
        } else {
            score += 1; // Minimal technical content
        }

        // Clamp to 0-10 range
        return Math.min(Math.max(score, 0), 10);
    }

    /**
     * Assess the clarity of a response based on structure and coherence
     * @param response - The candidate's response
     * @returns ClarityScore (0-10)
     */
    assessClarity(response: CandidateResponse): ClarityScore {
        const text = response.text.toLowerCase();
        const wordCount = response.wordCount;

        let score = 5; // Start with baseline

        // Check for structure indicators (0-3 points)
        const structureCount = this.countKeywords(text, this.STRUCTURE_INDICATORS);
        if (structureCount >= 5) {
            score += 3; // Well-structured
        } else if (structureCount >= 3) {
            score += 2; // Some structure
        } else if (structureCount >= 1) {
            score += 1; // Minimal structure
        }

        // Check for sentence variety (0-2 points)
        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
        const avgSentenceLength = wordCount / Math.max(sentences.length, 1);

        if (avgSentenceLength >= 10 && avgSentenceLength <= 25) {
            score += 2; // Good sentence length variety
        } else if (avgSentenceLength >= 5 && avgSentenceLength <= 35) {
            score += 1; // Acceptable sentence length
        }

        // Penalize very short responses (lack of clarity)
        if (wordCount < 20) {
            score -= 2;
        }

        // Penalize excessive length without structure
        if (wordCount > 300 && structureCount < 3) {
            score -= 1; // Long but unstructured
        }

        // Clamp to 0-10 range
        return Math.min(Math.max(score, 0), 10);
    }

    /**
     * Assess completeness based on coverage of expected elements
     * @param response - The candidate's response
     * @param expectedElements - Array of expected elements/topics
     * @returns CompletenessScore (0-10)
     */
    assessCompleteness(
        response: CandidateResponse,
        expectedElements: string[]
    ): CompletenessScore {
        // If no expected elements defined, use heuristic scoring
        if (!expectedElements || expectedElements.length === 0) {
            return this.assessCompletenessHeuristic(response);
        }

        const text = response.text.toLowerCase();
        let coveredCount = 0;

        // Check how many expected elements are mentioned
        for (const element of expectedElements) {
            const elementLower = element.toLowerCase();
            // Check for exact match or partial match
            if (text.includes(elementLower) || this.hasPartialMatch(text, elementLower)) {
                coveredCount++;
            }
        }

        // Calculate coverage percentage and convert to 0-10 scale
        const coverageRatio = coveredCount / expectedElements.length;
        let score = coverageRatio * 10;

        // Bonus for covering all elements
        if (coverageRatio === 1.0) {
            score = 10;
        }

        // Clamp to 0-10 range
        return Math.min(Math.max(score, 0), 10);
    }

    /**
     * Assess technical accuracy for technical questions
     * @param response - The candidate's response
     * @param question - The technical question
     * @returns Technical accuracy score (0-10)
     */
    private assessTechnicalAccuracy(
        response: CandidateResponse,
        question: InterviewQuestion
    ): number {
        const text = response.text.toLowerCase();

        let score = 5; // Start with baseline

        // Check for technical terminology relevant to the question category
        const categoryKeywords = this.getCategoryKeywords(question.category);
        const relevantKeywordCount = this.countKeywords(text, categoryKeywords);

        if (relevantKeywordCount >= 5) {
            score += 3; // High technical accuracy
        } else if (relevantKeywordCount >= 3) {
            score += 2; // Good technical accuracy
        } else if (relevantKeywordCount >= 1) {
            score += 1; // Some technical accuracy
        } else {
            score -= 1; // Lacking technical accuracy
        }

        // Check for specific examples or concrete details
        const hasExamples = /for example|such as|like|specifically|instance/.test(text);
        if (hasExamples) {
            score += 2;
        }

        // Clamp to 0-10 range
        return Math.min(Math.max(score, 0), 10);
    }

    /**
     * Determine if a follow-up question is needed based on evaluation scores
     * @param evaluation - The response evaluation (without needsFollowUp set)
     * @returns true if follow-up is needed
     */
    needsFollowUp(evaluation: ResponseEvaluation): boolean {
        const { depthScore, clarityScore, completenessScore, technicalAccuracy } = evaluation;

        // Follow-up needed if any core dimension is below threshold
        if (depthScore < this.FOLLOW_UP_THRESHOLD) {
            return true;
        }

        if (completenessScore < this.FOLLOW_UP_THRESHOLD) {
            return true;
        }

        // For technical questions, also consider technical accuracy
        if (technicalAccuracy !== undefined && technicalAccuracy < this.FOLLOW_UP_THRESHOLD) {
            return true;
        }

        // If clarity is very low, might need clarification
        if (clarityScore < 4) {
            return true;
        }

        return false;
    }

    /**
     * Determine the reason for follow-up based on which scores are low
     * @private
     */
    private determineFollowUpReason(
        depthScore: number,
        clarityScore: number,
        completenessScore: number,
        technicalAccuracy?: number
    ): string {
        const reasons: string[] = [];

        if (depthScore < this.FOLLOW_UP_THRESHOLD) {
            reasons.push('insufficient depth');
        }

        if (completenessScore < this.FOLLOW_UP_THRESHOLD) {
            reasons.push('incomplete coverage of key elements');
        }

        if (technicalAccuracy !== undefined && technicalAccuracy < this.FOLLOW_UP_THRESHOLD) {
            reasons.push('lacking technical detail');
        }

        if (clarityScore < 4) {
            reasons.push('unclear explanation');
        }

        return reasons.join(', ');
    }

    /**
     * Heuristic completeness assessment when no expected elements are provided
     * @private
     */
    private assessCompletenessHeuristic(response: CandidateResponse): CompletenessScore {
        const text = response.text.toLowerCase();
        const wordCount = response.wordCount;

        let score = 5; // Start with baseline

        // Check for problem-solution structure
        const hasProblem = /problem|challenge|issue|difficulty/.test(text);
        const hasSolution = /solution|approach|resolved|fixed|implemented/.test(text);
        const hasOutcome = /result|outcome|impact|success|improved/.test(text);

        if (hasProblem && hasSolution && hasOutcome) {
            score += 3; // Complete narrative
        } else if ((hasProblem && hasSolution) || (hasSolution && hasOutcome)) {
            score += 2; // Partial narrative
        } else if (hasProblem || hasSolution || hasOutcome) {
            score += 1; // Some narrative elements
        }

        // Adjust based on word count
        if (wordCount >= 100) {
            score += 2; // Comprehensive response
        } else if (wordCount >= 50) {
            score += 1; // Adequate response
        } else if (wordCount < 20) {
            score -= 2; // Too brief
        }

        // Clamp to 0-10 range
        return Math.min(Math.max(score, 0), 10);
    }

    /**
     * Count occurrences of keywords in text
     * @private
     */
    private countKeywords(text: string, keywords: string[]): number {
        let count = 0;
        for (const keyword of keywords) {
            const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
            const matches = text.match(regex);
            if (matches) {
                count += matches.length;
            }
        }
        return count;
    }

    /**
     * Check for partial match of a phrase in text
     * @private
     */
    private hasPartialMatch(text: string, phrase: string): boolean {
        const words = phrase.split(/\s+/);
        // Consider it a partial match if at least half the words are present
        const threshold = Math.ceil(words.length / 2);
        let matchCount = 0;

        for (const word of words) {
            if (text.includes(word)) {
                matchCount++;
            }
        }

        return matchCount >= threshold;
    }

    /**
     * Get category-specific keywords for technical accuracy assessment
     * @private
     */
    private getCategoryKeywords(category: string): string[] {
        const categoryLower = category.toLowerCase();

        // Map categories to relevant keywords
        const categoryKeywordMap: Record<string, string[]> = {
            'data structures': ['array', 'list', 'tree', 'graph', 'hash', 'stack', 'queue', 'heap', 'linked list'],
            'algorithms': ['sort', 'search', 'traverse', 'recursive', 'iterative', 'complexity', 'big o', 'time', 'space'],
            'system design': ['scalability', 'availability', 'consistency', 'partition', 'load balancer', 'cache', 'database', 'microservice'],
            'database': ['sql', 'query', 'index', 'transaction', 'normalization', 'join', 'schema', 'optimization'],
            'api development': ['rest', 'endpoint', 'http', 'request', 'response', 'authentication', 'authorization', 'versioning'],
            'javascript': ['closure', 'promise', 'async', 'callback', 'prototype', 'event', 'dom', 'react', 'node'],
            'machine learning': ['model', 'training', 'feature', 'prediction', 'classification', 'regression', 'neural', 'accuracy'],
            'statistics': ['mean', 'median', 'variance', 'distribution', 'hypothesis', 'correlation', 'regression', 'sample'],
            'infrastructure': ['server', 'deployment', 'container', 'kubernetes', 'docker', 'cloud', 'terraform', 'automation'],
            'ui development': ['component', 'responsive', 'css', 'layout', 'accessibility', 'performance', 'render', 'state']
        };

        // Find matching category keywords
        for (const [key, keywords] of Object.entries(categoryKeywordMap)) {
            if (categoryLower.includes(key) || key.includes(categoryLower)) {
                return keywords;
            }
        }

        // Default to general technical keywords
        return this.TECHNICAL_KEYWORDS.slice(0, 10);
    }
}
