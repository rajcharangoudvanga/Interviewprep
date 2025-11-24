"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.arbEarlyTerminatedSession = exports.arbCompletedSession = exports.arbInProgressSession = exports.arbInitializedSession = exports.arbSessionState = exports.arbHighQualityEvaluation = exports.arbLowQualityEvaluation = exports.arbResponseEvaluation = exports.arbTechnicalResponse = exports.arbDetailedResponse = exports.arbShortResponse = exports.arbCandidateResponse = exports.arbQuestionSet = exports.arbInterviewQuestion = exports.arbResumeReference = exports.arbResumeAnalysis = exports.arbResumeDocument = exports.arbParsedResume = exports.arbAlignmentScore = exports.arbGap = exports.arbStrength = exports.arbAchievement = exports.arbProject = exports.arbWorkExperience = exports.arbSkill = exports.arbExperienceLevel = exports.arbJobRole = exports.arbQuestionCategory = exports.arbInteractionMode = exports.arbSessionStatus = exports.arbBehaviorType = exports.arbTimestamp = exports.arbQuestionId = exports.arbSessionId = void 0;
const fc = __importStar(require("fast-check"));
/**
 * Test data generators for property-based testing using fast-check
 * These generators produce valid, realistic test data for all core types
 */
// ============================================================================
// Basic Generators
// ============================================================================
const arbSessionId = () => fc.uuid().map(uuid => `session-${uuid}`);
exports.arbSessionId = arbSessionId;
const arbQuestionId = () => fc.uuid().map(uuid => `q-${uuid}`);
exports.arbQuestionId = arbQuestionId;
const arbTimestamp = () => fc.integer({ min: 1600000000000, max: Date.now() });
exports.arbTimestamp = arbTimestamp;
const arbBehaviorType = () => fc.constantFrom('confused', 'efficient', 'chatty', 'edge-case', 'standard');
exports.arbBehaviorType = arbBehaviorType;
const arbSessionStatus = () => fc.constantFrom('initialized', 'in-progress', 'completed', 'ended-early');
exports.arbSessionStatus = arbSessionStatus;
const arbInteractionMode = () => fc.constantFrom('voice', 'text');
exports.arbInteractionMode = arbInteractionMode;
// ============================================================================
// Job Role and Experience Level Generators
// ============================================================================
const arbQuestionCategory = () => fc.record({
    name: fc.constantFrom('Data Structures', 'Algorithms', 'System Design', 'Coding', 'Problem Solving', 'Product Strategy', 'Analytics', 'Machine Learning', 'Statistics', 'JavaScript', 'UI Development', 'Design & UX', 'API Development', 'Database', 'Infrastructure', 'Automation', 'Troubleshooting', 'Collaboration', 'Learning Agility', 'Decision Making', 'Adaptability'),
    weight: fc.double({ min: 0.1, max: 1.0, noNaN: true }),
    technicalFocus: fc.boolean()
});
exports.arbQuestionCategory = arbQuestionCategory;
const arbJobRole = () => fc.oneof(fc.constant({
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
}), fc.constant({
    id: 'product-manager',
    name: 'Product Manager',
    technicalSkills: ['Product Strategy', 'Analytics', 'User Research', 'Roadmapping'],
    behavioralCompetencies: ['Leadership', 'Communication', 'Strategic Thinking', 'Stakeholder Management'],
    questionCategories: [
        { name: 'Product Strategy', weight: 0.4, technicalFocus: true },
        { name: 'Analytics', weight: 0.3, technicalFocus: true },
        { name: 'Leadership', weight: 0.3, technicalFocus: false }
    ]
}), fc.constant({
    id: 'data-scientist',
    name: 'Data Scientist',
    technicalSkills: ['Machine Learning', 'Statistics', 'Python', 'SQL', 'Data Analysis'],
    behavioralCompetencies: ['Analytical Thinking', 'Communication', 'Problem Solving', 'Collaboration'],
    questionCategories: [
        { name: 'Machine Learning', weight: 0.4, technicalFocus: true },
        { name: 'Statistics', weight: 0.3, technicalFocus: true },
        { name: 'Analytical Thinking', weight: 0.3, technicalFocus: false }
    ]
}), fc.constant({
    id: 'frontend-engineer',
    name: 'Frontend Engineer',
    technicalSkills: ['React', 'JavaScript', 'CSS', 'HTML', 'UI/UX', 'Accessibility'],
    behavioralCompetencies: ['Attention to Detail', 'Collaboration', 'User Empathy', 'Problem Solving'],
    questionCategories: [
        { name: 'JavaScript', weight: 0.3, technicalFocus: true },
        { name: 'UI Development', weight: 0.4, technicalFocus: true },
        { name: 'Design & UX', weight: 0.3, technicalFocus: false }
    ]
}), fc.constant({
    id: 'backend-engineer',
    name: 'Backend Engineer',
    technicalSkills: ['API Development', 'Database', 'System Design', 'Security', 'Performance'],
    behavioralCompetencies: ['Problem Solving', 'Collaboration', 'Reliability', 'Communication'],
    questionCategories: [
        { name: 'API Development', weight: 0.3, technicalFocus: true },
        { name: 'Database', weight: 0.3, technicalFocus: true },
        { name: 'System Design', weight: 0.4, technicalFocus: true }
    ]
}), fc.constant({
    id: 'devops-engineer',
    name: 'DevOps Engineer',
    technicalSkills: ['Infrastructure', 'Automation', 'CI/CD', 'Monitoring', 'Cloud Platforms'],
    behavioralCompetencies: ['Problem Solving', 'Collaboration', 'Reliability', 'Continuous Improvement'],
    questionCategories: [
        { name: 'Infrastructure', weight: 0.4, technicalFocus: true },
        { name: 'Automation', weight: 0.3, technicalFocus: true },
        { name: 'Troubleshooting', weight: 0.3, technicalFocus: true }
    ]
}));
exports.arbJobRole = arbJobRole;
const arbExperienceLevel = () => fc.oneof(fc.constant({
    level: 'entry',
    yearsMin: 0,
    yearsMax: 2,
    expectedDepth: 4
}), fc.constant({
    level: 'mid',
    yearsMin: 2,
    yearsMax: 5,
    expectedDepth: 6
}), fc.constant({
    level: 'senior',
    yearsMin: 5,
    yearsMax: 10,
    expectedDepth: 8
}), fc.constant({
    level: 'lead',
    yearsMin: 10,
    yearsMax: 20,
    expectedDepth: 9
}));
exports.arbExperienceLevel = arbExperienceLevel;
// ============================================================================
// Resume Generators
// ============================================================================
const arbSkill = () => fc.record({
    name: fc.constantFrom('JavaScript', 'Python', 'Java', 'React', 'Node.js', 'SQL', 'AWS', 'Docker', 'Kubernetes', 'Machine Learning', 'Data Analysis', 'API Design', 'System Design', 'Agile', 'Leadership', 'Communication'),
    category: fc.constantFrom('Programming', 'Framework', 'Cloud', 'Soft Skills', 'Tools'),
    proficiency: fc.option(fc.constantFrom('Beginner', 'Intermediate', 'Advanced', 'Expert'), { nil: undefined })
});
exports.arbSkill = arbSkill;
const arbWorkExperience = () => fc.record({
    company: fc.constantFrom('TechCorp', 'DataSystems Inc', 'CloudSolutions', 'StartupXYZ', 'Enterprise Co'),
    title: fc.constantFrom('Software Engineer', 'Senior Developer', 'Tech Lead', 'Product Manager', 'Data Scientist'),
    duration: fc.constantFrom('2020-2023', '2019-2021', '2021-Present', '2018-2020', '1 year', '2 years'),
    description: fc.string({ minLength: 20, maxLength: 100 }),
    technologies: fc.option(fc.array(fc.constantFrom('React', 'Python', 'AWS', 'Docker', 'PostgreSQL'), { minLength: 1, maxLength: 5 }), { nil: undefined })
});
exports.arbWorkExperience = arbWorkExperience;
const arbProject = () => fc.record({
    name: fc.constantFrom('E-commerce Platform', 'Data Pipeline', 'Mobile App', 'Analytics Dashboard', 'API Gateway'),
    description: fc.string({ minLength: 20, maxLength: 100 }),
    technologies: fc.array(fc.constantFrom('React', 'Node.js', 'Python', 'AWS', 'MongoDB'), { minLength: 1, maxLength: 4 }),
    role: fc.option(fc.constantFrom('Lead Developer', 'Contributor', 'Architect', 'Team Member'), { nil: undefined })
});
exports.arbProject = arbProject;
const arbAchievement = () => fc.record({
    description: fc.string({ minLength: 10, maxLength: 50 }),
    impact: fc.option(fc.constantFrom('Increased performance by 50%', 'Reduced costs by 30%', 'Improved user satisfaction'), { nil: undefined }),
    context: fc.option(fc.constantFrom('Team project', 'Individual contribution', 'Cross-functional initiative'), { nil: undefined })
});
exports.arbAchievement = arbAchievement;
const arbStrength = () => fc.record({
    area: fc.constantFrom('Technical Skills', 'Leadership', 'Problem Solving', 'Communication', 'System Design'),
    evidence: fc.array(fc.string({ minLength: 10, maxLength: 50 }), { minLength: 1, maxLength: 3 }),
    relevance: fc.double({ min: 0, max: 10, noNaN: true })
});
exports.arbStrength = arbStrength;
const arbGap = () => fc.record({
    skill: fc.constantFrom('Kubernetes', 'Machine Learning', 'GraphQL', 'Microservices', 'Cloud Architecture'),
    importance: fc.double({ min: 0, max: 10, noNaN: true }),
    suggestion: fc.string({ minLength: 10, maxLength: 50 })
});
exports.arbGap = arbGap;
const arbAlignmentScore = () => fc.record({
    overall: fc.double({ min: 0, max: 100, noNaN: true }),
    technical: fc.double({ min: 0, max: 100, noNaN: true }),
    experience: fc.double({ min: 0, max: 100, noNaN: true }),
    cultural: fc.double({ min: 0, max: 100, noNaN: true })
});
exports.arbAlignmentScore = arbAlignmentScore;
const arbParsedResume = () => fc.record({
    rawText: fc.string({ minLength: 100, maxLength: 500 }),
    sections: fc.constant(new Map([
        ['summary', 'Experienced software engineer with 5 years of experience'],
        ['experience', 'Software Engineer at TechCorp (2020-2023)'],
        ['education', 'BS Computer Science, University (2016-2020)'],
        ['skills', 'JavaScript, Python, React, Node.js, AWS']
    ])),
    metadata: fc.record({
        parsedAt: (0, exports.arbTimestamp)(),
        format: fc.constantFrom('text', 'pdf', 'docx')
    })
});
exports.arbParsedResume = arbParsedResume;
const arbResumeDocument = () => fc.record({
    content: fc.string({ minLength: 200, maxLength: 1000 }),
    format: fc.constantFrom('text', 'pdf', 'docx'),
    filename: fc.constantFrom('resume.txt', 'resume.pdf', 'resume.docx', 'cv.pdf', 'my_resume.txt')
});
exports.arbResumeDocument = arbResumeDocument;
const arbResumeAnalysis = () => fc.record({
    parsedResume: (0, exports.arbParsedResume)(),
    strengths: fc.array((0, exports.arbStrength)(), { minLength: 1, maxLength: 5 }),
    technicalSkills: fc.array((0, exports.arbSkill)(), { minLength: 1, maxLength: 10 }),
    gaps: fc.array((0, exports.arbGap)(), { minLength: 0, maxLength: 5 }),
    alignmentScore: (0, exports.arbAlignmentScore)(),
    summary: fc.string({ minLength: 50, maxLength: 200 })
});
exports.arbResumeAnalysis = arbResumeAnalysis;
// ============================================================================
// Interview Question Generators
// ============================================================================
const arbResumeReference = () => fc.record({
    section: fc.constantFrom('skills', 'experience', 'projects', 'achievements'),
    content: fc.string({ minLength: 10, maxLength: 50 }),
    relevance: fc.string({ minLength: 10, maxLength: 50 })
});
exports.arbResumeReference = arbResumeReference;
const arbInterviewQuestion = () => fc.record({
    id: (0, exports.arbQuestionId)(),
    type: fc.constantFrom('technical', 'behavioral'),
    text: fc.string({ minLength: 20, maxLength: 100 }).map(text => text + '?'),
    category: fc.constantFrom('Data Structures', 'Algorithms', 'System Design', 'Collaboration', 'Leadership'),
    difficulty: fc.integer({ min: 1, max: 10 }),
    resumeContext: fc.option((0, exports.arbResumeReference)(), { nil: undefined }),
    expectedElements: fc.option(fc.array(fc.string({ minLength: 5, maxLength: 20 }), { minLength: 1, maxLength: 5 }), { nil: undefined }),
    parentQuestionId: fc.option((0, exports.arbQuestionId)(), { nil: undefined }),
    followUpCount: fc.option(fc.integer({ min: 0, max: 2 }), { nil: undefined })
});
exports.arbInterviewQuestion = arbInterviewQuestion;
/**
 * Generate a question set with controlled characteristics
 * @param minCount Minimum number of questions (default 5)
 * @param maxCount Maximum number of questions (default 10)
 * @param ensureMix Ensure mix of technical and behavioral (default true)
 */
const arbQuestionSet = (minCount = 5, maxCount = 10, ensureMix = true) => {
    if (ensureMix) {
        return fc.tuple(fc.integer({ min: minCount, max: maxCount }), fc.double({ min: 0.4, max: 0.7, noNaN: true })).chain(([count, techRatio]) => {
            const techCount = Math.ceil(count * techRatio);
            const behavioralCount = count - techCount;
            return fc.tuple(fc.array((0, exports.arbInterviewQuestion)().map(q => ({ ...q, type: 'technical' })), { minLength: techCount, maxLength: techCount }), fc.array((0, exports.arbInterviewQuestion)().map(q => ({ ...q, type: 'behavioral' })), { minLength: behavioralCount, maxLength: behavioralCount })).map(([tech, behavioral]) => [...tech, ...behavioral]);
        });
    }
    return fc.array((0, exports.arbInterviewQuestion)(), { minLength: minCount, maxLength: maxCount });
};
exports.arbQuestionSet = arbQuestionSet;
// ============================================================================
// Candidate Response Generators
// ============================================================================
/**
 * Generate candidate response with controllable characteristics
 * @param minWords Minimum word count (default 10)
 * @param maxWords Maximum word count (default 200)
 */
const arbCandidateResponse = (minWords = 10, maxWords = 200) => fc.record({
    questionId: (0, exports.arbQuestionId)(),
    text: fc.string({ minLength: minWords * 5, maxLength: maxWords * 5 }),
    timestamp: (0, exports.arbTimestamp)(),
    wordCount: fc.integer({ min: minWords, max: maxWords }),
    responseTime: fc.integer({ min: 5000, max: 300000 }) // 5 seconds to 5 minutes
});
exports.arbCandidateResponse = arbCandidateResponse;
/**
 * Generate a short/low-quality response (for testing follow-up logic)
 */
const arbShortResponse = () => (0, exports.arbCandidateResponse)(1, 20);
exports.arbShortResponse = arbShortResponse;
/**
 * Generate a detailed/high-quality response
 */
const arbDetailedResponse = () => (0, exports.arbCandidateResponse)(100, 300);
exports.arbDetailedResponse = arbDetailedResponse;
/**
 * Generate response with technical mentions
 */
const arbTechnicalResponse = () => fc.record({
    questionId: (0, exports.arbQuestionId)(),
    text: fc.tuple(fc.string({ minLength: 50, maxLength: 200 }), fc.constantFrom('React', 'Python', 'AWS', 'Docker', 'Kubernetes', 'PostgreSQL', 'GraphQL')).map(([words, tech]) => `${words} using ${tech} and implementing the solution`),
    timestamp: (0, exports.arbTimestamp)(),
    wordCount: fc.integer({ min: 30, max: 100 }),
    responseTime: fc.integer({ min: 30000, max: 180000 })
});
exports.arbTechnicalResponse = arbTechnicalResponse;
// ============================================================================
// Response Evaluation Generators
// ============================================================================
const arbResponseEvaluation = () => fc.record({
    questionId: (0, exports.arbQuestionId)(),
    depthScore: fc.double({ min: 0, max: 10, noNaN: true }),
    clarityScore: fc.double({ min: 0, max: 10, noNaN: true }),
    completenessScore: fc.double({ min: 0, max: 10, noNaN: true }),
    needsFollowUp: fc.boolean(),
    followUpReason: fc.option(fc.constantFrom('insufficient depth', 'unclear explanation', 'incomplete coverage', 'technical detail needed'), { nil: undefined }),
    technicalAccuracy: fc.option(fc.double({ min: 0, max: 10, noNaN: true }), { nil: undefined })
});
exports.arbResponseEvaluation = arbResponseEvaluation;
/**
 * Generate evaluation that needs follow-up (low scores)
 */
const arbLowQualityEvaluation = () => fc.record({
    questionId: (0, exports.arbQuestionId)(),
    depthScore: fc.double({ min: 0, max: 5, noNaN: true }),
    clarityScore: fc.double({ min: 0, max: 6, noNaN: true }),
    completenessScore: fc.double({ min: 0, max: 5, noNaN: true }),
    needsFollowUp: fc.constant(true),
    followUpReason: fc.constantFrom('insufficient depth', 'unclear explanation', 'incomplete coverage'),
    technicalAccuracy: fc.option(fc.double({ min: 0, max: 5, noNaN: true }), { nil: undefined })
});
exports.arbLowQualityEvaluation = arbLowQualityEvaluation;
/**
 * Generate evaluation that doesn't need follow-up (high scores)
 */
const arbHighQualityEvaluation = () => fc.record({
    questionId: (0, exports.arbQuestionId)(),
    depthScore: fc.double({ min: 7, max: 10, noNaN: true }),
    clarityScore: fc.double({ min: 7, max: 10, noNaN: true }),
    completenessScore: fc.double({ min: 7, max: 10, noNaN: true }),
    needsFollowUp: fc.constant(false),
    followUpReason: fc.constant(undefined),
    technicalAccuracy: fc.option(fc.double({ min: 7, max: 10, noNaN: true }), { nil: undefined })
});
exports.arbHighQualityEvaluation = arbHighQualityEvaluation;
// ============================================================================
// Session State Generators
// ============================================================================
/**
 * Generate session state at various completion stages
 * @param status Optional specific status to generate
 */
const arbSessionState = (status) => {
    const statusArb = status ? fc.constant(status) : (0, exports.arbSessionStatus)();
    return fc.record({
        sessionId: (0, exports.arbSessionId)(),
        role: (0, exports.arbJobRole)(),
        experienceLevel: (0, exports.arbExperienceLevel)(),
        resumeAnalysis: fc.option((0, exports.arbResumeAnalysis)(), { nil: undefined }),
        questions: (0, exports.arbQuestionSet)(),
        responses: fc.array((0, exports.arbCandidateResponse)(), { minLength: 0, maxLength: 10 })
            .map(responses => new Map(responses.map(r => [r.questionId, r]))),
        evaluations: fc.array((0, exports.arbResponseEvaluation)(), { minLength: 0, maxLength: 10 })
            .map(evals => new Map(evals.map(e => [e.questionId, e]))),
        behaviorType: (0, exports.arbBehaviorType)(),
        interactionMode: (0, exports.arbInteractionMode)(),
        startTime: (0, exports.arbTimestamp)(),
        endTime: fc.option((0, exports.arbTimestamp)(), { nil: undefined }),
        status: statusArb
    });
};
exports.arbSessionState = arbSessionState;
/**
 * Generate initialized session (no questions answered yet)
 */
const arbInitializedSession = () => fc.record({
    sessionId: (0, exports.arbSessionId)(),
    role: (0, exports.arbJobRole)(),
    experienceLevel: (0, exports.arbExperienceLevel)(),
    resumeAnalysis: fc.option((0, exports.arbResumeAnalysis)(), { nil: undefined }),
    questions: fc.constant([]),
    responses: fc.constant(new Map()),
    evaluations: fc.constant(new Map()),
    behaviorType: fc.constant('standard'),
    interactionMode: (0, exports.arbInteractionMode)(),
    startTime: (0, exports.arbTimestamp)(),
    endTime: fc.constant(undefined),
    status: fc.constant('initialized')
});
exports.arbInitializedSession = arbInitializedSession;
/**
 * Generate in-progress session with some answered questions
 */
const arbInProgressSession = () => fc.tuple((0, exports.arbSessionId)(), (0, exports.arbJobRole)(), (0, exports.arbExperienceLevel)(), (0, exports.arbQuestionSet)(), fc.integer({ min: 1, max: 5 }), fc.array((0, exports.arbCandidateResponse)(), { minLength: 5, maxLength: 5 }), fc.array((0, exports.arbResponseEvaluation)(), { minLength: 5, maxLength: 5 })).chain(([sessionId, role, level, questions, answeredCount, responsePool, evaluationPool]) => {
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
        resumeAnalysis: fc.option((0, exports.arbResumeAnalysis)(), { nil: undefined }),
        questions: fc.constant(questions),
        responses: fc.constant(new Map(responses.map(r => [r.questionId, r]))),
        evaluations: fc.constant(new Map(evaluations.map(e => [e.questionId, e]))),
        behaviorType: (0, exports.arbBehaviorType)(),
        interactionMode: (0, exports.arbInteractionMode)(),
        startTime: (0, exports.arbTimestamp)(),
        endTime: fc.constant(undefined),
        status: fc.constant('in-progress')
    });
});
exports.arbInProgressSession = arbInProgressSession;
/**
 * Generate completed session with all questions answered
 */
const arbCompletedSession = () => fc.tuple((0, exports.arbSessionId)(), (0, exports.arbJobRole)(), (0, exports.arbExperienceLevel)(), (0, exports.arbQuestionSet)(), (0, exports.arbTimestamp)(), fc.array((0, exports.arbCandidateResponse)(), { minLength: 10, maxLength: 10 }), fc.array((0, exports.arbResponseEvaluation)(), { minLength: 10, maxLength: 10 })).chain(([sessionId, role, level, questions, startTime, responsePool, evaluationPool]) => {
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
        resumeAnalysis: fc.option((0, exports.arbResumeAnalysis)(), { nil: undefined }),
        questions: fc.constant(questions),
        responses: fc.constant(new Map(responses.map(r => [r.questionId, r]))),
        evaluations: fc.constant(new Map(evaluations.map(e => [e.questionId, e]))),
        behaviorType: (0, exports.arbBehaviorType)(),
        interactionMode: (0, exports.arbInteractionMode)(),
        startTime: fc.constant(startTime),
        endTime: fc.integer({ min: startTime + 600000, max: startTime + 3600000 }),
        status: fc.constant('completed')
    });
});
exports.arbCompletedSession = arbCompletedSession;
/**
 * Generate early-terminated session
 */
const arbEarlyTerminatedSession = () => (0, exports.arbInProgressSession)().map(session => ({
    ...session,
    status: 'ended-early',
    endTime: Date.now()
}));
exports.arbEarlyTerminatedSession = arbEarlyTerminatedSession;
//# sourceMappingURL=testGenerators.js.map