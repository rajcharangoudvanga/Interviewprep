import * as fc from 'fast-check';
import {
    JobRole,
    ExperienceLevel,
    ResumeDocument,
    ParsedResume,
    Skill,
    WorkExperience,
    Project,
    Achievement,
    Strength,
    Gap,
    AlignmentScore,
    ResumeAnalysis,
    InterviewQuestion,
    CandidateResponse,
    ResponseEvaluation,
    SessionState,
    BehaviorType,
    SessionStatus,
    InteractionModeType,
    QuestionId,
    SessionId,
    QuestionCategory,
    ResumeReference
} from '../models/types';

/**
 * Test data generators for property-based testing using fast-check
 * These generators produce valid, realistic test data for all core types
 */

// ============================================================================
// Basic Generators
// ============================================================================

export const arbSessionId = (): fc.Arbitrary<SessionId> =>
    fc.uuid().map(uuid => `session-${uuid}`);

export const arbQuestionId = (): fc.Arbitrary<QuestionId> =>
    fc.uuid().map(uuid => `q-${uuid}`);

export const arbTimestamp = (): fc.Arbitrary<number> =>
    fc.integer({ min: 1600000000000, max: Date.now() });

export const arbBehaviorType = (): fc.Arbitrary<BehaviorType> =>
    fc.constantFrom<BehaviorType>('confused', 'efficient', 'chatty', 'edge-case', 'standard');

export const arbSessionStatus = (): fc.Arbitrary<SessionStatus> =>
    fc.constantFrom<SessionStatus>('initialized', 'in-progress', 'completed', 'ended-early');

export const arbInteractionMode = (): fc.Arbitrary<InteractionModeType> =>
    fc.constantFrom<InteractionModeType>('voice', 'text');

// ============================================================================
// Job Role and Experience Level Generators
// ============================================================================

export const arbQuestionCategory = (): fc.Arbitrary<QuestionCategory> =>
    fc.record({
        name: fc.constantFrom(
            'Data Structures',
            'Algorithms',
            'System Design',
            'Coding',
            'Problem Solving',
            'Product Strategy',
            'Analytics',
            'Machine Learning',
            'Statistics',
            'JavaScript',
            'UI Development',
            'Design & UX',
            'API Development',
            'Database',
            'Infrastructure',
            'Automation',
            'Troubleshooting',
            'Collaboration',
            'Learning Agility',
            'Decision Making',
            'Adaptability'
        ),
        weight: fc.double({ min: 0.1, max: 1.0, noNaN: true }),
        technicalFocus: fc.boolean()
    });

export const arbJobRole = (): fc.Arbitrary<JobRole> =>
    fc.oneof(
        fc.constant({
            id: 'software-engineer',
            name: 'Software Engineer',
            technicalSkills: ['JavaScript', 'Python', 'Java', 'Data Structures', 'Algorithms', 'System Design'],
            behavioralCompetencies: ['Problem Solving', 'Collaboration', 'Communication', 'Learning Agility'],
            questionCategories: [
                { name: 'Data Structures', weight: 0.3, technicalFocus: true },
                { name: 'Algorithms', weight: 0.3, technicalFocus: true },
                { name: 'System Design', weight: 0.2, technicalFocus: true },
                { name: 'Collaboration', weight: 0.2, technicalFocus: false }
            ]
        }),
        fc.constant({
            id: 'product-manager',
            name: 'Product Manager',
            technicalSkills: ['Product Strategy', 'Analytics', 'User Research', 'Roadmapping'],
            behavioralCompetencies: ['Leadership', 'Communication', 'Strategic Thinking', 'Stakeholder Management'],
            questionCategories: [
                { name: 'Product Strategy', weight: 0.4, technicalFocus: true },
                { name: 'Analytics', weight: 0.3, technicalFocus: true },
                { name: 'Leadership', weight: 0.3, technicalFocus: false }
            ]
        }),
        fc.constant({
            id: 'data-scientist',
            name: 'Data Scientist',
            technicalSkills: ['Machine Learning', 'Statistics', 'Python', 'SQL', 'Data Analysis'],
            behavioralCompetencies: ['Analytical Thinking', 'Communication', 'Problem Solving', 'Collaboration'],
            questionCategories: [
                { name: 'Machine Learning', weight: 0.4, technicalFocus: true },
                { name: 'Statistics', weight: 0.3, technicalFocus: true },
                { name: 'Analytical Thinking', weight: 0.3, technicalFocus: false }
            ]
        }),
        fc.constant({
            id: 'frontend-engineer',
            name: 'Frontend Engineer',
            technicalSkills: ['React', 'JavaScript', 'CSS', 'HTML', 'UI/UX', 'Accessibility'],
            behavioralCompetencies: ['Attention to Detail', 'Collaboration', 'User Empathy', 'Problem Solving'],
            questionCategories: [
                { name: 'JavaScript', weight: 0.3, technicalFocus: true },
                { name: 'UI Development', weight: 0.4, technicalFocus: true },
                { name: 'Design & UX', weight: 0.3, technicalFocus: false }
            ]
        }),
        fc.constant({
            id: 'backend-engineer',
            name: 'Backend Engineer',
            technicalSkills: ['API Development', 'Database', 'System Design', 'Security', 'Performance'],
            behavioralCompetencies: ['Problem Solving', 'Collaboration', 'Reliability', 'Communication'],
            questionCategories: [
                { name: 'API Development', weight: 0.3, technicalFocus: true },
                { name: 'Database', weight: 0.3, technicalFocus: true },
                { name: 'System Design', weight: 0.4, technicalFocus: true }
            ]
        }),
        fc.constant({
            id: 'devops-engineer',
            name: 'DevOps Engineer',
            technicalSkills: ['Infrastructure', 'Automation', 'CI/CD', 'Monitoring', 'Cloud Platforms'],
            behavioralCompetencies: ['Problem Solving', 'Collaboration', 'Reliability', 'Continuous Improvement'],
            questionCategories: [
                { name: 'Infrastructure', weight: 0.4, technicalFocus: true },
                { name: 'Automation', weight: 0.3, technicalFocus: true },
                { name: 'Troubleshooting', weight: 0.3, technicalFocus: true }
            ]
        })
    );

export const arbExperienceLevel = (): fc.Arbitrary<ExperienceLevel> =>
    fc.oneof(
        fc.constant({
            level: 'entry' as const,
            yearsMin: 0,
            yearsMax: 2,
            expectedDepth: 4
        }),
        fc.constant({
            level: 'mid' as const,
            yearsMin: 2,
            yearsMax: 5,
            expectedDepth: 6
        }),
        fc.constant({
            level: 'senior' as const,
            yearsMin: 5,
            yearsMax: 10,
            expectedDepth: 8
        }),
        fc.constant({
            level: 'lead' as const,
            yearsMin: 10,
            yearsMax: 20,
            expectedDepth: 9
        })
    );

// ============================================================================
// Resume Generators
// ============================================================================

export const arbSkill = (): fc.Arbitrary<Skill> =>
    fc.record({
        name: fc.constantFrom(
            'JavaScript', 'Python', 'Java', 'React', 'Node.js', 'SQL', 'AWS',
            'Docker', 'Kubernetes', 'Machine Learning', 'Data Analysis', 'API Design',
            'System Design', 'Agile', 'Leadership', 'Communication'
        ),
        category: fc.constantFrom('Programming', 'Framework', 'Cloud', 'Soft Skills', 'Tools'),
        proficiency: fc.option(fc.constantFrom('Beginner', 'Intermediate', 'Advanced', 'Expert'), { nil: undefined })
    });

export const arbWorkExperience = (): fc.Arbitrary<WorkExperience> =>
    fc.record({
        company: fc.constantFrom('TechCorp', 'DataSystems Inc', 'CloudSolutions', 'StartupXYZ', 'Enterprise Co'),
        title: fc.constantFrom('Software Engineer', 'Senior Developer', 'Tech Lead', 'Product Manager', 'Data Scientist'),
        duration: fc.constantFrom('2020-2023', '2019-2021', '2021-Present', '2018-2020', '1 year', '2 years'),
        description: fc.string({ minLength: 20, maxLength: 100 }),
        technologies: fc.option(
            fc.array(fc.constantFrom('React', 'Python', 'AWS', 'Docker', 'PostgreSQL'), { minLength: 1, maxLength: 5 }),
            { nil: undefined }
        )
    });

export const arbProject = (): fc.Arbitrary<Project> =>
    fc.record({
        name: fc.constantFrom('E-commerce Platform', 'Data Pipeline', 'Mobile App', 'Analytics Dashboard', 'API Gateway'),
        description: fc.string({ minLength: 20, maxLength: 100 }),
        technologies: fc.array(fc.constantFrom('React', 'Node.js', 'Python', 'AWS', 'MongoDB'), { minLength: 1, maxLength: 4 }),
        role: fc.option(fc.constantFrom('Lead Developer', 'Contributor', 'Architect', 'Team Member'), { nil: undefined })
    });

export const arbAchievement = (): fc.Arbitrary<Achievement> =>
    fc.record({
        description: fc.string({ minLength: 10, maxLength: 50 }),
        impact: fc.option(fc.constantFrom('Increased performance by 50%', 'Reduced costs by 30%', 'Improved user satisfaction'), { nil: undefined }),
        context: fc.option(fc.constantFrom('Team project', 'Individual contribution', 'Cross-functional initiative'), { nil: undefined })
    });

export const arbStrength = (): fc.Arbitrary<Strength> =>
    fc.record({
        area: fc.constantFrom('Technical Skills', 'Leadership', 'Problem Solving', 'Communication', 'System Design'),
        evidence: fc.array(fc.string({ minLength: 10, maxLength: 50 }), { minLength: 1, maxLength: 3 }),
        relevance: fc.double({ min: 0, max: 10, noNaN: true })
    });

export const arbGap = (): fc.Arbitrary<Gap> =>
    fc.record({
        skill: fc.constantFrom('Kubernetes', 'Machine Learning', 'GraphQL', 'Microservices', 'Cloud Architecture'),
        importance: fc.double({ min: 0, max: 10, noNaN: true }),
        suggestion: fc.string({ minLength: 10, maxLength: 50 })
    });

export const arbAlignmentScore = (): fc.Arbitrary<AlignmentScore> =>
    fc.record({
        overall: fc.double({ min: 0, max: 100, noNaN: true }),
        technical: fc.double({ min: 0, max: 100, noNaN: true }),
        experience: fc.double({ min: 0, max: 100, noNaN: true }),
        cultural: fc.double({ min: 0, max: 100, noNaN: true })
    });

export const arbParsedResume = (): fc.Arbitrary<ParsedResume> =>
    fc.record({
        rawText: fc.string({ minLength: 100, maxLength: 500 }),
        sections: fc.constant(new Map<string, string>([
            ['summary', 'Experienced software engineer with 5 years of experience'],
            ['experience', 'Software Engineer at TechCorp (2020-2023)'],
            ['education', 'BS Computer Science, University (2016-2020)'],
            ['skills', 'JavaScript, Python, React, Node.js, AWS']
        ])),
        metadata: fc.record({
            parsedAt: arbTimestamp(),
            format: fc.constantFrom('text', 'pdf', 'docx')
        })
    });

export const arbResumeDocument = (): fc.Arbitrary<ResumeDocument> =>
    fc.record({
        content: fc.string({ minLength: 200, maxLength: 1000 }),
        format: fc.constantFrom<'text' | 'pdf' | 'docx'>('text', 'pdf', 'docx'),
        filename: fc.constantFrom('resume.txt', 'resume.pdf', 'resume.docx', 'cv.pdf', 'my_resume.txt')
    });

export const arbResumeAnalysis = (): fc.Arbitrary<ResumeAnalysis> =>
    fc.record({
        parsedResume: arbParsedResume(),
        strengths: fc.array(arbStrength(), { minLength: 1, maxLength: 5 }),
        technicalSkills: fc.array(arbSkill(), { minLength: 1, maxLength: 10 }),
        gaps: fc.array(arbGap(), { minLength: 0, maxLength: 5 }),
        alignmentScore: arbAlignmentScore(),
        summary: fc.string({ minLength: 50, maxLength: 200 })
    });

// ============================================================================
// Interview Question Generators
// ============================================================================

export const arbResumeReference = (): fc.Arbitrary<ResumeReference> =>
    fc.record({
        section: fc.constantFrom('skills', 'experience', 'projects', 'achievements'),
        content: fc.string({ minLength: 10, maxLength: 50 }),
        relevance: fc.string({ minLength: 10, maxLength: 50 })
    });

export const arbInterviewQuestion = (): fc.Arbitrary<InterviewQuestion> =>
    fc.record({
        id: arbQuestionId(),
        type: fc.constantFrom<'technical' | 'behavioral'>('technical', 'behavioral'),
        text: fc.string({ minLength: 20, maxLength: 100 }).map(text => text + '?'),
        category: fc.constantFrom('Data Structures', 'Algorithms', 'System Design', 'Collaboration', 'Leadership'),
        difficulty: fc.integer({ min: 1, max: 10 }),
        resumeContext: fc.option(arbResumeReference(), { nil: undefined }),
        expectedElements: fc.option(
            fc.array(fc.string({ minLength: 5, maxLength: 20 }), { minLength: 1, maxLength: 5 }),
            { nil: undefined }
        ),
        parentQuestionId: fc.option(arbQuestionId(), { nil: undefined }),
        followUpCount: fc.option(fc.integer({ min: 0, max: 2 }), { nil: undefined })
    });

/**
 * Generate a question set with controlled characteristics
 * @param minCount Minimum number of questions (default 5)
 * @param maxCount Maximum number of questions (default 10)
 * @param ensureMix Ensure mix of technical and behavioral (default true)
 */
export const arbQuestionSet = (
    minCount: number = 5,
    maxCount: number = 10,
    ensureMix: boolean = true
): fc.Arbitrary<InterviewQuestion[]> => {
    if (ensureMix) {
        return fc.tuple(
            fc.integer({ min: minCount, max: maxCount }),
            fc.double({ min: 0.4, max: 0.7, noNaN: true })
        ).chain(([count, techRatio]) => {
            const techCount = Math.ceil(count * techRatio);
            const behavioralCount = count - techCount;

            return fc.tuple(
                fc.array(
                    arbInterviewQuestion().map(q => ({ ...q, type: 'technical' as const })),
                    { minLength: techCount, maxLength: techCount }
                ),
                fc.array(
                    arbInterviewQuestion().map(q => ({ ...q, type: 'behavioral' as const })),
                    { minLength: behavioralCount, maxLength: behavioralCount }
                )
            ).map(([tech, behavioral]) => [...tech, ...behavioral]);
        });
    }

    return fc.array(arbInterviewQuestion(), { minLength: minCount, maxLength: maxCount });
};

// ============================================================================
// Candidate Response Generators
// ============================================================================

/**
 * Generate candidate response with controllable characteristics
 * @param minWords Minimum word count (default 10)
 * @param maxWords Maximum word count (default 200)
 */
export const arbCandidateResponse = (
    minWords: number = 10,
    maxWords: number = 200
): fc.Arbitrary<CandidateResponse> =>
    fc.record({
        questionId: arbQuestionId(),
        text: fc.string({ minLength: minWords * 5, maxLength: maxWords * 5 }),
        timestamp: arbTimestamp(),
        wordCount: fc.integer({ min: minWords, max: maxWords }),
        responseTime: fc.integer({ min: 5000, max: 300000 }) // 5 seconds to 5 minutes
    });

/**
 * Generate a short/low-quality response (for testing follow-up logic)
 */
export const arbShortResponse = (): fc.Arbitrary<CandidateResponse> =>
    arbCandidateResponse(1, 20);

/**
 * Generate a detailed/high-quality response
 */
export const arbDetailedResponse = (): fc.Arbitrary<CandidateResponse> =>
    arbCandidateResponse(100, 300);

/**
 * Generate response with technical mentions
 */
export const arbTechnicalResponse = (): fc.Arbitrary<CandidateResponse> =>
    fc.record({
        questionId: arbQuestionId(),
        text: fc.tuple(
            fc.string({ minLength: 50, maxLength: 200 }),
            fc.constantFrom('React', 'Python', 'AWS', 'Docker', 'Kubernetes', 'PostgreSQL', 'GraphQL')
        ).map(([words, tech]) => `${words} using ${tech} and implementing the solution`),
        timestamp: arbTimestamp(),
        wordCount: fc.integer({ min: 30, max: 100 }),
        responseTime: fc.integer({ min: 30000, max: 180000 })
    });

// ============================================================================
// Response Evaluation Generators
// ============================================================================

export const arbResponseEvaluation = (): fc.Arbitrary<ResponseEvaluation> =>
    fc.record({
        questionId: arbQuestionId(),
        depthScore: fc.double({ min: 0, max: 10, noNaN: true }),
        clarityScore: fc.double({ min: 0, max: 10, noNaN: true }),
        completenessScore: fc.double({ min: 0, max: 10, noNaN: true }),
        needsFollowUp: fc.boolean(),
        followUpReason: fc.option(
            fc.constantFrom('insufficient depth', 'unclear explanation', 'incomplete coverage', 'technical detail needed'),
            { nil: undefined }
        ),
        technicalAccuracy: fc.option(fc.double({ min: 0, max: 10, noNaN: true }), { nil: undefined })
    });

/**
 * Generate evaluation that needs follow-up (low scores)
 */
export const arbLowQualityEvaluation = (): fc.Arbitrary<ResponseEvaluation> =>
    fc.record({
        questionId: arbQuestionId(),
        depthScore: fc.double({ min: 0, max: 5, noNaN: true }),
        clarityScore: fc.double({ min: 0, max: 6, noNaN: true }),
        completenessScore: fc.double({ min: 0, max: 5, noNaN: true }),
        needsFollowUp: fc.constant(true),
        followUpReason: fc.constantFrom('insufficient depth', 'unclear explanation', 'incomplete coverage'),
        technicalAccuracy: fc.option(fc.double({ min: 0, max: 5, noNaN: true }), { nil: undefined })
    });

/**
 * Generate evaluation that doesn't need follow-up (high scores)
 */
export const arbHighQualityEvaluation = (): fc.Arbitrary<ResponseEvaluation> =>
    fc.record({
        questionId: arbQuestionId(),
        depthScore: fc.double({ min: 7, max: 10, noNaN: true }),
        clarityScore: fc.double({ min: 7, max: 10, noNaN: true }),
        completenessScore: fc.double({ min: 7, max: 10, noNaN: true }),
        needsFollowUp: fc.constant(false),
        followUpReason: fc.constant(undefined),
        technicalAccuracy: fc.option(fc.double({ min: 7, max: 10, noNaN: true }), { nil: undefined })
    });

// ============================================================================
// Session State Generators
// ============================================================================

/**
 * Generate session state at various completion stages
 * @param status Optional specific status to generate
 */
export const arbSessionState = (status?: SessionStatus): fc.Arbitrary<SessionState> => {
    const statusArb = status ? fc.constant(status) : arbSessionStatus();

    return fc.record({
        sessionId: arbSessionId(),
        role: arbJobRole(),
        experienceLevel: arbExperienceLevel(),
        resumeAnalysis: fc.option(arbResumeAnalysis(), { nil: undefined }),
        questions: arbQuestionSet(),
        responses: fc.array(arbCandidateResponse(), { minLength: 0, maxLength: 10 })
            .map(responses => new Map(responses.map(r => [r.questionId, r]))),
        evaluations: fc.array(arbResponseEvaluation(), { minLength: 0, maxLength: 10 })
            .map(evals => new Map(evals.map(e => [e.questionId, e]))),
        behaviorType: arbBehaviorType(),
        interactionMode: arbInteractionMode(),
        startTime: arbTimestamp(),
        endTime: fc.option(arbTimestamp(), { nil: undefined }),
        status: statusArb
    });
};

/**
 * Generate initialized session (no questions answered yet)
 */
export const arbInitializedSession = (): fc.Arbitrary<SessionState> =>
    fc.record({
        sessionId: arbSessionId(),
        role: arbJobRole(),
        experienceLevel: arbExperienceLevel(),
        resumeAnalysis: fc.option(arbResumeAnalysis(), { nil: undefined }),
        questions: fc.constant([]),
        responses: fc.constant(new Map()),
        evaluations: fc.constant(new Map()),
        behaviorType: fc.constant<BehaviorType>('standard'),
        interactionMode: arbInteractionMode(),
        startTime: arbTimestamp(),
        endTime: fc.constant(undefined),
        status: fc.constant<SessionStatus>('initialized')
    });

/**
 * Generate in-progress session with some answered questions
 */
export const arbInProgressSession = (): fc.Arbitrary<SessionState> =>
    fc.tuple(
        arbSessionId(),
        arbJobRole(),
        arbExperienceLevel(),
        arbQuestionSet(),
        fc.integer({ min: 1, max: 5 }),
        fc.array(arbCandidateResponse(), { minLength: 5, maxLength: 5 }),
        fc.array(arbResponseEvaluation(), { minLength: 5, maxLength: 5 })
    ).chain(([sessionId, role, level, questions, answeredCount, responsePool, evaluationPool]) => {
        const answeredQuestions = questions.slice(0, Math.min(answeredCount, questions.length));
        const responses = answeredQuestions.map((q, idx) => ({
            ...responsePool[idx % responsePool.length],
            questionId: q.id
        }));
        const evaluations = answeredQuestions.map((q, idx) => ({
            ...evaluationPool[idx % evaluationPool.length],
            questionId: q.id
        }));

        return fc.record({
            sessionId: fc.constant(sessionId),
            role: fc.constant(role),
            experienceLevel: fc.constant(level),
            resumeAnalysis: fc.option(arbResumeAnalysis(), { nil: undefined }),
            questions: fc.constant(questions),
            responses: fc.constant(new Map(responses.map(r => [r.questionId, r]))),
            evaluations: fc.constant(new Map(evaluations.map(e => [e.questionId, e]))),
            behaviorType: arbBehaviorType(),
            interactionMode: arbInteractionMode(),
            startTime: arbTimestamp(),
            endTime: fc.constant(undefined),
            status: fc.constant<SessionStatus>('in-progress')
        });
    });

/**
 * Generate completed session with all questions answered
 */
export const arbCompletedSession = (): fc.Arbitrary<SessionState> =>
    fc.tuple(
        arbSessionId(),
        arbJobRole(),
        arbExperienceLevel(),
        arbQuestionSet(),
        arbTimestamp(),
        fc.array(arbCandidateResponse(), { minLength: 10, maxLength: 10 }),
        fc.array(arbResponseEvaluation(), { minLength: 10, maxLength: 10 })
    ).chain(([sessionId, role, level, questions, startTime, responsePool, evaluationPool]) => {
        const responses = questions.map((q, idx) => ({
            ...responsePool[idx % responsePool.length],
            questionId: q.id
        }));
        const evaluations = questions.map((q, idx) => ({
            ...evaluationPool[idx % evaluationPool.length],
            questionId: q.id
        }));

        return fc.record({
            sessionId: fc.constant(sessionId),
            role: fc.constant(role),
            experienceLevel: fc.constant(level),
            resumeAnalysis: fc.option(arbResumeAnalysis(), { nil: undefined }),
            questions: fc.constant(questions),
            responses: fc.constant(new Map(responses.map(r => [r.questionId, r]))),
            evaluations: fc.constant(new Map(evaluations.map(e => [e.questionId, e]))),
            behaviorType: arbBehaviorType(),
            interactionMode: arbInteractionMode(),
            startTime: fc.constant(startTime),
            endTime: fc.integer({ min: startTime + 600000, max: startTime + 3600000 }),
            status: fc.constant<SessionStatus>('completed')
        });
    });

/**
 * Generate early-terminated session
 */
export const arbEarlyTerminatedSession = (): fc.Arbitrary<SessionState> =>
    arbInProgressSession().map(session => ({
        ...session,
        status: 'ended-early' as SessionStatus,
        endTime: Date.now()
    }));
