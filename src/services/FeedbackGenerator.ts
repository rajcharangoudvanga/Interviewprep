import {
    SessionState,
    FeedbackReport,
    ScoringRubric,
    CommunicationScore,
    TechnicalScore,
    OverallScore,
    Improvement,
    QuestionFeedback,
    CandidateResponse,
    ResponseEvaluation,
    InterviewQuestion,
    AlignmentFeedback,
    ResumeAnalysis,
    JobRole,
    ExperienceLevel,
    Skill
} from '../models/types';

/**
 * FeedbackGenerator produces comprehensive feedback reports with scoring rubrics
 * based on interview performance across communication and technical dimensions
 */
export class FeedbackGenerator {
    // Default weights for overall score calculation
    private readonly DEFAULT_COMMUNICATION_WEIGHT = 0.4;
    private readonly DEFAULT_TECHNICAL_WEIGHT = 0.6;

    // Grade thresholds (percentage)
    private readonly GRADE_A_THRESHOLD = 90;
    private readonly GRADE_B_THRESHOLD = 80;
    private readonly GRADE_C_THRESHOLD = 70;
    private readonly GRADE_D_THRESHOLD = 60;

    /**
     * Generate comprehensive feedback report for a completed interview session
     * @param session - The completed session state
     * @returns FeedbackReport with scores, strengths, and improvements
     */
    generateFeedback(session: SessionState): FeedbackReport {
        // Extract responses and evaluations
        const responses = Array.from(session.responses.values());
        const evaluations = Array.from(session.evaluations.values());

        // Calculate communication score
        const communicationScore = this.scoreCommunication(responses, evaluations);

        // Calculate technical score
        const technicalScore = this.scoreTechnicalFit(
            responses,
            evaluations,
            session.role,
            session.experienceLevel
        );

        // Calculate overall score
        const overallScore = this.calculateOverallScore(communicationScore, technicalScore);

        // Create scoring rubric
        const scores: ScoringRubric = {
            communication: communicationScore,
            technicalFit: technicalScore,
            overall: overallScore
        };

        // Identify strengths
        const strengths = this.identifyStrengths(scores, evaluations);

        // Generate improvements
        const improvements = this.generateImprovements(session, scores, evaluations);

        // Generate question breakdown
        const questionBreakdown = this.generateQuestionBreakdown(
            session.questions,
            responses,
            evaluations
        );

        // Evaluate resume alignment if resume was provided
        let resumeAlignment: AlignmentFeedback | undefined;
        if (session.resumeAnalysis) {
            resumeAlignment = this.evaluateResumeAlignment(
                session.resumeAnalysis,
                evaluations,
                responses
            );
        }

        // Generate summary
        const summary = this.generateSummary(scores, strengths, improvements, session);

        return {
            sessionId: session.sessionId,
            scores,
            strengths,
            improvements,
            resumeAlignment,
            questionBreakdown,
            summary
        };
    }

    /**
     * Score communication quality across multiple dimensions
     * @param responses - All candidate responses
     * @param evaluations - All response evaluations
     * @returns CommunicationScore with component scores and grade
     */
    scoreCommunication(
        responses: CandidateResponse[],
        evaluations: ResponseEvaluation[]
    ): CommunicationScore {
        if (responses.length === 0) {
            return this.createEmptyCommunicationScore();
        }

        // Calculate clarity score (average of clarity scores from evaluations)
        const clarity = this.calculateAverageScore(
            evaluations.map(e => e.clarityScore)
        );

        // Calculate articulation (based on word choice and expression quality)
        const articulation = this.assessArticulation(responses);

        // Calculate structure (based on organization and flow)
        const structure = this.assessStructure(responses);

        // Calculate professionalism (based on tone and appropriateness)
        const professionalism = this.assessProfessionalism(responses);

        // Calculate total (sum of components, max 40)
        const total = clarity + articulation + structure + professionalism;

        // Assign grade based on percentage
        const percentage = (total / 40) * 100;
        const grade = this.assignGrade(percentage);

        return {
            clarity,
            articulation,
            structure,
            professionalism,
            total,
            grade
        };
    }

    /**
     * Score technical fit across multiple dimensions
     * @param responses - All candidate responses
     * @param evaluations - All response evaluations
     * @param role - Job role being interviewed for
     * @param level - Experience level
     * @returns TechnicalScore with component scores and grade
     */
    scoreTechnicalFit(
        responses: CandidateResponse[],
        evaluations: ResponseEvaluation[],
        role: JobRole,
        _level: ExperienceLevel
    ): TechnicalScore {
        if (responses.length === 0) {
            return this.createEmptyTechnicalScore();
        }

        // Calculate depth (average of depth scores from evaluations)
        const depth = this.calculateAverageScore(
            evaluations.map(e => e.depthScore)
        );

        // Calculate accuracy (average of technical accuracy where available)
        const accuracy = this.calculateTechnicalAccuracy(evaluations);

        // Calculate relevance (how well responses align with role requirements)
        const relevance = this.assessRelevance(responses, role);

        // Calculate problem-solving (based on completeness and approach quality)
        const problemSolving = this.calculateAverageScore(
            evaluations.map(e => e.completenessScore)
        );

        // Calculate total (sum of components, max 40)
        const total = depth + accuracy + relevance + problemSolving;

        // Assign grade based on percentage
        const percentage = (total / 40) * 100;
        const grade = this.assignGrade(percentage);

        return {
            depth,
            accuracy,
            relevance,
            problemSolving,
            total,
            grade
        };
    }

    /**
     * Calculate overall weighted score from component scores
     * @param communication - Communication score
     * @param technical - Technical score
     * @returns OverallScore with weighted total and grade
     */
    calculateOverallScore(
        communication: CommunicationScore,
        technical: TechnicalScore
    ): OverallScore {
        const communicationWeight = this.DEFAULT_COMMUNICATION_WEIGHT;
        const technicalWeight = this.DEFAULT_TECHNICAL_WEIGHT;

        // Convert component totals to percentages
        const commPercentage = (communication.total / 40) * 100;
        const techPercentage = (technical.total / 40) * 100;

        // Calculate weighted total
        const weightedTotal =
            (commPercentage * communicationWeight) +
            (techPercentage * technicalWeight);

        // Assign grade
        const grade = this.assignGrade(weightedTotal);

        return {
            communicationWeight,
            technicalWeight,
            weightedTotal,
            grade
        };
    }

    /**
     * Generate improvement suggestions based on weak areas
     * @param session - Session state
     * @param scores - Scoring rubric
     * @param evaluations - Response evaluations
     * @returns Array of improvement suggestions
     */
    generateImprovements(
        session: SessionState,
        scores: ScoringRubric,
        evaluations: ResponseEvaluation[]
    ): Improvement[] {
        const improvements: Improvement[] = [];

        // Check communication components
        if (scores.communication.clarity < 7) {
            improvements.push({
                category: 'Communication - Clarity',
                observation: 'Responses could be clearer and more direct',
                suggestion: 'Structure your answers with clear topic sentences and logical flow. Use transition words to connect ideas.',
                priority: 'high'
            });
        }

        if (scores.communication.articulation < 7) {
            improvements.push({
                category: 'Communication - Articulation',
                observation: 'Word choice and expression could be more precise',
                suggestion: 'Use specific technical terminology where appropriate. Practice explaining complex concepts in simple terms.',
                priority: 'medium'
            });
        }

        if (scores.communication.structure < 7) {
            improvements.push({
                category: 'Communication - Structure',
                observation: 'Responses lack consistent organization',
                suggestion: 'Use frameworks like STAR (Situation, Task, Action, Result) for behavioral questions. For technical questions, state the problem, explain your approach, then discuss the solution.',
                priority: 'high'
            });
        }

        if (scores.communication.professionalism < 7) {
            improvements.push({
                category: 'Communication - Professionalism',
                observation: 'Tone or language could be more professional',
                suggestion: 'Maintain a professional tone throughout. Avoid casual language and ensure responses are appropriate for a formal interview setting.',
                priority: 'medium'
            });
        }

        // Check technical components
        if (scores.technicalFit.depth < 7) {
            improvements.push({
                category: 'Technical - Depth',
                observation: 'Responses lack sufficient technical depth',
                suggestion: 'Provide more detailed explanations of technical concepts. Discuss trade-offs, alternatives, and implementation details.',
                priority: 'high'
            });
        }

        if (scores.technicalFit.accuracy < 7) {
            improvements.push({
                category: 'Technical - Accuracy',
                observation: 'Technical accuracy needs improvement',
                suggestion: 'Review fundamental concepts for your role. Use precise technical terminology and ensure your explanations are technically sound.',
                priority: 'high'
            });
        }

        if (scores.technicalFit.relevance < 7) {
            improvements.push({
                category: 'Technical - Relevance',
                observation: 'Responses could be more relevant to the role',
                suggestion: `Focus on skills and experiences directly related to ${session.role.name}. Highlight relevant technologies and methodologies.`,
                priority: 'medium'
            });
        }

        if (scores.technicalFit.problemSolving < 7) {
            improvements.push({
                category: 'Technical - Problem Solving',
                observation: 'Problem-solving approach could be more comprehensive',
                suggestion: 'Walk through your thought process step-by-step. Discuss how you identify problems, evaluate options, and implement solutions.',
                priority: 'high'
            });
        }

        // Check for follow-up patterns
        const followUpCount = evaluations.filter(e => e.needsFollowUp).length;
        const followUpRatio = followUpCount / Math.max(evaluations.length, 1);

        if (followUpRatio > 0.5) {
            improvements.push({
                category: 'Response Completeness',
                observation: 'Many responses required follow-up questions',
                suggestion: 'Provide more complete initial answers. Anticipate what the interviewer might want to know and address it proactively.',
                priority: 'high'
            });
        }

        return improvements;
    }

    /**
     * Identify strengths from high-scoring areas
     * @param scores - Scoring rubric
     * @param evaluations - Response evaluations
     * @returns Array of strength descriptions
     */
    private identifyStrengths(
        scores: ScoringRubric,
        evaluations: ResponseEvaluation[]
    ): string[] {
        const strengths: string[] = [];

        // Check communication strengths (score >= 8)
        if (scores.communication.clarity >= 8) {
            strengths.push('Clear and direct communication style');
        }

        if (scores.communication.articulation >= 8) {
            strengths.push('Strong articulation and word choice');
        }

        if (scores.communication.structure >= 8) {
            strengths.push('Well-structured and organized responses');
        }

        if (scores.communication.professionalism >= 8) {
            strengths.push('Professional and appropriate tone throughout');
        }

        // Check technical strengths
        if (scores.technicalFit.depth >= 8) {
            strengths.push('Demonstrated deep technical knowledge');
        }

        if (scores.technicalFit.accuracy >= 8) {
            strengths.push('Technically accurate and precise explanations');
        }

        if (scores.technicalFit.relevance >= 8) {
            strengths.push('Highly relevant experience and skills for the role');
        }

        if (scores.technicalFit.problemSolving >= 8) {
            strengths.push('Strong problem-solving and analytical skills');
        }

        // Check for consistent high performance
        const highScoreCount = evaluations.filter(e =>
            e.depthScore >= 8 && e.clarityScore >= 8 && e.completenessScore >= 8
        ).length;

        if (highScoreCount >= evaluations.length * 0.7) {
            strengths.push('Consistently strong performance across all questions');
        }

        // Check for minimal follow-ups needed
        const followUpCount = evaluations.filter(e => e.needsFollowUp).length;
        if (followUpCount <= evaluations.length * 0.2) {
            strengths.push('Provided complete answers with minimal need for follow-up');
        }

        // If no specific strengths identified, add a general one
        if (strengths.length === 0 && scores.overall.weightedTotal >= 70) {
            strengths.push('Solid overall interview performance');
        }

        return strengths;
    }

    /**
     * Evaluate resume alignment with interview performance
     * Compares what was claimed on the resume with what was demonstrated in the interview
     * @param resumeAnalysis - Resume analysis from session
     * @param evaluations - Response evaluations
     * @param responses - Candidate responses
     * @returns AlignmentFeedback with matched/missing skills and actionable suggestions
     */
    evaluateResumeAlignment(
        resumeAnalysis: ResumeAnalysis,
        evaluations: ResponseEvaluation[],
        responses: CandidateResponse[]
    ): AlignmentFeedback {
        // Use the alignment score from resume analysis as baseline
        const alignmentScore = resumeAnalysis.alignmentScore.overall;

        // Matched skills: those from resume that were demonstrated in interview
        const matchedSkills = this.identifyMatchedSkills(
            resumeAnalysis.technicalSkills,
            responses,
            evaluations
        );

        // Unverified skills: claimed on resume but not demonstrated in interview
        const unverifiedSkills = resumeAnalysis.technicalSkills.filter(skill =>
            !matchedSkills.some(matched => matched.name === skill.name)
        );

        // Missing skills: gaps identified in resume analysis
        const missingSkills = resumeAnalysis.gaps.map(gap => ({
            name: gap.skill,
            category: 'missing',
            proficiency: undefined
        }));

        // Experience gaps from resume analysis
        const experienceGaps = this.identifyExperienceGaps(
            resumeAnalysis,
            evaluations,
            responses
        );

        // Generate actionable suggestions based on analysis
        const suggestions = this.generateResumeImprovementSuggestions(
            alignmentScore,
            matchedSkills,
            unverifiedSkills,
            missingSkills,
            experienceGaps,
            evaluations
        );

        return {
            alignmentScore,
            matchedSkills,
            missingSkills,
            experienceGaps,
            suggestions
        };
    }

    /**
     * Identify skills from resume that were demonstrated in interview responses
     * @private
     */
    private identifyMatchedSkills(
        resumeSkills: Skill[],
        responses: CandidateResponse[],
        evaluations: ResponseEvaluation[]
    ): Skill[] {
        const matchedSkills: Skill[] = [];

        for (const skill of resumeSkills) {
            // Check if skill was mentioned in responses
            const mentionedInResponses = responses.some(response =>
                response.text.toLowerCase().includes(skill.name.toLowerCase())
            );

            if (mentionedInResponses) {
                // Find responses that mention this skill
                const relevantResponses = responses.filter(response =>
                    response.text.toLowerCase().includes(skill.name.toLowerCase())
                );

                // Check if those responses had good evaluations (demonstrates competency)
                const relevantEvaluations = relevantResponses
                    .map(r => evaluations.find(e => e.questionId === r.questionId))
                    .filter(e => e !== undefined) as ResponseEvaluation[];

                // Consider skill "matched" if mentioned and responses were of decent quality
                const avgDepth = relevantEvaluations.length > 0
                    ? relevantEvaluations.reduce((sum, e) => sum + e.depthScore, 0) / relevantEvaluations.length
                    : 0;

                // Only count as matched if demonstrated with reasonable depth (>= 5)
                if (avgDepth >= 5) {
                    matchedSkills.push(skill);
                }
            }
        }

        return matchedSkills;
    }

    /**
     * Identify experience gaps based on interview performance
     * @private
     */
    private identifyExperienceGaps(
        resumeAnalysis: ResumeAnalysis,
        evaluations: ResponseEvaluation[],
        _responses: CandidateResponse[]
    ): string[] {
        const gaps: string[] = [];

        // Add gaps from resume analysis (high importance ones)
        const highImportanceGaps = resumeAnalysis.gaps
            .filter(gap => gap.importance >= 7)
            .map(gap => gap.suggestion);

        gaps.push(...highImportanceGaps);

        // Identify gaps based on interview performance
        const avgTechnicalAccuracy = evaluations
            .filter(e => e.technicalAccuracy !== undefined)
            .reduce((sum, e) => sum + (e.technicalAccuracy || 0), 0) / Math.max(evaluations.length, 1);

        if (avgTechnicalAccuracy < 6) {
            gaps.push('Interview responses suggest technical knowledge may be less deep than resume indicates. Consider strengthening practical experience.');
        }

        // Check for completeness issues
        const avgCompleteness = evaluations.reduce((sum, e) => sum + e.completenessScore, 0) / Math.max(evaluations.length, 1);

        if (avgCompleteness < 6) {
            gaps.push('Responses lacked completeness, suggesting resume may overstate breadth of experience. Focus on depth over breadth.');
        }

        return gaps;
    }

    /**
     * Generate actionable suggestions for resume improvement
     * @private
     */
    private generateResumeImprovementSuggestions(
        alignmentScore: number,
        matchedSkills: Skill[],
        unverifiedSkills: Skill[],
        missingSkills: Skill[],
        experienceGaps: string[],
        evaluations: ResponseEvaluation[]
    ): string[] {
        const suggestions: string[] = [];

        // Suggestions based on alignment score
        if (alignmentScore < 50) {
            suggestions.push('Your resume shows limited alignment with this role. Consider tailoring your resume to highlight relevant experience and skills for this position.');
        } else if (alignmentScore < 70) {
            suggestions.push('Your resume has moderate alignment with this role. Focus on emphasizing relevant technical skills and projects that match the job requirements.');
        }

        // Suggestions for matched skills
        if (matchedSkills.length > 0) {
            const topMatchedSkills = matchedSkills.slice(0, 3).map(s => s.name).join(', ');
            suggestions.push(`You successfully demonstrated ${matchedSkills.length} skill(s) from your resume (${topMatchedSkills}). Make sure these are prominently featured.`);
        }

        // Suggestions for unverified skills
        if (unverifiedSkills.length > 0) {
            const unverifiedNames = unverifiedSkills.slice(0, 3).map(s => s.name).join(', ');
            suggestions.push(`Skills listed on resume but not demonstrated in interview: ${unverifiedNames}. Either remove these or be prepared to discuss them in detail.`);
        }

        // Suggestions for missing skills
        if (missingSkills.length > 0) {
            const criticalMissing = missingSkills.slice(0, 3).map(s => s.name).join(', ');
            suggestions.push(`Key skills missing from your resume: ${criticalMissing}. Consider gaining experience in these areas or adding them if you have relevant experience.`);
        }

        // Suggestions based on interview performance
        const avgDepth = evaluations.reduce((sum, e) => sum + e.depthScore, 0) / Math.max(evaluations.length, 1);

        if (avgDepth < 6) {
            suggestions.push('Your interview responses lacked technical depth. Ensure your resume includes specific examples, metrics, and outcomes that demonstrate deep expertise.');
        } else if (avgDepth >= 8) {
            suggestions.push('You demonstrated strong technical depth in the interview. Make sure your resume reflects this expertise with detailed project descriptions and quantifiable achievements.');
        }

        // Suggestions based on experience gaps
        if (experienceGaps.length > 0) {
            // Add the most critical gap as a suggestion
            suggestions.push(experienceGaps[0]);
        }

        // General best practices
        if (suggestions.length < 3) {
            suggestions.push('Include specific metrics and outcomes from your projects and experiences (e.g., "Improved performance by 40%", "Led team of 5 engineers").');
            suggestions.push('Use action verbs and technical terminology that matches the job description to improve ATS compatibility.');
        }

        return suggestions;
    }

    /**
     * Generate detailed feedback for each question
     * @private
     */
    private generateQuestionBreakdown(
        questions: InterviewQuestion[],
        responses: CandidateResponse[],
        evaluations: ResponseEvaluation[]
    ): QuestionFeedback[] {
        const breakdown: QuestionFeedback[] = [];

        // Create a map for quick lookup
        const responseMap = new Map(responses.map(r => [r.questionId, r]));
        const evaluationMap = new Map(evaluations.map(e => [e.questionId, e]));

        for (const question of questions) {
            const response = responseMap.get(question.id);
            const evaluation = evaluationMap.get(question.id);

            if (response && evaluation) {
                const feedback = this.generateQuestionFeedback(question, response, evaluation);
                breakdown.push({
                    questionId: question.id,
                    question: question.text,
                    response: response.text,
                    evaluation,
                    feedback
                });
            }
        }

        return breakdown;
    }

    /**
     * Generate feedback text for a single question
     * @private
     */
    private generateQuestionFeedback(
        _question: InterviewQuestion,
        _response: CandidateResponse,
        evaluation: ResponseEvaluation
    ): string {
        const parts: string[] = [];

        // Overall assessment
        const avgScore = (evaluation.depthScore + evaluation.clarityScore + evaluation.completenessScore) / 3;
        if (avgScore >= 8) {
            parts.push('Strong response.');
        } else if (avgScore >= 6) {
            parts.push('Good response.');
        } else {
            parts.push('Response needs improvement.');
        }

        // Specific feedback
        if (evaluation.depthScore < 6) {
            parts.push('Consider providing more technical depth and detail.');
        }

        if (evaluation.clarityScore < 6) {
            parts.push('Work on making your explanation clearer and more structured.');
        }

        if (evaluation.completenessScore < 6) {
            parts.push('Address all aspects of the question more thoroughly.');
        }

        if (evaluation.technicalAccuracy !== undefined && evaluation.technicalAccuracy < 6) {
            parts.push('Review the technical concepts to ensure accuracy.');
        }

        // Positive feedback
        if (evaluation.depthScore >= 8) {
            parts.push('Excellent technical depth demonstrated.');
        }

        if (evaluation.clarityScore >= 8) {
            parts.push('Very clear and well-articulated response.');
        }

        return parts.join(' ');
    }

    /**
     * Generate overall summary of interview performance
     * @private
     */
    private generateSummary(
        scores: ScoringRubric,
        strengths: string[],
        improvements: Improvement[],
        _session: SessionState
    ): string {
        const parts: string[] = [];

        // Opening statement
        const grade = scores.overall.grade;
        const score = scores.overall.weightedTotal.toFixed(1);

        parts.push(`Overall Performance: ${grade} (${score}/100)`);
        parts.push('');

        // Summary based on grade
        if (grade === 'A') {
            parts.push('Excellent interview performance! You demonstrated strong technical knowledge and communication skills.');
        } else if (grade === 'B') {
            parts.push('Good interview performance. You showed solid understanding with room for some refinement.');
        } else if (grade === 'C') {
            parts.push('Satisfactory interview performance. Focus on the improvement areas to strengthen your candidacy.');
        } else if (grade === 'D') {
            parts.push('Interview performance needs improvement. Review the feedback carefully and practice the suggested areas.');
        } else {
            parts.push('Interview performance requires significant improvement. Consider additional preparation and practice.');
        }

        parts.push('');

        // Key strengths
        if (strengths.length > 0) {
            parts.push('Key Strengths:');
            strengths.slice(0, 3).forEach(strength => {
                parts.push(`• ${strength}`);
            });
            parts.push('');
        }

        // Priority improvements
        const highPriorityImprovements = improvements.filter(i => i.priority === 'high');
        if (highPriorityImprovements.length > 0) {
            parts.push('Priority Areas for Improvement:');
            highPriorityImprovements.slice(0, 3).forEach(improvement => {
                parts.push(`• ${improvement.category}: ${improvement.suggestion}`);
            });
        }

        return parts.join('\n');
    }

    // Helper methods

    /**
     * Calculate average score from array of scores
     * @private
     */
    private calculateAverageScore(scores: number[]): number {
        if (scores.length === 0) return 0;
        const sum = scores.reduce((acc, score) => acc + score, 0);
        return sum / scores.length;
    }

    /**
     * Assess articulation quality
     * @private
     */
    private assessArticulation(responses: CandidateResponse[]): number {
        let totalScore = 0;

        for (const response of responses) {
            const text = response.text.toLowerCase();
            let score = 5; // baseline

            // Check for varied vocabulary
            const uniqueWords = new Set(text.split(/\s+/));
            const vocabularyRatio = uniqueWords.size / response.wordCount;

            if (vocabularyRatio > 0.7) {
                score += 2; // Rich vocabulary
            } else if (vocabularyRatio > 0.5) {
                score += 1;
            }

            // Check for technical precision
            const technicalTerms = ['implement', 'design', 'optimize', 'analyze', 'evaluate', 'develop'];
            const hasTechnicalTerms = technicalTerms.some(term => text.includes(term));
            if (hasTechnicalTerms) {
                score += 2;
            }

            // Check for filler words (negative indicator)
            const fillerWords = ['um', 'uh', 'like', 'you know', 'basically', 'actually'];
            const fillerCount = fillerWords.filter(filler => text.includes(filler)).length;
            if (fillerCount > 3) {
                score -= 1;
            }

            totalScore += Math.min(Math.max(score, 0), 10);
        }

        return totalScore / responses.length;
    }

    /**
     * Assess structure quality
     * @private
     */
    private assessStructure(responses: CandidateResponse[]): number {
        let totalScore = 0;

        for (const response of responses) {
            const text = response.text.toLowerCase();
            let score = 5; // baseline

            // Check for logical connectors
            const connectors = ['first', 'second', 'then', 'finally', 'because', 'therefore', 'however'];
            const connectorCount = connectors.filter(conn => text.includes(conn)).length;

            if (connectorCount >= 3) {
                score += 3;
            } else if (connectorCount >= 2) {
                score += 2;
            } else if (connectorCount >= 1) {
                score += 1;
            }

            // Check for paragraph-like structure (multiple sentences)
            const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
            if (sentences.length >= 4) {
                score += 2;
            } else if (sentences.length >= 2) {
                score += 1;
            }

            totalScore += Math.min(Math.max(score, 0), 10);
        }

        return totalScore / responses.length;
    }

    /**
     * Assess professionalism
     * @private
     */
    private assessProfessionalism(responses: CandidateResponse[]): number {
        let totalScore = 0;

        for (const response of responses) {
            const text = response.text.toLowerCase();
            let score = 8; // Start high, deduct for issues

            // Check for unprofessional language
            const casualPhrases = ['gonna', 'wanna', 'kinda', 'sorta', 'yeah', 'nope'];
            const casualCount = casualPhrases.filter(phrase => text.includes(phrase)).length;
            score -= casualCount;

            // Check for appropriate length (not too short)
            if (response.wordCount < 15) {
                score -= 2; // Too brief
            }

            // Check for complete sentences
            const hasProperCapitalization = /[A-Z]/.test(response.text);
            if (!hasProperCapitalization && response.wordCount > 10) {
                score -= 1;
            }

            totalScore += Math.min(Math.max(score, 0), 10);
        }

        return totalScore / responses.length;
    }

    /**
     * Calculate technical accuracy from evaluations
     * @private
     */
    private calculateTechnicalAccuracy(evaluations: ResponseEvaluation[]): number {
        const technicalScores = evaluations
            .filter(e => e.technicalAccuracy !== undefined)
            .map(e => e.technicalAccuracy!);

        if (technicalScores.length === 0) {
            // If no technical questions, use depth as proxy
            return this.calculateAverageScore(evaluations.map(e => e.depthScore));
        }

        return this.calculateAverageScore(technicalScores);
    }

    /**
     * Assess relevance to job role
     * @private
     */
    private assessRelevance(responses: CandidateResponse[], role: JobRole): number {
        let totalScore = 0;

        for (const response of responses) {
            const text = response.text.toLowerCase();
            let score = 5; // baseline

            // Check for role-specific skills
            const mentionedSkills = role.technicalSkills.filter(skill =>
                text.includes(skill.toLowerCase())
            );

            score += Math.min(mentionedSkills.length, 3);

            // Check for role-specific competencies
            const mentionedCompetencies = role.behavioralCompetencies.filter(comp =>
                text.includes(comp.toLowerCase())
            );

            score += Math.min(mentionedCompetencies.length, 2);

            totalScore += Math.min(Math.max(score, 0), 10);
        }

        return totalScore / responses.length;
    }

    /**
     * Assign letter grade based on percentage
     * @private
     */
    private assignGrade(percentage: number): 'A' | 'B' | 'C' | 'D' | 'F' {
        if (percentage >= this.GRADE_A_THRESHOLD) return 'A';
        if (percentage >= this.GRADE_B_THRESHOLD) return 'B';
        if (percentage >= this.GRADE_C_THRESHOLD) return 'C';
        if (percentage >= this.GRADE_D_THRESHOLD) return 'D';
        return 'F';
    }

    /**
     * Create empty communication score (for edge cases)
     * @private
     */
    private createEmptyCommunicationScore(): CommunicationScore {
        return {
            clarity: 0,
            articulation: 0,
            structure: 0,
            professionalism: 0,
            total: 0,
            grade: 'F'
        };
    }

    /**
     * Create empty technical score (for edge cases)
     * @private
     */
    private createEmptyTechnicalScore(): TechnicalScore {
        return {
            depth: 0,
            accuracy: 0,
            relevance: 0,
            problemSolving: 0,
            total: 0,
            grade: 'F'
        };
    }
}
