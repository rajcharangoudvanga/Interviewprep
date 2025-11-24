import * as fc from 'fast-check';
import {
    arbSessionId,
    arbQuestionId,
    arbTimestamp,
    arbBehaviorType,
    arbSessionStatus,
    arbInteractionMode,
    arbJobRole,
    arbExperienceLevel,
    arbSkill,
    arbWorkExperience,
    arbProject,
    arbAlignmentScore,
    arbResumeDocument,
    arbResumeAnalysis,
    arbInterviewQuestion,
    arbQuestionSet,
    arbCandidateResponse,
    arbShortResponse,
    arbDetailedResponse,
    arbTechnicalResponse,
    arbResponseEvaluation,
    arbLowQualityEvaluation,
    arbHighQualityEvaluation,
    arbSessionState,
    arbInitializedSession,
    arbInProgressSession,
    arbCompletedSession,
    arbEarlyTerminatedSession
} from './testGenerators';

describe('Test Data Generators', () => {
    describe('Basic Generators', () => {
        test('arbSessionId generates valid session IDs', () => {
            fc.assert(
                fc.property(arbSessionId(), (sessionId) => {
                    expect(typeof sessionId).toBe('string');
                    expect(sessionId).toMatch(/^session-/);
                })
            );
        });

        test('arbQuestionId generates valid question IDs', () => {
            fc.assert(
                fc.property(arbQuestionId(), (questionId) => {
                    expect(typeof questionId).toBe('string');
                    expect(questionId).toMatch(/^q-/);
                })
            );
        });

        test('arbTimestamp generates valid timestamps', () => {
            fc.assert(
                fc.property(arbTimestamp(), (timestamp) => {
                    expect(typeof timestamp).toBe('number');
                    expect(timestamp).toBeGreaterThan(0);
                    expect(timestamp).toBeLessThanOrEqual(Date.now());
                })
            );
        });

        test('arbBehaviorType generates valid behavior types', () => {
            fc.assert(
                fc.property(arbBehaviorType(), (behaviorType) => {
                    expect(['confused', 'efficient', 'chatty', 'edge-case', 'standard']).toContain(behaviorType);
                })
            );
        });

        test('arbSessionStatus generates valid session statuses', () => {
            fc.assert(
                fc.property(arbSessionStatus(), (status) => {
                    expect(['initialized', 'in-progress', 'completed', 'ended-early']).toContain(status);
                })
            );
        });

        test('arbInteractionMode generates valid interaction modes', () => {
            fc.assert(
                fc.property(arbInteractionMode(), (mode) => {
                    expect(['voice', 'text']).toContain(mode);
                })
            );
        });
    });

    describe('Job Role and Experience Level Generators', () => {
        test('arbJobRole generates valid job roles', () => {
            fc.assert(
                fc.property(arbJobRole(), (role) => {
                    expect(role).toHaveProperty('id');
                    expect(role).toHaveProperty('name');
                    expect(role).toHaveProperty('technicalSkills');
                    expect(role).toHaveProperty('behavioralCompetencies');
                    expect(role).toHaveProperty('questionCategories');
                    expect(Array.isArray(role.technicalSkills)).toBe(true);
                    expect(Array.isArray(role.behavioralCompetencies)).toBe(true);
                    expect(Array.isArray(role.questionCategories)).toBe(true);
                })
            );
        });

        test('arbExperienceLevel generates valid experience levels', () => {
            fc.assert(
                fc.property(arbExperienceLevel(), (level) => {
                    expect(level).toHaveProperty('level');
                    expect(['entry', 'mid', 'senior', 'lead']).toContain(level.level);
                    expect(level.yearsMin).toBeGreaterThanOrEqual(0);
                    expect(level.yearsMax).toBeGreaterThan(level.yearsMin);
                    expect(level.expectedDepth).toBeGreaterThan(0);
                    expect(level.expectedDepth).toBeLessThanOrEqual(10);
                })
            );
        });
    });

    describe('Resume Generators', () => {
        test('arbSkill generates valid skills', () => {
            fc.assert(
                fc.property(arbSkill(), (skill) => {
                    expect(skill).toHaveProperty('name');
                    expect(skill).toHaveProperty('category');
                    expect(typeof skill.name).toBe('string');
                    expect(typeof skill.category).toBe('string');
                })
            );
        });

        test('arbWorkExperience generates valid work experience', () => {
            fc.assert(
                fc.property(arbWorkExperience(), (exp) => {
                    expect(exp).toHaveProperty('company');
                    expect(exp).toHaveProperty('title');
                    expect(exp).toHaveProperty('duration');
                    expect(exp).toHaveProperty('description');
                    expect(typeof exp.company).toBe('string');
                    expect(typeof exp.title).toBe('string');
                })
            );
        });

        test('arbProject generates valid projects', () => {
            fc.assert(
                fc.property(arbProject(), (project) => {
                    expect(project).toHaveProperty('name');
                    expect(project).toHaveProperty('description');
                    expect(project).toHaveProperty('technologies');
                    expect(Array.isArray(project.technologies)).toBe(true);
                    expect(project.technologies.length).toBeGreaterThan(0);
                })
            );
        });

        test('arbResumeDocument generates valid resume documents', () => {
            fc.assert(
                fc.property(arbResumeDocument(), (doc) => {
                    expect(doc).toHaveProperty('content');
                    expect(doc).toHaveProperty('format');
                    expect(doc).toHaveProperty('filename');
                    expect(['text', 'pdf', 'docx']).toContain(doc.format);
                    expect(typeof doc.content).toBe('string');
                })
            );
        });

        test('arbResumeAnalysis generates complete analysis', () => {
            fc.assert(
                fc.property(arbResumeAnalysis(), (analysis) => {
                    expect(analysis).toHaveProperty('parsedResume');
                    expect(analysis).toHaveProperty('strengths');
                    expect(analysis).toHaveProperty('technicalSkills');
                    expect(analysis).toHaveProperty('gaps');
                    expect(analysis).toHaveProperty('alignmentScore');
                    expect(analysis).toHaveProperty('summary');
                    expect(Array.isArray(analysis.strengths)).toBe(true);
                    expect(Array.isArray(analysis.technicalSkills)).toBe(true);
                    expect(analysis.strengths.length).toBeGreaterThan(0);
                    expect(analysis.technicalSkills.length).toBeGreaterThan(0);
                })
            );
        });

        test('arbAlignmentScore generates valid scores', () => {
            fc.assert(
                fc.property(arbAlignmentScore(), (score) => {
                    expect(score.overall).toBeGreaterThanOrEqual(0);
                    expect(score.overall).toBeLessThanOrEqual(100);
                    expect(score.technical).toBeGreaterThanOrEqual(0);
                    expect(score.technical).toBeLessThanOrEqual(100);
                    expect(score.experience).toBeGreaterThanOrEqual(0);
                    expect(score.experience).toBeLessThanOrEqual(100);
                    expect(score.cultural).toBeGreaterThanOrEqual(0);
                    expect(score.cultural).toBeLessThanOrEqual(100);
                })
            );
        });
    });

    describe('Interview Question Generators', () => {
        test('arbInterviewQuestion generates valid questions', () => {
            fc.assert(
                fc.property(arbInterviewQuestion(), (question) => {
                    expect(question).toHaveProperty('id');
                    expect(question).toHaveProperty('type');
                    expect(question).toHaveProperty('text');
                    expect(question).toHaveProperty('category');
                    expect(question).toHaveProperty('difficulty');
                    expect(['technical', 'behavioral']).toContain(question.type);
                    expect(question.difficulty).toBeGreaterThanOrEqual(1);
                    expect(question.difficulty).toBeLessThanOrEqual(10);
                })
            );
        });

        test('arbQuestionSet generates valid question sets with correct count', () => {
            fc.assert(
                fc.property(arbQuestionSet(5, 10, true), (questions) => {
                    expect(Array.isArray(questions)).toBe(true);
                    expect(questions.length).toBeGreaterThanOrEqual(5);
                    expect(questions.length).toBeLessThanOrEqual(10);
                })
            );
        });

        test('arbQuestionSet with ensureMix includes both technical and behavioral', () => {
            fc.assert(
                fc.property(arbQuestionSet(5, 10, true), (questions) => {
                    const hasTechnical = questions.some(q => q.type === 'technical');
                    const hasBehavioral = questions.some(q => q.type === 'behavioral');
                    expect(hasTechnical).toBe(true);
                    expect(hasBehavioral).toBe(true);
                })
            );
        });
    });

    describe('Candidate Response Generators', () => {
        test('arbCandidateResponse generates valid responses', () => {
            fc.assert(
                fc.property(arbCandidateResponse(), (response) => {
                    expect(response).toHaveProperty('questionId');
                    expect(response).toHaveProperty('text');
                    expect(response).toHaveProperty('timestamp');
                    expect(response).toHaveProperty('wordCount');
                    expect(response).toHaveProperty('responseTime');
                    expect(typeof response.text).toBe('string');
                    expect(response.wordCount).toBeGreaterThan(0);
                    expect(response.responseTime).toBeGreaterThan(0);
                })
            );
        });

        test('arbShortResponse generates short responses', () => {
            fc.assert(
                fc.property(arbShortResponse(), (response) => {
                    expect(response.wordCount).toBeLessThanOrEqual(20);
                })
            );
        });

        test('arbDetailedResponse generates detailed responses', () => {
            fc.assert(
                fc.property(arbDetailedResponse(), (response) => {
                    expect(response.wordCount).toBeGreaterThanOrEqual(100);
                })
            );
        });

        test('arbTechnicalResponse includes technical terms', () => {
            fc.assert(
                fc.property(arbTechnicalResponse(), (response) => {
                    const technicalTerms = ['React', 'Python', 'AWS', 'Docker', 'Kubernetes', 'PostgreSQL', 'GraphQL'];
                    const hasTechnicalTerm = technicalTerms.some(term =>
                        response.text.toLowerCase().includes(term.toLowerCase())
                    );
                    expect(hasTechnicalTerm).toBe(true);
                })
            );
        });
    });

    describe('Response Evaluation Generators', () => {
        test('arbResponseEvaluation generates valid evaluations', () => {
            fc.assert(
                fc.property(arbResponseEvaluation(), (evaluation) => {
                    expect(evaluation).toHaveProperty('questionId');
                    expect(evaluation).toHaveProperty('depthScore');
                    expect(evaluation).toHaveProperty('clarityScore');
                    expect(evaluation).toHaveProperty('completenessScore');
                    expect(evaluation).toHaveProperty('needsFollowUp');
                    expect(evaluation.depthScore).toBeGreaterThanOrEqual(0);
                    expect(evaluation.depthScore).toBeLessThanOrEqual(10);
                    expect(evaluation.clarityScore).toBeGreaterThanOrEqual(0);
                    expect(evaluation.clarityScore).toBeLessThanOrEqual(10);
                    expect(evaluation.completenessScore).toBeGreaterThanOrEqual(0);
                    expect(evaluation.completenessScore).toBeLessThanOrEqual(10);
                })
            );
        });

        test('arbLowQualityEvaluation generates low scores and needs follow-up', () => {
            fc.assert(
                fc.property(arbLowQualityEvaluation(), (evaluation) => {
                    expect(evaluation.depthScore).toBeLessThanOrEqual(5);
                    expect(evaluation.completenessScore).toBeLessThanOrEqual(5);
                    expect(evaluation.needsFollowUp).toBe(true);
                    expect(evaluation.followUpReason).toBeDefined();
                })
            );
        });

        test('arbHighQualityEvaluation generates high scores and no follow-up', () => {
            fc.assert(
                fc.property(arbHighQualityEvaluation(), (evaluation) => {
                    expect(evaluation.depthScore).toBeGreaterThanOrEqual(7);
                    expect(evaluation.clarityScore).toBeGreaterThanOrEqual(7);
                    expect(evaluation.completenessScore).toBeGreaterThanOrEqual(7);
                    expect(evaluation.needsFollowUp).toBe(false);
                    expect(evaluation.followUpReason).toBeUndefined();
                })
            );
        });
    });

    describe('Session State Generators', () => {
        test('arbSessionState generates valid session states', () => {
            fc.assert(
                fc.property(arbSessionState(), (session) => {
                    expect(session).toHaveProperty('sessionId');
                    expect(session).toHaveProperty('role');
                    expect(session).toHaveProperty('experienceLevel');
                    expect(session).toHaveProperty('questions');
                    expect(session).toHaveProperty('responses');
                    expect(session).toHaveProperty('evaluations');
                    expect(session).toHaveProperty('behaviorType');
                    expect(session).toHaveProperty('interactionMode');
                    expect(session).toHaveProperty('startTime');
                    expect(session).toHaveProperty('status');
                    expect(Array.isArray(session.questions)).toBe(true);
                    expect(session.responses instanceof Map).toBe(true);
                    expect(session.evaluations instanceof Map).toBe(true);
                })
            );
        });

        test('arbInitializedSession generates initialized sessions', () => {
            fc.assert(
                fc.property(arbInitializedSession(), (session) => {
                    expect(session.status).toBe('initialized');
                    expect(session.questions.length).toBe(0);
                    expect(session.responses.size).toBe(0);
                    expect(session.evaluations.size).toBe(0);
                    expect(session.endTime).toBeUndefined();
                })
            );
        });

        test('arbInProgressSession generates in-progress sessions with responses', () => {
            fc.assert(
                fc.property(arbInProgressSession(), (session) => {
                    expect(session.status).toBe('in-progress');
                    expect(session.questions.length).toBeGreaterThan(0);
                    expect(session.responses.size).toBeGreaterThan(0);
                    expect(session.responses.size).toBeLessThanOrEqual(session.questions.length);
                    expect(session.endTime).toBeUndefined();
                })
            );
        });

        test('arbCompletedSession generates completed sessions with all questions answered', () => {
            fc.assert(
                fc.property(arbCompletedSession(), (session) => {
                    expect(session.status).toBe('completed');
                    expect(session.questions.length).toBeGreaterThan(0);
                    expect(session.responses.size).toBe(session.questions.length);
                    expect(session.evaluations.size).toBe(session.questions.length);
                    expect(session.endTime).toBeDefined();
                    if (session.endTime) {
                        expect(session.endTime).toBeGreaterThan(session.startTime);
                    }
                })
            );
        });

        test('arbEarlyTerminatedSession generates early-terminated sessions', () => {
            fc.assert(
                fc.property(arbEarlyTerminatedSession(), (session) => {
                    expect(session.status).toBe('ended-early');
                    expect(session.endTime).toBeDefined();
                    expect(session.responses.size).toBeGreaterThan(0);
                    expect(session.responses.size).toBeLessThanOrEqual(session.questions.length);
                })
            );
        });
    });

    describe('Generator Consistency', () => {
        test('generated data maintains referential integrity', () => {
            fc.assert(
                fc.property(arbInProgressSession(), (session) => {
                    // All response question IDs should exist in questions
                    const questionIds = new Set(session.questions.map(q => q.id));
                    for (const [responseQuestionId] of session.responses) {
                        expect(questionIds.has(responseQuestionId)).toBe(true);
                    }

                    // All evaluation question IDs should exist in questions
                    for (const [evalQuestionId] of session.evaluations) {
                        expect(questionIds.has(evalQuestionId)).toBe(true);
                    }
                })
            );
        });

        test('timestamps are logically consistent', () => {
            fc.assert(
                fc.property(arbCompletedSession(), (session) => {
                    if (session.endTime) {
                        expect(session.endTime).toBeGreaterThanOrEqual(session.startTime);
                    }
                })
            );
        });
    });
});
