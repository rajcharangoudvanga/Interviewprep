/**
 * Basic usage example for InterviewPrepAI
 * 
 * This example demonstrates a complete interview flow from start to finish.
 */

import { createInterviewPrepAI, ResumeDocument } from '../src/index';

async function runBasicInterview() {
    console.log('=== InterviewPrepAI Basic Usage Example ===\n');

    // Create an instance with debug logging enabled
    const interviewAI = createInterviewPrepAI({
        debug: true
    });

    // Step 1: View available roles and levels
    console.log('Available Roles:');
    const roles = interviewAI.getAvailableRoles();
    roles.forEach(role => {
        console.log(`  - ${role.name} (${role.id})`);
    });

    console.log('\nAvailable Experience Levels:');
    const levels = interviewAI.getAvailableExperienceLevels();
    levels.forEach(level => {
        console.log(`  - ${level.level} (${level.yearsMin}-${level.yearsMax} years)`);
    });

    // Step 2: Create a session
    console.log('\n--- Creating Session ---');
    const sessionId = interviewAI.createSession('software-engineer', 'mid');
    console.log(`Session created: ${sessionId}`);

    // Step 3: Optional - Upload resume
    console.log('\n--- Uploading Resume ---');
    const resume: ResumeDocument = {
        content: `
            John Doe
            Software Engineer
            
            SKILLS
            Programming Languages: Python, JavaScript, TypeScript, Java
            Frameworks: React, Node.js, Express, Django
            Databases: PostgreSQL, MongoDB, Redis
            Cloud: AWS, Docker, Kubernetes
            Tools: Git, Jenkins, JIRA
            
            EXPERIENCE
            Senior Software Engineer at Tech Corp
            2020 - Present
            - Built scalable web applications using React and Node.js
            - Designed and implemented RESTful APIs serving 1M+ requests/day
            - Led migration to microservices architecture on AWS
            - Mentored junior developers and conducted code reviews
            
            Software Engineer at StartupCo
            2018 - 2020
            - Developed full-stack features using Django and React
            - Optimized database queries reducing response time by 40%
            - Implemented CI/CD pipeline using Jenkins and Docker
            
            PROJECTS
            E-commerce Platform
            - Built a scalable e-commerce platform using React, Node.js, and PostgreSQL
            - Implemented payment processing with Stripe
            - Deployed on AWS with auto-scaling
            
            Real-time Chat Application
            - Created a real-time chat app using WebSockets and Redis
            - Handled 10K+ concurrent connections
            - Implemented message persistence and search
        `,
        format: 'text',
        filename: 'john_doe_resume.txt'
    };

    const analysis = interviewAI.uploadResume(sessionId, resume);
    console.log(`Resume analyzed. Alignment score: ${analysis.alignmentScore.overall}%`);
    console.log(`Technical skills found: ${analysis.technicalSkills.length}`);
    console.log(`Strengths identified: ${analysis.strengths.length}`);
    console.log(`Gaps identified: ${analysis.gaps.length}`);

    // Step 4: Start the interview
    console.log('\n--- Starting Interview ---');
    let currentQuestion = interviewAI.startInterview(sessionId);

    const progress = interviewAI.getProgress(sessionId);
    console.log(`Total questions: ${progress.totalQuestions}`);
    console.log(`Expected duration: ${Math.round(interviewAI.getExpectedDuration(sessionId) / 60000)} minutes`);

    // Step 5: Answer questions (simulated)
    const sampleResponses = [
        'I would approach this problem by first analyzing the requirements and understanding the constraints. Then I would design a solution using appropriate data structures like hash maps for O(1) lookups and arrays for ordered data. I have experience implementing similar solutions in my previous projects at Tech Corp where we optimized API response times.',

        'In my role at Tech Corp, I led a team migration to microservices. The main challenge was maintaining data consistency across services. We implemented the Saga pattern for distributed transactions and used message queues for async communication. This improved our system scalability and reduced deployment risks.',

        'When working with a difficult team member, I focus on understanding their perspective first. In one case, a colleague was resistant to code reviews. I scheduled a one-on-one to understand their concerns, explained the benefits, and we agreed on a lighter review process initially. Over time, they became one of our best reviewers.',

        'I stay current by reading technical blogs, contributing to open source, and building side projects. Recently, I learned Kubernetes by deploying my personal projects on a cluster. I also attend local meetups and conferences when possible.',

        'For system design, I start with requirements gathering - both functional and non-functional. Then I identify the core components, data models, and APIs. I consider scalability, reliability, and security from the start. For example, when designing our e-commerce platform, we used CDN for static assets, Redis for caching, and implemented rate limiting for API protection.'
    ];

    let questionCount = 0;
    let action;

    while (questionCount < sampleResponses.length) {
        console.log(`\n--- Question ${questionCount + 1} ---`);
        console.log(`Type: ${currentQuestion.type}`);
        console.log(`Category: ${currentQuestion.category}`);
        console.log(`Question: ${currentQuestion.text}`);

        if (currentQuestion.resumeContext) {
            console.log(`[Resume Reference: ${currentQuestion.resumeContext.content}]`);
        }

        // Simulate response
        const response = sampleResponses[questionCount];
        console.log(`\nResponse: ${response.substring(0, 100)}...`);

        // Submit response
        action = interviewAI.submitResponse(sessionId, response);

        // Check behavior adaptation
        const behaviorType = interviewAI.getCurrentBehaviorType(sessionId);
        console.log(`Behavior Type: ${behaviorType}`);

        // Show progress
        const currentProgress = interviewAI.getProgress(sessionId);
        console.log(`Progress: ${currentProgress.percentComplete.toFixed(1)}% (${currentProgress.answeredQuestions}/${currentProgress.totalQuestions})`);

        if (action.type === 'next-question') {
            currentQuestion = action.question;
            questionCount++;
        } else if (action.type === 'follow-up') {
            console.log('[Follow-up question generated]');
            currentQuestion = action.question;
            // Don't increment questionCount for follow-ups
        } else if (action.type === 'complete') {
            console.log('\n=== Interview Complete ===');
            break;
        } else if (action.type === 'redirect') {
            console.log(`Redirect: ${action.message}`);
            break;
        }
    }

    // Step 6: Get feedback
    if (action && action.type === 'complete') {
        const feedback = action.feedback;

        console.log('\n=== Feedback Report ===\n');

        // Overall scores
        console.log('OVERALL PERFORMANCE');
        console.log(`Grade: ${feedback.scores.overall.grade}`);
        console.log(`Score: ${feedback.scores.overall.weightedTotal.toFixed(1)}/100`);

        // Communication scores
        console.log('\nCOMMUNICATION SCORES');
        console.log(`  Clarity: ${feedback.scores.communication.clarity.toFixed(1)}/10`);
        console.log(`  Articulation: ${feedback.scores.communication.articulation.toFixed(1)}/10`);
        console.log(`  Structure: ${feedback.scores.communication.structure.toFixed(1)}/10`);
        console.log(`  Professionalism: ${feedback.scores.communication.professionalism.toFixed(1)}/10`);
        console.log(`  Total: ${feedback.scores.communication.total.toFixed(1)}/40 (${feedback.scores.communication.grade})`);

        // Technical scores
        console.log('\nTECHNICAL SCORES');
        console.log(`  Depth: ${feedback.scores.technicalFit.depth.toFixed(1)}/10`);
        console.log(`  Accuracy: ${feedback.scores.technicalFit.accuracy.toFixed(1)}/10`);
        console.log(`  Relevance: ${feedback.scores.technicalFit.relevance.toFixed(1)}/10`);
        console.log(`  Problem Solving: ${feedback.scores.technicalFit.problemSolving.toFixed(1)}/10`);
        console.log(`  Total: ${feedback.scores.technicalFit.total.toFixed(1)}/40 (${feedback.scores.technicalFit.grade})`);

        // Strengths
        console.log('\nSTRENGTHS');
        feedback.strengths.forEach(strength => {
            console.log(`  ✓ ${strength}`);
        });

        // Improvements
        console.log('\nAREAS FOR IMPROVEMENT');
        feedback.improvements.slice(0, 5).forEach(improvement => {
            console.log(`  • ${improvement.category}`);
            console.log(`    ${improvement.suggestion}`);
        });

        // Resume alignment (if available)
        if (feedback.resumeAlignment) {
            console.log('\nRESUME ALIGNMENT');
            console.log(`  Alignment Score: ${feedback.resumeAlignment.alignmentScore}%`);
            console.log(`  Matched Skills: ${feedback.resumeAlignment.matchedSkills.length}`);
            console.log(`  Missing Skills: ${feedback.resumeAlignment.missingSkills.length}`);

            if (feedback.resumeAlignment.suggestions.length > 0) {
                console.log('\n  Suggestions:');
                feedback.resumeAlignment.suggestions.slice(0, 3).forEach(suggestion => {
                    console.log(`    - ${suggestion}`);
                });
            }
        }

        // Summary
        console.log('\nSUMMARY');
        console.log(feedback.summary);
    }

    // Step 7: Continuation options
    console.log('\n--- Continuation Options ---');
    const continuationPrompt = interviewAI.getContinuationOptions(sessionId);
    console.log(continuationPrompt.message);
    continuationPrompt.options.forEach((option, index) => {
        console.log(`  ${index + 1}. ${option.label}`);
        console.log(`     ${option.description}`);
    });

    // Step 8: Cleanup
    console.log('\n--- Cleanup ---');
    interviewAI.cleanupSession(sessionId);
    console.log('Session cleaned up');

    console.log('\n=== Example Complete ===');
}

// Run the example
if (require.main === module) {
    runBasicInterview().catch(error => {
        console.error('Error running example:', error);
        process.exit(1);
    });
}

export { runBasicInterview };
