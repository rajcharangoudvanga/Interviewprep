import { JobRole, ExperienceLevel } from './types';

/**
 * Predefined job roles with their technical skills, behavioral competencies,
 * and question categories
 */
const PREDEFINED_ROLES: JobRole[] = [
    {
        id: 'software-engineer',
        name: 'Software Engineer',
        technicalSkills: [
            'Data Structures',
            'Algorithms',
            'System Design',
            'Programming Languages',
            'Testing',
            'Version Control',
            'Debugging',
            'Code Review'
        ],
        behavioralCompetencies: [
            'Problem Solving',
            'Collaboration',
            'Communication',
            'Adaptability',
            'Time Management',
            'Learning Agility'
        ],
        questionCategories: [
            { name: 'Coding', weight: 0.4, technicalFocus: true },
            { name: 'System Design', weight: 0.3, technicalFocus: true },
            { name: 'Behavioral', weight: 0.2, technicalFocus: false },
            { name: 'Problem Solving', weight: 0.1, technicalFocus: true }
        ]
    },
    {
        id: 'product-manager',
        name: 'Product Manager',
        technicalSkills: [
            'Product Strategy',
            'Market Analysis',
            'User Research',
            'Data Analysis',
            'Roadmap Planning',
            'Metrics & KPIs',
            'A/B Testing',
            'Technical Literacy'
        ],
        behavioralCompetencies: [
            'Leadership',
            'Stakeholder Management',
            'Communication',
            'Decision Making',
            'Prioritization',
            'Influence',
            'Customer Empathy'
        ],
        questionCategories: [
            { name: 'Product Strategy', weight: 0.3, technicalFocus: true },
            { name: 'Execution', weight: 0.25, technicalFocus: false },
            { name: 'Leadership', weight: 0.25, technicalFocus: false },
            { name: 'Analytics', weight: 0.2, technicalFocus: true }
        ]
    },
    {
        id: 'data-scientist',
        name: 'Data Scientist',
        technicalSkills: [
            'Machine Learning',
            'Statistics',
            'Python/R',
            'SQL',
            'Data Visualization',
            'Feature Engineering',
            'Model Evaluation',
            'Big Data Technologies',
            'Deep Learning'
        ],
        behavioralCompetencies: [
            'Analytical Thinking',
            'Communication',
            'Business Acumen',
            'Collaboration',
            'Curiosity',
            'Problem Solving'
        ],
        questionCategories: [
            { name: 'Machine Learning', weight: 0.35, technicalFocus: true },
            { name: 'Statistics', weight: 0.25, technicalFocus: true },
            { name: 'Coding', weight: 0.2, technicalFocus: true },
            { name: 'Behavioral', weight: 0.2, technicalFocus: false }
        ]
    },
    {
        id: 'frontend-engineer',
        name: 'Frontend Engineer',
        technicalSkills: [
            'HTML/CSS',
            'JavaScript/TypeScript',
            'React/Vue/Angular',
            'Responsive Design',
            'Web Performance',
            'Accessibility',
            'State Management',
            'Testing',
            'Build Tools'
        ],
        behavioralCompetencies: [
            'Attention to Detail',
            'User Empathy',
            'Collaboration',
            'Communication',
            'Problem Solving',
            'Adaptability'
        ],
        questionCategories: [
            { name: 'UI Development', weight: 0.35, technicalFocus: true },
            { name: 'JavaScript', weight: 0.3, technicalFocus: true },
            { name: 'Design & UX', weight: 0.2, technicalFocus: true },
            { name: 'Behavioral', weight: 0.15, technicalFocus: false }
        ]
    },
    {
        id: 'backend-engineer',
        name: 'Backend Engineer',
        technicalSkills: [
            'API Design',
            'Database Design',
            'System Architecture',
            'Security',
            'Performance Optimization',
            'Microservices',
            'Cloud Services',
            'Testing',
            'DevOps'
        ],
        behavioralCompetencies: [
            'Problem Solving',
            'Collaboration',
            'Communication',
            'Reliability',
            'Scalability Mindset',
            'Learning Agility'
        ],
        questionCategories: [
            { name: 'System Design', weight: 0.35, technicalFocus: true },
            { name: 'API Development', weight: 0.3, technicalFocus: true },
            { name: 'Database', weight: 0.2, technicalFocus: true },
            { name: 'Behavioral', weight: 0.15, technicalFocus: false }
        ]
    },
    {
        id: 'devops-engineer',
        name: 'DevOps Engineer',
        technicalSkills: [
            'CI/CD',
            'Infrastructure as Code',
            'Cloud Platforms',
            'Containerization',
            'Monitoring & Logging',
            'Scripting',
            'Security',
            'Networking',
            'Automation'
        ],
        behavioralCompetencies: [
            'Problem Solving',
            'Collaboration',
            'Communication',
            'Reliability',
            'Process Improvement',
            'Incident Management'
        ],
        questionCategories: [
            { name: 'Infrastructure', weight: 0.35, technicalFocus: true },
            { name: 'Automation', weight: 0.3, technicalFocus: true },
            { name: 'Troubleshooting', weight: 0.2, technicalFocus: true },
            { name: 'Behavioral', weight: 0.15, technicalFocus: false }
        ]
    }
];

/**
 * Predefined experience levels with their characteristics
 */
const EXPERIENCE_LEVELS: ExperienceLevel[] = [
    {
        level: 'entry',
        yearsMin: 0,
        yearsMax: 2,
        expectedDepth: 3
    },
    {
        level: 'mid',
        yearsMin: 2,
        yearsMax: 5,
        expectedDepth: 6
    },
    {
        level: 'senior',
        yearsMin: 5,
        yearsMax: 10,
        expectedDepth: 8
    },
    {
        level: 'lead',
        yearsMin: 10,
        yearsMax: 100,
        expectedDepth: 10
    }
];

/**
 * Error thrown when invalid role or level input is provided
 */
export class InvalidRoleInputError extends Error {
    constructor(
        message: string,
        public availableOptions: string[]
    ) {
        super(message);
        this.name = 'InvalidRoleInputError';
    }
}

/**
 * RoleManager handles job role and experience level management,
 * including validation and retrieval of predefined roles
 */
export class RoleManager {
    private roles: Map<string, JobRole>;
    private levels: Map<string, ExperienceLevel>;

    constructor() {
        this.roles = new Map();
        this.levels = new Map();

        // Initialize with predefined roles
        PREDEFINED_ROLES.forEach(role => {
            this.roles.set(role.id, role);
        });

        // Initialize with predefined levels
        EXPERIENCE_LEVELS.forEach(level => {
            this.levels.set(level.level, level);
        });
    }

    /**
     * Get all available job roles
     */
    getAvailableRoles(): JobRole[] {
        return Array.from(this.roles.values());
    }

    /**
     * Get all available experience levels
     */
    getAvailableExperienceLevels(): ExperienceLevel[] {
        return Array.from(this.levels.values());
    }

    /**
     * Get a specific job role by ID
     * @throws InvalidRoleInputError if role ID is invalid
     */
    getRoleById(roleId: string): JobRole {
        const role = this.roles.get(roleId);
        if (!role) {
            const availableRoleIds = Array.from(this.roles.keys());
            throw new InvalidRoleInputError(
                `Invalid role ID: "${roleId}". Please select from available options.`,
                availableRoleIds
            );
        }
        return role;
    }

    /**
     * Get a specific job role by name (case-insensitive)
     * @throws InvalidRoleInputError if role name is invalid
     */
    getRoleByName(roleName: string): JobRole {
        const normalizedName = roleName.toLowerCase().trim();
        const role = Array.from(this.roles.values()).find(
            r => r.name.toLowerCase() === normalizedName
        );

        if (!role) {
            const availableRoleNames = Array.from(this.roles.values()).map(r => r.name);
            throw new InvalidRoleInputError(
                `Invalid role name: "${roleName}". Please select from available options.`,
                availableRoleNames
            );
        }
        return role;
    }

    /**
     * Get a specific experience level
     * @throws InvalidRoleInputError if level is invalid
     */
    getExperienceLevel(level: string): ExperienceLevel {
        const normalizedLevel = level.toLowerCase().trim() as 'entry' | 'mid' | 'senior' | 'lead';
        const experienceLevel = this.levels.get(normalizedLevel);

        if (!experienceLevel) {
            const availableLevels = Array.from(this.levels.keys());
            throw new InvalidRoleInputError(
                `Invalid experience level: "${level}". Please select from available options.`,
                availableLevels
            );
        }
        return experienceLevel;
    }

    /**
     * Validate role ID
     */
    isValidRoleId(roleId: string): boolean {
        return this.roles.has(roleId);
    }

    /**
     * Validate role name
     */
    isValidRoleName(roleName: string): boolean {
        const normalizedName = roleName.toLowerCase().trim();
        return Array.from(this.roles.values()).some(
            r => r.name.toLowerCase() === normalizedName
        );
    }

    /**
     * Validate experience level
     */
    isValidExperienceLevel(level: string): boolean {
        const normalizedLevel = level.toLowerCase().trim();
        return this.levels.has(normalizedLevel as 'entry' | 'mid' | 'senior' | 'lead');
    }

    /**
     * Get role and level names for display
     */
    getRoleDisplayNames(): string[] {
        return Array.from(this.roles.values()).map(r => r.name);
    }

    /**
     * Get experience level names for display
     */
    getExperienceLevelDisplayNames(): string[] {
        return Array.from(this.levels.keys());
    }
}
