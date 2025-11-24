/**
 * Sample Job Roles with Question Banks
 * 
 * This file contains example job role configurations that can be used
 * to demonstrate the InterviewPrepAI system.
 */

import { JobRole } from '../src/models/types';

/**
 * Software Engineer role with comprehensive question bank
 */
export const softwareEngineerRole: JobRole = {
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
        'API Design'
    ],
    behavioralCompetencies: [
        'Problem Solving',
        'Collaboration',
        'Communication',
        'Time Management',
        'Adaptability',
        'Learning Agility'
    ],
    questionCategories: [
        { name: 'Algorithms', weight: 0.25, technicalFocus: true },
        { name: 'System Design', weight: 0.25, technicalFocus: true },
        { name: 'Coding Practices', weight: 0.20, technicalFocus: true },
        { name: 'Teamwork', weight: 0.15, technicalFocus: false },
        { name: 'Problem Solving', weight: 0.15, technicalFocus: false }
    ]
};

/**
 * Product Manager role with question bank
 */
export const productManagerRole: JobRole = {
    id: 'product-manager',
    name: 'Product Manager',
    technicalSkills: [
        'Product Strategy',
        'Market Analysis',
        'User Research',
        'Data Analysis',
        'Roadmap Planning',
        'Metrics & KPIs',
        'Agile Methodologies'
    ],
    behavioralCompetencies: [
        'Leadership',
        'Stakeholder Management',
        'Communication',
        'Decision Making',
        'Prioritization',
        'Conflict Resolution'
    ],
    questionCategories: [
        { name: 'Product Strategy', weight: 0.30, technicalFocus: true },
        { name: 'User Research', weight: 0.20, technicalFocus: true },
        { name: 'Leadership', weight: 0.25, technicalFocus: false },
        { name: 'Stakeholder Management', weight: 0.25, technicalFocus: false }
    ]
};

/**
 * Data Scientist role with question bank
 */
export const dataScientistRole: JobRole = {
    id: 'data-scientist',
    name: 'Data Scientist',
    technicalSkills: [
        'Machine Learning',
        'Statistics',
        'Python/R',
        'Data Visualization',
        'SQL',
        'Feature Engineering',
        'Model Evaluation',
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
        { name: 'Machine Learning', weight: 0.30, technicalFocus: true },
        { name: 'Statistics', weight: 0.25, technicalFocus: true },
        { name: 'Data Analysis', weight: 0.20, technicalFocus: true },
        { name: 'Communication', weight: 0.15, technicalFocus: false },
        { name: 'Business Impact', weight: 0.10, technicalFocus: false }
    ]
};

/**
 * All sample roles
 */
export const sampleRoles = [
    softwareEngineerRole,
    productManagerRole,
    dataScientistRole
];
