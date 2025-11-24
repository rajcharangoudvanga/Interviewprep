import {
    ResumeDocument,
    ParsedResume,
    Skill,
    WorkExperience,
    Project,
    Achievement,
    JobRole,
    Strength,
    Gap,
    AlignmentScore,
    ResumeAnalysis
} from '../models/types';

/**
 * Error thrown when resume parsing fails
 */
export class ResumeParsingError extends Error {
    constructor(
        message: string,
        public originalError?: Error
    ) {
        super(message);
        this.name = 'ResumeParsingError';
    }
}

/**
 * ResumeParser extracts structured information from resume documents
 */
export class ResumeParser {
    /**
     * Parse a resume document into structured format
     * @throws ResumeParsingError if parsing fails critically
     */
    parse(document: ResumeDocument): ParsedResume {
        try {
            // For text-based resumes, extract sections
            const sections = this.extractSections(document.content);

            return {
                rawText: document.content,
                sections,
                metadata: {
                    parsedAt: Date.now(),
                    format: document.format
                }
            };
        } catch (error) {
            throw new ResumeParsingError(
                'Failed to parse resume document',
                error as Error
            );
        }
    }

    /**
     * Extract sections from resume text
     */
    private extractSections(content: string): Map<string, string> {
        const sections = new Map<string, string>();

        // Common section headers (case-insensitive)
        const sectionPatterns = [
            { key: 'summary', patterns: ['summary', 'profile', 'objective', 'about'] },
            { key: 'experience', patterns: ['experience', 'work history', 'employment', 'work experience'] },
            { key: 'education', patterns: ['education', 'academic', 'qualifications'] },
            { key: 'skills', patterns: ['skills', 'technical skills', 'competencies', 'expertise'] },
            { key: 'projects', patterns: ['projects', 'portfolio', 'work samples'] },
            { key: 'achievements', patterns: ['achievements', 'accomplishments', 'awards', 'honors'] },
            { key: 'certifications', patterns: ['certifications', 'certificates', 'licenses'] }
        ];

        const lines = content.split('\n');
        let currentSection = 'header';
        let currentContent: string[] = [];

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();

            // Check if this line is a section header
            let foundSection = false;
            for (const { key, patterns } of sectionPatterns) {
                if (patterns.some(pattern =>
                    line.toLowerCase().includes(pattern) &&
                    line.length < 50 // Section headers are typically short
                )) {
                    // Save previous section
                    if (currentContent.length > 0) {
                        sections.set(currentSection, currentContent.join('\n'));
                    }

                    currentSection = key;
                    currentContent = [];
                    foundSection = true;
                    break;
                }
            }

            if (!foundSection && line.length > 0) {
                currentContent.push(line);
            }
        }

        // Save last section
        if (currentContent.length > 0) {
            sections.set(currentSection, currentContent.join('\n'));
        }

        return sections;
    }

    /**
     * Extract skills from parsed resume
     */
    extractSkills(parsedResume: ParsedResume): Skill[] {
        const skills: Skill[] = [];
        const skillsSection = parsedResume.sections.get('skills') || '';

        if (!skillsSection) {
            // Try to extract from other sections
            return this.extractSkillsFromFullText(parsedResume.rawText);
        }

        // Common skill categories
        const categories = [
            { name: 'Programming Languages', keywords: ['python', 'java', 'javascript', 'typescript', 'c++', 'c#', 'ruby', 'go', 'rust', 'php', 'swift', 'kotlin'] },
            { name: 'Frameworks', keywords: ['react', 'angular', 'vue', 'django', 'flask', 'spring', 'express', 'node', 'next.js', 'nest.js'] },
            { name: 'Databases', keywords: ['sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'dynamodb', 'cassandra', 'oracle'] },
            { name: 'Cloud', keywords: ['aws', 'azure', 'gcp', 'cloud', 'docker', 'kubernetes', 'terraform'] },
            { name: 'Tools', keywords: ['git', 'jenkins', 'jira', 'confluence', 'webpack', 'babel', 'gradle', 'maven'] },
            { name: 'Data Science', keywords: ['machine learning', 'deep learning', 'tensorflow', 'pytorch', 'scikit-learn', 'pandas', 'numpy', 'r'] },
            { name: 'Soft Skills', keywords: ['leadership', 'communication', 'agile', 'scrum', 'team', 'collaboration'] }
        ];

        const lowerSkillsSection = skillsSection.toLowerCase();

        for (const category of categories) {
            for (const keyword of category.keywords) {
                if (lowerSkillsSection.includes(keyword)) {
                    skills.push({
                        name: keyword.charAt(0).toUpperCase() + keyword.slice(1),
                        category: category.name
                    });
                }
            }
        }

        return skills;
    }

    /**
     * Extract skills from full resume text when skills section is not found
     */
    private extractSkillsFromFullText(text: string): Skill[] {
        const skills: Skill[] = [];
        const lowerText = text.toLowerCase();

        // Common technical skills to look for
        const commonSkills = [
            { name: 'Python', category: 'Programming Languages' },
            { name: 'JavaScript', category: 'Programming Languages' },
            { name: 'TypeScript', category: 'Programming Languages' },
            { name: 'Java', category: 'Programming Languages' },
            { name: 'React', category: 'Frameworks' },
            { name: 'Node.js', category: 'Frameworks' },
            { name: 'SQL', category: 'Databases' },
            { name: 'AWS', category: 'Cloud' },
            { name: 'Docker', category: 'Cloud' },
            { name: 'Git', category: 'Tools' }
        ];

        for (const skill of commonSkills) {
            if (lowerText.includes(skill.name.toLowerCase())) {
                skills.push(skill);
            }
        }

        return skills;
    }

    /**
     * Extract work experience from parsed resume
     */
    extractExperience(parsedResume: ParsedResume): WorkExperience[] {
        const experiences: WorkExperience[] = [];
        const experienceSection = parsedResume.sections.get('experience') || '';

        if (!experienceSection) {
            return experiences;
        }

        // Split by common delimiters (double newlines, bullet points, etc.)
        const entries = experienceSection.split(/\n\n+/);

        for (const entry of entries) {
            if (entry.trim().length < 20) continue; // Skip very short entries

            const lines = entry.split('\n').map(l => l.trim()).filter(l => l.length > 0);
            if (lines.length === 0) continue;

            // First line often contains company and title
            const firstLine = lines[0];

            // Try to extract company and title
            let company = 'Unknown Company';
            let title = 'Unknown Title';

            // Common patterns: "Title at Company" or "Company - Title"
            if (firstLine.includes(' at ')) {
                const parts = firstLine.split(' at ');
                title = parts[0].trim();
                company = parts[1].trim();
            } else if (firstLine.includes(' - ')) {
                const parts = firstLine.split(' - ');
                company = parts[0].trim();
                title = parts[1].trim();
            } else {
                // Use first line as title
                title = firstLine;
            }

            // Look for duration in second line or within entry
            let duration = '';
            const durationPattern = /\d{4}|\d{1,2}\/\d{4}|present|current/i;
            for (const line of lines) {
                if (durationPattern.test(line)) {
                    duration = line;
                    break;
                }
            }

            // Rest is description
            const description = lines.slice(1).join('\n');

            experiences.push({
                company,
                title,
                duration,
                description,
                technologies: this.extractTechnologiesFromText(description)
            });
        }

        return experiences;
    }

    /**
     * Extract technologies mentioned in text
     */
    private extractTechnologiesFromText(text: string): string[] {
        const technologies: string[] = [];
        const lowerText = text.toLowerCase();

        const commonTech = [
            'Python', 'JavaScript', 'TypeScript', 'Java', 'C++', 'C#', 'Ruby', 'Go',
            'React', 'Angular', 'Vue', 'Django', 'Flask', 'Spring', 'Express',
            'SQL', 'MySQL', 'PostgreSQL', 'MongoDB', 'Redis',
            'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes',
            'Git', 'Jenkins', 'CI/CD'
        ];

        for (const tech of commonTech) {
            if (lowerText.includes(tech.toLowerCase())) {
                technologies.push(tech);
            }
        }

        return [...new Set(technologies)]; // Remove duplicates
    }

    /**
     * Extract projects from parsed resume
     */
    extractProjects(parsedResume: ParsedResume): Project[] {
        const projects: Project[] = [];
        const projectsSection = parsedResume.sections.get('projects') || '';

        if (!projectsSection) {
            return projects;
        }

        const entries = projectsSection.split(/\n\n+/);

        for (const entry of entries) {
            if (entry.trim().length < 20) continue;

            const lines = entry.split('\n').map(l => l.trim()).filter(l => l.length > 0);
            if (lines.length === 0) continue;

            const name = lines[0];
            const description = lines.slice(1).join('\n');
            const technologies = this.extractTechnologiesFromText(entry);

            projects.push({
                name,
                description,
                technologies
            });
        }

        return projects;
    }

    /**
     * Extract achievements from parsed resume
     */
    extractAchievements(parsedResume: ParsedResume): Achievement[] {
        const achievements: Achievement[] = [];
        const achievementsSection = parsedResume.sections.get('achievements') || '';

        if (!achievementsSection) {
            return achievements;
        }

        // Split by bullet points or newlines
        const entries = achievementsSection.split(/\n+/).filter(e => e.trim().length > 0);

        for (const entry of entries) {
            const cleaned = entry.replace(/^[•\-\*]\s*/, '').trim();
            if (cleaned.length < 10) continue;

            achievements.push({
                description: cleaned
            });
        }

        return achievements;
    }
}

/**
 * ResumeAnalyzer evaluates resumes against job role requirements
 */
export class ResumeAnalyzer {
    private parser: ResumeParser;

    constructor() {
        this.parser = new ResumeParser();
    }

    /**
     * Analyze a resume for a specific job role
     * Handles parsing errors gracefully by returning partial analysis
     */
    analyzeForRole(document: ResumeDocument, role: JobRole): ResumeAnalysis {
        try {
            const parsedResume = this.parser.parse(document);
            const skills = this.parser.extractSkills(parsedResume);
            const experience = this.parser.extractExperience(parsedResume);
            const projects = this.parser.extractProjects(parsedResume);

            const strengths = this.identifyStrengths(parsedResume, role, skills, experience, projects);
            const gaps = this.identifyGaps(parsedResume, role, skills);
            const alignmentScore = this.calculateAlignment(skills, experience, role);
            const summary = this.generateSummary(strengths, gaps, alignmentScore);

            return {
                parsedResume,
                strengths,
                technicalSkills: skills,
                gaps,
                alignmentScore,
                summary
            };
        } catch (error) {
            // Graceful degradation: return minimal analysis
            if (error instanceof ResumeParsingError) {
                // Create a minimal parsed resume
                const minimalParsed: ParsedResume = {
                    rawText: document.content,
                    sections: new Map(),
                    metadata: {
                        parsedAt: Date.now(),
                        format: document.format
                    }
                };

                return {
                    parsedResume: minimalParsed,
                    strengths: [],
                    technicalSkills: [],
                    gaps: role.technicalSkills.map(skill => ({
                        skill,
                        importance: 8,
                        suggestion: `Consider adding ${skill} to your resume or gaining experience in this area.`
                    })),
                    alignmentScore: {
                        overall: 0,
                        technical: 0,
                        experience: 0,
                        cultural: 0
                    },
                    summary: 'Resume parsing encountered errors. Analysis is limited. Please ensure your resume is properly formatted.'
                };
            }
            throw error;
        }
    }

    /**
     * Identify strengths based on resume content and role requirements
     */
    identifyStrengths(
        _parsedResume: ParsedResume,
        role: JobRole,
        skills: Skill[],
        experience: WorkExperience[],
        projects: Project[]
    ): Strength[] {
        const strengths: Strength[] = [];

        // Check technical skills alignment
        const matchedSkills = skills.filter(skill =>
            role.technicalSkills.some(roleSkill =>
                roleSkill.toLowerCase().includes(skill.name.toLowerCase()) ||
                skill.name.toLowerCase().includes(roleSkill.toLowerCase())
            )
        );

        if (matchedSkills.length > 0) {
            strengths.push({
                area: 'Technical Skills',
                evidence: matchedSkills.map(s => s.name),
                relevance: Math.min(10, (matchedSkills.length / role.technicalSkills.length) * 10)
            });
        }

        // Check experience relevance
        if (experience.length > 0) {
            const relevantExperience = experience.filter(exp =>
                exp.technologies && exp.technologies.some(tech =>
                    role.technicalSkills.some(roleSkill =>
                        roleSkill.toLowerCase().includes(tech.toLowerCase())
                    )
                )
            );

            if (relevantExperience.length > 0) {
                strengths.push({
                    area: 'Relevant Experience',
                    evidence: relevantExperience.map(exp => `${exp.title} at ${exp.company}`),
                    relevance: Math.min(10, (relevantExperience.length / experience.length) * 10)
                });
            }
        }

        // Check projects
        if (projects.length > 0) {
            const relevantProjects = projects.filter(proj =>
                proj.technologies.some(tech =>
                    role.technicalSkills.some(roleSkill =>
                        roleSkill.toLowerCase().includes(tech.toLowerCase())
                    )
                )
            );

            if (relevantProjects.length > 0) {
                strengths.push({
                    area: 'Project Experience',
                    evidence: relevantProjects.map(p => p.name),
                    relevance: Math.min(10, (relevantProjects.length / projects.length) * 10)
                });
            }
        }

        return strengths;
    }

    /**
     * Identify gaps between resume and role requirements
     */
    identifyGaps(_parsedResume: ParsedResume, role: JobRole, skills: Skill[]): Gap[] {
        const gaps: Gap[] = [];
        const skillNames = skills.map(s => s.name.toLowerCase());

        // Find missing technical skills
        for (const roleSkill of role.technicalSkills) {
            const hasSkill = skillNames.some(skillName =>
                skillName.includes(roleSkill.toLowerCase()) ||
                roleSkill.toLowerCase().includes(skillName)
            );

            if (!hasSkill) {
                gaps.push({
                    skill: roleSkill,
                    importance: 7, // Default importance
                    suggestion: `Consider adding ${roleSkill} to your skillset or highlighting relevant experience with this technology.`
                });
            }
        }

        return gaps;
    }

    /**
     * Calculate alignment score between resume and role
     */
    calculateAlignment(skills: Skill[], experience: WorkExperience[], role: JobRole): AlignmentScore {
        // Technical alignment: percentage of role skills found in resume
        const matchedSkills = skills.filter(skill =>
            role.technicalSkills.some(roleSkill =>
                roleSkill.toLowerCase().includes(skill.name.toLowerCase()) ||
                skill.name.toLowerCase().includes(roleSkill.toLowerCase())
            )
        );
        const technical = role.technicalSkills.length > 0
            ? (matchedSkills.length / role.technicalSkills.length) * 100
            : 0;

        // Experience alignment: based on number of relevant experiences
        const experienceScore = Math.min(100, experience.length * 25);

        // Cultural alignment: placeholder (would need more sophisticated analysis)
        const cultural = 70; // Default moderate score

        // Overall: weighted average
        const overall = (technical * 0.5 + experienceScore * 0.3 + cultural * 0.2);

        return {
            overall: Math.round(overall),
            technical: Math.round(technical),
            experience: Math.round(experienceScore),
            cultural: Math.round(cultural)
        };
    }

    /**
     * Generate a summary of the resume analysis
     */
    private generateSummary(strengths: Strength[], gaps: Gap[], alignmentScore: AlignmentScore): string {
        const parts: string[] = [];

        parts.push(`Overall alignment score: ${alignmentScore.overall}%`);

        if (strengths.length > 0) {
            const strengthAreas = strengths.map(s => s.area).join(', ');
            parts.push(`Key strengths identified: ${strengthAreas}.`);
        } else {
            parts.push('Limited alignment with role requirements detected.');
        }

        if (gaps.length > 0) {
            parts.push(`${gaps.length} skill gap(s) identified for improvement.`);
        } else {
            parts.push('Strong technical alignment with role requirements.');
        }

        return parts.join(' ');
    }
}
