import {
    JobRole,
    ExperienceLevel,
    ResumeAnalysis,
    InterviewQuestion,
    CandidateResponse,
    ResponseEvaluation,
    QuestionId
} from '../models/types';

export interface QuestionGenerator {
    generateQuestionSet(
        role: JobRole,
        level: ExperienceLevel,
        resumeAnalysis?: ResumeAnalysis
    ): InterviewQuestion[];

    generateFollowUp(
        question: InterviewQuestion,
        response: CandidateResponse,
        evaluation: ResponseEvaluation
    ): InterviewQuestion | null;
}

interface QuestionTemplate {
    text: string;
    category: string;
    type: 'technical' | 'behavioral';
    difficulty: number;
    expectedElements?: string[];
}

/**
 * Default implementation of QuestionGenerator that generates role-specific
 * technical and behavioral questions with optional resume-aware customization
 */
export class DefaultQuestionGenerator implements QuestionGenerator {
    private questionIdCounter = 0;

    /**
     * Generate a set of 5-10 interview questions based on role, level, and optional resume
     */
    generateQuestionSet(
        role: JobRole,
        level: ExperienceLevel,
        resumeAnalysis?: ResumeAnalysis
    ): InterviewQuestion[] {
        const questions: InterviewQuestion[] = [];

        // Determine question count based on experience level (5-10 questions)
        const questionCount = this.determineQuestionCount(level);

        // Calculate mix of technical vs behavioral questions
        const technicalCount = Math.ceil(questionCount * 0.6); // 60% technical
        const behavioralCount = questionCount - technicalCount; // 40% behavioral

        // Generate technical questions
        const technicalQuestions = this.generateTechnicalQuestions(
            role,
            level,
            technicalCount,
            resumeAnalysis
        );
        questions.push(...technicalQuestions);

        // Generate behavioral questions
        const behavioralQuestions = this.generateBehavioralQuestions(
            role,
            level,
            behavioralCount,
            resumeAnalysis
        );
        questions.push(...behavioralQuestions);

        // Shuffle questions to mix technical and behavioral
        return this.shuffleQuestions(questions);
    }

    /**
     * Generate follow-up questions based on response quality and content
     * Maximum of 2 follow-ups per primary question
     */
    generateFollowUp(
        question: InterviewQuestion,
        response: CandidateResponse,
        evaluation: ResponseEvaluation
    ): InterviewQuestion | null {
        // Check follow-up count limit (max 2 per primary question)
        const currentFollowUpCount = question.followUpCount || 0;
        if (currentFollowUpCount >= 2) {
            return null; // Maximum follow-ups reached
        }

        // Don't generate follow-up if response is high quality
        if (!evaluation.needsFollowUp) {
            return null;
        }

        // Determine follow-up type based on evaluation
        let followUpQuestion: InterviewQuestion | null = null;

        // Check for technical mentions first (higher priority)
        const technicalMentions = this.extractTechnicalMentions(response.text);
        if (technicalMentions.length > 0 && question.type === 'technical') {
            followUpQuestion = this.generateTechnicalFollowUp(
                question,
                response,
                technicalMentions
            );
        }

        // If no technical follow-up, generate elaboration request
        if (!followUpQuestion) {
            followUpQuestion = this.generateElaborationFollowUp(
                question,
                response,
                evaluation
            );
        }

        // Set follow-up metadata
        if (followUpQuestion) {
            followUpQuestion.parentQuestionId = question.id;
            followUpQuestion.followUpCount = currentFollowUpCount + 1;
        }

        return followUpQuestion;
    }

    /**
     * Determine the number of questions based on experience level
     */
    private determineQuestionCount(level: ExperienceLevel): number {
        // Entry: 5-6 questions, Mid: 7-8, Senior: 8-9, Lead: 9-10
        const baseCount = {
            'entry': 5,
            'mid': 7,
            'senior': 8,
            'lead': 9
        };

        const base = baseCount[level.level];
        // Add 0-1 random questions for variety
        return base + Math.floor(Math.random() * 2);
    }

    /**
     * Generate technical questions for the role
     */
    private generateTechnicalQuestions(
        role: JobRole,
        level: ExperienceLevel,
        count: number,
        resumeAnalysis?: ResumeAnalysis
    ): InterviewQuestion[] {
        const templates = this.getTechnicalTemplates(role, level);
        const questions: InterviewQuestion[] = [];

        // If resume is available, try to generate 1-2 resume-aware questions
        let resumeQuestionCount = 0;
        if (resumeAnalysis && resumeAnalysis.technicalSkills.length > 0) {
            resumeQuestionCount = Math.min(2, Math.floor(count / 2));

            for (let i = 0; i < resumeQuestionCount; i++) {
                const resumeQuestion = this.generateResumeAwareQuestion(
                    role,
                    level,
                    resumeAnalysis,
                    'technical'
                );
                if (resumeQuestion) {
                    questions.push(resumeQuestion);
                }
            }
        }

        // Fill remaining with template-based questions
        const remainingCount = count - questions.length;
        const selectedTemplates = this.selectRandomTemplates(templates, remainingCount);

        for (const template of selectedTemplates) {
            questions.push(this.createQuestionFromTemplate(template));
        }

        return questions;
    }

    /**
     * Generate behavioral questions for the role
     */
    private generateBehavioralQuestions(
        role: JobRole,
        level: ExperienceLevel,
        count: number,
        resumeAnalysis?: ResumeAnalysis
    ): InterviewQuestion[] {
        const templates = this.getBehavioralTemplates(role, level);
        const questions: InterviewQuestion[] = [];

        // If resume is available, try to generate 1 resume-aware behavioral question
        if (resumeAnalysis && resumeAnalysis.parsedResume) {
            const resumeQuestion = this.generateResumeAwareQuestion(
                role,
                level,
                resumeAnalysis,
                'behavioral'
            );
            if (resumeQuestion) {
                questions.push(resumeQuestion);
            }
        }

        // Fill remaining with template-based questions
        const remainingCount = count - questions.length;
        const selectedTemplates = this.selectRandomTemplates(templates, remainingCount);

        for (const template of selectedTemplates) {
            questions.push(this.createQuestionFromTemplate(template));
        }

        return questions;
    }

    /**
     * Get technical question templates for a specific role
     */
    private getTechnicalTemplates(role: JobRole, level: ExperienceLevel): QuestionTemplate[] {
        const templates: QuestionTemplate[] = [];
        const difficulty = level.expectedDepth;

        // Role-specific technical questions
        switch (role.id) {
            case 'software-engineer':
                templates.push(
                    {
                        text: 'Explain the difference between a stack and a queue. When would you use each?',
                        category: 'Data Structures',
                        type: 'technical',
                        difficulty: Math.min(difficulty, 5),
                        expectedElements: ['stack', 'queue', 'LIFO', 'FIFO', 'use cases']
                    },
                    {
                        text: 'How would you design a URL shortening service like bit.ly?',
                        category: 'System Design',
                        type: 'technical',
                        difficulty: Math.min(difficulty + 2, 10),
                        expectedElements: ['database', 'hashing', 'scalability', 'API']
                    },
                    {
                        text: 'What is the time complexity of common sorting algorithms? Which would you choose for different scenarios?',
                        category: 'Algorithms',
                        type: 'technical',
                        difficulty: difficulty,
                        expectedElements: ['O(n log n)', 'quicksort', 'mergesort', 'trade-offs']
                    },
                    {
                        text: 'Explain how you would implement a thread-safe singleton pattern.',
                        category: 'Coding',
                        type: 'technical',
                        difficulty: difficulty + 1,
                        expectedElements: ['thread safety', 'synchronization', 'lazy initialization']
                    },
                    {
                        text: 'Describe your approach to debugging a production issue that only occurs intermittently.',
                        category: 'Problem Solving',
                        type: 'technical',
                        difficulty: difficulty,
                        expectedElements: ['logging', 'monitoring', 'reproduction', 'root cause']
                    }
                );
                break;

            case 'product-manager':
                templates.push(
                    {
                        text: 'How would you prioritize features for the next product release?',
                        category: 'Product Strategy',
                        type: 'technical',
                        difficulty: difficulty,
                        expectedElements: ['user value', 'business impact', 'effort', 'framework']
                    },
                    {
                        text: 'Walk me through how you would measure the success of a new feature.',
                        category: 'Analytics',
                        type: 'technical',
                        difficulty: difficulty,
                        expectedElements: ['metrics', 'KPIs', 'baseline', 'goals']
                    },
                    {
                        text: 'How do you conduct user research to validate product assumptions?',
                        category: 'Product Strategy',
                        type: 'technical',
                        difficulty: difficulty - 1,
                        expectedElements: ['interviews', 'surveys', 'usability testing', 'data analysis']
                    },
                    {
                        text: 'Explain how you would design an A/B test for a new checkout flow.',
                        category: 'Analytics',
                        type: 'technical',
                        difficulty: difficulty + 1,
                        expectedElements: ['hypothesis', 'metrics', 'sample size', 'variants']
                    }
                );
                break;

            case 'data-scientist':
                templates.push(
                    {
                        text: 'Explain the bias-variance tradeoff in machine learning.',
                        category: 'Machine Learning',
                        type: 'technical',
                        difficulty: difficulty,
                        expectedElements: ['bias', 'variance', 'overfitting', 'underfitting']
                    },
                    {
                        text: 'How would you handle missing data in a dataset?',
                        category: 'Statistics',
                        type: 'technical',
                        difficulty: difficulty - 1,
                        expectedElements: ['imputation', 'deletion', 'analysis', 'impact']
                    },
                    {
                        text: 'Describe the process of feature engineering for a predictive model.',
                        category: 'Machine Learning',
                        type: 'technical',
                        difficulty: difficulty,
                        expectedElements: ['feature selection', 'transformation', 'domain knowledge', 'validation']
                    },
                    {
                        text: 'What evaluation metrics would you use for a classification problem with imbalanced classes?',
                        category: 'Machine Learning',
                        type: 'technical',
                        difficulty: difficulty + 1,
                        expectedElements: ['precision', 'recall', 'F1', 'ROC-AUC', 'class imbalance']
                    },
                    {
                        text: 'Explain how you would optimize a SQL query that is running slowly.',
                        category: 'Coding',
                        type: 'technical',
                        difficulty: difficulty,
                        expectedElements: ['indexes', 'query plan', 'joins', 'optimization']
                    }
                );
                break;

            case 'frontend-engineer':
                templates.push(
                    {
                        text: 'Explain the virtual DOM and how React uses it for performance optimization.',
                        category: 'JavaScript',
                        type: 'technical',
                        difficulty: difficulty,
                        expectedElements: ['virtual DOM', 'reconciliation', 'diffing', 'performance']
                    },
                    {
                        text: 'How would you implement responsive design for a complex web application?',
                        category: 'UI Development',
                        type: 'technical',
                        difficulty: difficulty - 1,
                        expectedElements: ['media queries', 'flexbox', 'grid', 'mobile-first']
                    },
                    {
                        text: 'What are the key principles of web accessibility and how do you implement them?',
                        category: 'Design & UX',
                        type: 'technical',
                        difficulty: difficulty,
                        expectedElements: ['ARIA', 'semantic HTML', 'keyboard navigation', 'screen readers']
                    },
                    {
                        text: 'Describe your approach to optimizing web performance and load times.',
                        category: 'UI Development',
                        type: 'technical',
                        difficulty: difficulty + 1,
                        expectedElements: ['lazy loading', 'code splitting', 'caching', 'metrics']
                    }
                );
                break;

            case 'backend-engineer':
                templates.push(
                    {
                        text: 'How would you design a RESTful API for a social media platform?',
                        category: 'API Development',
                        type: 'technical',
                        difficulty: difficulty,
                        expectedElements: ['REST', 'endpoints', 'authentication', 'versioning']
                    },
                    {
                        text: 'Explain the CAP theorem and its implications for distributed systems.',
                        category: 'System Design',
                        type: 'technical',
                        difficulty: difficulty + 2,
                        expectedElements: ['consistency', 'availability', 'partition tolerance', 'trade-offs']
                    },
                    {
                        text: 'What strategies would you use to optimize database queries for a high-traffic application?',
                        category: 'Database',
                        type: 'technical',
                        difficulty: difficulty + 1,
                        expectedElements: ['indexing', 'caching', 'query optimization', 'connection pooling']
                    },
                    {
                        text: 'How do you ensure API security and prevent common vulnerabilities?',
                        category: 'API Development',
                        type: 'technical',
                        difficulty: difficulty,
                        expectedElements: ['authentication', 'authorization', 'SQL injection', 'rate limiting']
                    }
                );
                break;

            case 'devops-engineer':
                templates.push(
                    {
                        text: 'Explain the principles of Infrastructure as Code and your experience with tools like Terraform.',
                        category: 'Infrastructure',
                        type: 'technical',
                        difficulty: difficulty,
                        expectedElements: ['IaC', 'declarative', 'version control', 'automation']
                    },
                    {
                        text: 'How would you design a CI/CD pipeline for a microservices application?',
                        category: 'Automation',
                        type: 'technical',
                        difficulty: difficulty + 1,
                        expectedElements: ['CI/CD', 'testing', 'deployment', 'rollback']
                    },
                    {
                        text: 'Describe your approach to monitoring and alerting for production systems.',
                        category: 'Troubleshooting',
                        type: 'technical',
                        difficulty: difficulty,
                        expectedElements: ['metrics', 'logs', 'alerts', 'dashboards']
                    },
                    {
                        text: 'What is container orchestration and how does Kubernetes solve scaling challenges?',
                        category: 'Infrastructure',
                        type: 'technical',
                        difficulty: difficulty + 1,
                        expectedElements: ['containers', 'orchestration', 'scaling', 'Kubernetes']
                    }
                );
                break;
        }

        return templates;
    }

    /**
     * Get behavioral question templates for a specific role
     */
    private getBehavioralTemplates(role: JobRole, level: ExperienceLevel): QuestionTemplate[] {
        const templates: QuestionTemplate[] = [];
        const difficulty = level.expectedDepth;

        // Common behavioral questions applicable to all roles
        const commonTemplates: QuestionTemplate[] = [
            {
                text: 'Tell me about a time when you had to work with a difficult team member. How did you handle it?',
                category: 'Collaboration',
                type: 'behavioral',
                difficulty: difficulty,
                expectedElements: ['situation', 'action', 'result', 'conflict resolution']
            },
            {
                text: 'Describe a situation where you had to learn a new technology or skill quickly. What was your approach?',
                category: 'Learning Agility',
                type: 'behavioral',
                difficulty: difficulty - 1,
                expectedElements: ['learning strategy', 'resources', 'application', 'outcome']
            },
            {
                text: 'Give me an example of a time when you had to make a difficult decision with incomplete information.',
                category: 'Decision Making',
                type: 'behavioral',
                difficulty: difficulty + 1,
                expectedElements: ['context', 'analysis', 'decision', 'outcome']
            },
            {
                text: 'Tell me about a project that failed or didn\'t meet expectations. What did you learn?',
                category: 'Adaptability',
                type: 'behavioral',
                difficulty: difficulty,
                expectedElements: ['failure', 'reflection', 'learning', 'improvement']
            }
        ];

        templates.push(...commonTemplates);

        // Role-specific behavioral questions
        for (const competency of role.behavioralCompetencies.slice(0, 3)) {
            templates.push({
                text: `Describe a situation where you demonstrated strong ${competency.toLowerCase()} skills.`,
                category: competency,
                type: 'behavioral',
                difficulty: difficulty,
                expectedElements: ['situation', 'action', 'result', competency.toLowerCase()]
            });
        }

        return templates;
    }

    /**
     * Generate a resume-aware question that references candidate's experience
     */
    private generateResumeAwareQuestion(
        _role: JobRole,
        level: ExperienceLevel,
        resumeAnalysis: ResumeAnalysis,
        type: 'technical' | 'behavioral'
    ): InterviewQuestion | null {
        if (type === 'technical' && resumeAnalysis.technicalSkills.length > 0) {
            // Pick a random skill from resume
            const skill = resumeAnalysis.technicalSkills[
                Math.floor(Math.random() * resumeAnalysis.technicalSkills.length)
            ];

            const questionText = `I see you have experience with ${skill.name}. Can you describe a challenging problem you solved using ${skill.name} and your approach?`;

            return {
                id: this.generateQuestionId(),
                type: 'technical',
                text: questionText,
                category: skill.category || 'Technical Skills',
                difficulty: level.expectedDepth,
                resumeContext: {
                    section: 'skills',
                    content: skill.name,
                    relevance: `References candidate's stated experience with ${skill.name}`
                },
                expectedElements: ['problem description', 'approach', 'solution', 'outcome']
            };
        } else if (type === 'behavioral') {
            // Try to reference a project or experience
            const strengths = resumeAnalysis.strengths;
            if (strengths.length > 0) {
                const strength = strengths[Math.floor(Math.random() * strengths.length)];
                const evidence = strength.evidence[0] || strength.area;

                const questionText = `Your resume mentions ${evidence}. Can you walk me through that experience and what you learned?`;

                return {
                    id: this.generateQuestionId(),
                    type: 'behavioral',
                    text: questionText,
                    category: strength.area,
                    difficulty: level.expectedDepth,
                    resumeContext: {
                        section: 'experience',
                        content: evidence,
                        relevance: `References candidate's stated experience in ${strength.area}`
                    },
                    expectedElements: ['context', 'actions', 'challenges', 'results', 'learning']
                };
            }
        }

        return null;
    }

    /**
     * Select random templates from a list
     */
    private selectRandomTemplates(templates: QuestionTemplate[], count: number): QuestionTemplate[] {
        const shuffled = [...templates].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, Math.min(count, templates.length));
    }

    /**
     * Create an InterviewQuestion from a template
     */
    private createQuestionFromTemplate(template: QuestionTemplate): InterviewQuestion {
        return {
            id: this.generateQuestionId(),
            type: template.type,
            text: template.text,
            category: template.category,
            difficulty: template.difficulty,
            expectedElements: template.expectedElements
        };
    }

    /**
     * Shuffle questions to mix technical and behavioral
     */
    private shuffleQuestions(questions: InterviewQuestion[]): InterviewQuestion[] {
        // Fisher-Yates shuffle for better randomization
        const shuffled = [...questions];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    /**
     * Generate a unique question ID
     */
    private generateQuestionId(): QuestionId {
        return `q-${Date.now()}-${this.questionIdCounter++}`;
    }

    /**
     * Extract technical terms/technologies mentioned in response
     */
    private extractTechnicalMentions(responseText: string): string[] {
        const text = responseText.toLowerCase();
        const mentions: string[] = [];

        // Common technologies and frameworks to look for
        const technicalTerms = [
            'react', 'angular', 'vue', 'node', 'express', 'django', 'flask',
            'spring', 'kubernetes', 'docker', 'aws', 'azure', 'gcp',
            'postgresql', 'mongodb', 'redis', 'elasticsearch', 'kafka',
            'graphql', 'rest', 'grpc', 'microservices', 'serverless',
            'terraform', 'ansible', 'jenkins', 'github actions', 'gitlab ci',
            'python', 'java', 'javascript', 'typescript', 'go', 'rust',
            'machine learning', 'deep learning', 'neural network', 'tensorflow',
            'pytorch', 'scikit-learn', 'pandas', 'numpy', 'spark',
            'sql', 'nosql', 'api', 'authentication', 'authorization',
            'oauth', 'jwt', 'websocket', 'http', 'tcp', 'udp'
        ];

        for (const term of technicalTerms) {
            const regex = new RegExp(`\\b${term}\\b`, 'i');
            if (regex.test(text)) {
                mentions.push(term);
            }
        }

        // Return unique mentions (first 3 for focus)
        return [...new Set(mentions)].slice(0, 3);
    }

    /**
     * Generate technical follow-up probing deeper into mentioned technologies
     */
    private generateTechnicalFollowUp(
        question: InterviewQuestion,
        _response: CandidateResponse,
        technicalMentions: string[]
    ): InterviewQuestion {
        const technology = technicalMentions[0]; // Focus on first mentioned tech

        // Templates for technical follow-ups
        const templates = [
            `You mentioned ${technology}. Can you explain how you used ${technology} specifically in that context?`,
            `Interesting that you used ${technology}. What were the key challenges you faced with ${technology}?`,
            `Can you dive deeper into your experience with ${technology}? What alternatives did you consider?`,
            `Tell me more about your ${technology} implementation. What design decisions did you make?`,
            `You brought up ${technology}. How did you handle scalability/performance with ${technology}?`,
            `Can you elaborate on the ${technology} architecture you designed? What were the trade-offs?`
        ];

        // Select random template
        const template = templates[Math.floor(Math.random() * templates.length)];

        return {
            id: this.generateQuestionId(),
            type: question.type,
            text: template,
            category: question.category,
            difficulty: question.difficulty,
            expectedElements: [
                'specific implementation details',
                'challenges faced',
                'technical decisions',
                'outcomes'
            ]
        };
    }

    /**
     * Generate elaboration follow-up for low-quality responses
     */
    private generateElaborationFollowUp(
        question: InterviewQuestion,
        _response: CandidateResponse,
        evaluation: ResponseEvaluation
    ): InterviewQuestion {
        const reason = evaluation.followUpReason || 'insufficient detail';

        // Determine which aspect needs elaboration
        let template: string;

        if (reason.includes('depth') || reason.includes('technical detail')) {
            // Need more depth
            const depthTemplates = [
                'Can you provide more detail about your approach?',
                'Could you elaborate on the technical aspects of your solution?',
                'Can you walk me through your thought process in more depth?',
                'What specific steps did you take to solve this problem?',
                'Can you explain the technical implementation in more detail?'
            ];
            template = depthTemplates[Math.floor(Math.random() * depthTemplates.length)];
        } else if (reason.includes('incomplete') || reason.includes('coverage')) {
            // Need more completeness
            const completenessTemplates = [
                'Can you tell me more about the outcome and results?',
                'What was the impact of your solution?',
                'Can you describe the full context and how you approached it?',
                'What challenges did you face and how did you overcome them?',
                'Can you provide a more complete picture of the situation?'
            ];
            template = completenessTemplates[Math.floor(Math.random() * completenessTemplates.length)];
        } else if (reason.includes('unclear')) {
            // Need more clarity
            const clarityTemplates = [
                'Can you clarify what you mean by that?',
                'Could you explain that in a different way?',
                'Can you break that down into simpler terms?',
                'I want to make sure I understand - can you rephrase that?',
                'Can you provide a concrete example to illustrate your point?'
            ];
            template = clarityTemplates[Math.floor(Math.random() * clarityTemplates.length)];
        } else {
            // General elaboration
            const generalTemplates = [
                'Can you tell me more about that?',
                'Could you expand on your answer?',
                'Can you provide more details?',
                'I\'d like to hear more about your experience with this.',
                'Can you elaborate on that point?'
            ];
            template = generalTemplates[Math.floor(Math.random() * generalTemplates.length)];
        }

        return {
            id: this.generateQuestionId(),
            type: question.type,
            text: template,
            category: question.category,
            difficulty: question.difficulty,
            expectedElements: question.expectedElements
        };
    }
}
