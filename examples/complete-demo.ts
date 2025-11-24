/**
 * Complete Interview Demo Script
 * 
 * This script demonstrates a complete interview flow from start to finish,
 * including all major features of the InterviewPrepAI system.
 */

import { InterviewPrepAI } from '../src/index';
import { entryLevelSWEResume, midLevelSWEResume } from './sample-resumes';

/**
 * Demo: Complete interview flow for entry-level software engineer
 */
export async function demoEntryLevelInterview() {
    console.log('='.repeat(80));
    console.log('DEMO: Entry-Level Software Engineer Interview');
    console.log('='.repeat(80));
    console.log();

    // Initialize the system
    const interviewAI = new InterviewPrepAI({ debug: true });

    // Step 1: Show available roles and levels
    console.log('Step 1: Available Options');
    console.log('-'.repeat(80));
    const roles = interviewAI.getAvailableRoles();
    const levels = interviewAI.getAvailableExperienceLevels();

    console.log('Available Roles:');
    roles.forEach(role => console.log(`  - ${role.name} (${role.id})`));
    console.log();
    console.log('Available Experience Levels:');
    levels.forEach(level => console.log(`  - ${level.level} (${level.yearsMin}-${level.yearsMax} years)`));
    console.log();

    // Step 2: Create session
    console.log('Step 2: Creating Interview Session');
    console.log('-'.repeat(80));
    const sessionId = interviewAI.createSession('software-engineer', 'entry');
    console.log(`Session created: ${sessionId}`);
    console.log();

    // Step 3: Upload resume
    console.log('Step 3: Uploading Resume');
    console.log('-'.repeat(80));
    const resumeAnalysis = interviewAI.uploadResume(sessionId, entryLevelSWEResume);
    console.log('Resume Analysis:');
    console.log(`  Alignment Score: ${resumeAnalysis.alignmentScore.overall}%`);
    console.log(`  Strengths: ${resumeAnalysis.strengths.length} identified`);
    console.log(`  Technical Skills: ${resumeAnalysis.technicalSkills.map(s => s.name).join(', ')}`);
    console.log(`  Gaps: ${resumeAnalysis.gaps.length} identified`);
    console.log();

    // Step 4: Start interview
    console.log('Step 4: Starting Interview');
    console.log('-'.repeat(80));
    const expectedDuration = interviewAI.getExpectedDuration(sessionId);
    console.log(`Expected Duration: ${Math.round(expectedDuration / 60000)} minutes`);

    const firstQuestion = interviewAI.startInterview(sessionId);
    console.log(`\nFirst Question (${firstQuestion.type}):`);
    console.log(`  ${firstQuestion.text}`);
    console.log();

    // Step 5: Simulate responses and interview flow
    console.log('Step 5: Interview Flow');
    console.log('-'.repeat(80));

    // Response 1: Good technical response
    console.log('\n[Candidate Response 1]');
    const response1 = "I would use a hash map to solve this problem. The key insight is that we can store each number we've seen in the hash map, and for each new number, check if its complement exists. This gives us O(n) time complexity and O(n) space complexity.";
    console.log(`Response: "${response1.substring(0, 80)}..."`);

    let action = interviewAI.submitResponse(sessionId, response1);
    console.log(`Action: ${action.type}`);

    if (action.type === 'next-question' && action.question) {
        console.log(`\nNext Question (${action.question.type}):`);
        console.log(`  ${action.question.text}`);
    }

    // Response 2: Vague response that triggers follow-up
    console.log('\n[Candidate Response 2]');
    const response2 = "I worked on a team project.";
    console.log(`Response: "${response2}"`);

    action = interviewAI.submitResponse(sessionId, response2);
    console.log(`Action: ${action.type}`);

    if (action.type === 'follow-up' && action.question) {
        console.log(`\nFollow-up Question:`);
        console.log(`  ${action.question.text}`);
    }

    // Response 3: Better elaboration
    console.log('\n[Candidate Response 3]');
    const response3 = "In my team project, I was responsible for implementing the backend API using Node.js and Express. I worked with two other developers, and we used Git for version control. I handled the user authentication endpoints and integrated with MongoDB for data storage. We had daily standups and used Jira for task tracking.";
    console.log(`Response: "${response3.substring(0, 80)}..."`);

    action = interviewAI.submitResponse(sessionId, response3);
    console.log(`Action: ${action.type}`);

    // Check progress
    const progress = interviewAI.getProgress(sessionId);
    console.log(`\nProgress: ${progress.answeredQuestions}/${progress.totalQuestions} questions answered (${progress.percentComplete}% complete)`);
    console.log();

    // Step 6: Demonstrate behavior adaptation
    console.log('Step 6: Behavior Adaptation');
    console.log('-'.repeat(80));
    const behaviorType = interviewAI.getCurrentBehaviorType(sessionId);
    console.log(`Current Behavior Type: ${behaviorType}`);

    const acknowledgment = interviewAI.getAcknowledgment(sessionId);
    console.log(`Acknowledgment: "${acknowledgment}"`);

    const transition = interviewAI.getTransition(sessionId);
    console.log(`Transition: "${transition}"`);
    console.log();

    // Step 7: Complete remaining questions (simulated)
    console.log('Step 7: Completing Interview');
    console.log('-'.repeat(80));
    console.log('[Simulating remaining responses...]');

    // Continue until interview is complete
    let questionCount = 3;
    while (action.type !== 'complete' && questionCount < 10) {
        const simulatedResponse = `This is a simulated response for question ${questionCount}. In my experience, I have worked with various technologies and approaches to solve similar problems.`;
        action = interviewAI.submitResponse(sessionId, simulatedResponse);
        questionCount++;

        if (action.type === 'complete') {
            break;
        }
    }

    // If not complete, end early
    if (action.type !== 'complete') {
        console.log('Ending interview early for demo purposes...');
        action = interviewAI.endInterviewEarly(sessionId);
    }

    // Step 8: Review feedback
    console.log('\nStep 8: Feedback Report');
    console.log('-'.repeat(80));

    if (action.type === 'complete' && action.feedback) {
        const feedback = action.feedback;

        console.log('\nScoring Rubric:');
        console.log(`  Communication: ${feedback.scores.communication.total}/40 (Grade: ${feedback.scores.communication.grade})`);
        console.log(`    - Clarity: ${feedback.scores.communication.clarity}/10`);
        console.log(`    - Articulation: ${feedback.scores.communication.articulation}/10`);
        console.log(`    - Structure: ${feedback.scores.communication.structure}/10`);
        console.log(`    - Professionalism: ${feedback.scores.communication.professionalism}/10`);

        console.log(`\n  Technical: ${feedback.scores.technicalFit.total}/40 (Grade: ${feedback.scores.technicalFit.grade})`);
        console.log(`    - Depth: ${feedback.scores.technicalFit.depth}/10`);
        console.log(`    - Accuracy: ${feedback.scores.technicalFit.accuracy}/10`);
        console.log(`    - Relevance: ${feedback.scores.technicalFit.relevance}/10`);
        console.log(`    - Problem Solving: ${feedback.scores.technicalFit.problemSolving}/10`);

        console.log(`\n  Overall: ${feedback.scores.overall.weightedTotal}/100 (Grade: ${feedback.scores.overall.grade})`);

        console.log('\nStrengths:');
        feedback.strengths.forEach(strength => console.log(`  - ${strength}`));

        console.log('\nAreas for Improvement:');
        feedback.improvements.slice(0, 3).forEach(improvement => {
            console.log(`  - ${improvement.category} (${improvement.priority} priority)`);
            console.log(`    Observation: ${improvement.observation}`);
            console.log(`    Suggestion: ${improvement.suggestion}`);
        });

        if (feedback.resumeAlignment) {
            console.log('\nResume Alignment:');
            console.log(`  Alignment Score: ${feedback.resumeAlignment.alignmentScore}%`);
            console.log(`  Matched Skills: ${feedback.resumeAlignment.matchedSkills.map(s => s.name).join(', ')}`);
            console.log(`  Missing Skills: ${feedback.resumeAlignment.missingSkills.map(s => s.name).join(', ')}`);
        }

        console.log(`\nSummary:`);
        console.log(`  ${feedback.summary}`);
    }
    console.log();

    // Step 9: Continuation options
    console.log('Step 9: Continuation Options');
    console.log('-'.repeat(80));
    const continuationPrompt = interviewAI.getContinuationOptions(sessionId);
    console.log(continuationPrompt.message);
    console.log('\nOptions:');
    continuationPrompt.options.forEach((option, index) => {
        console.log(`  ${index + 1}. ${option.label}`);
        console.log(`     ${option.description}`);
    });
    console.log();

    // Cleanup
    interviewAI.cleanupSession(sessionId);
    console.log('Session cleaned up.');
    console.log('='.repeat(80));
    console.log('DEMO COMPLETE');
    console.log('='.repeat(80));
}

/**
 * Demo: Interview with different behavior types
 */
export async function demoBehaviorTypes() {
    console.log('='.repeat(80));
    console.log('DEMO: Behavior Type Adaptation');
    console.log('='.repeat(80));
    console.log();

    const interviewAI = new InterviewPrepAI({ debug: false });

    // Confused behavior
    console.log('Scenario 1: Confused Candidate');
    console.log('-'.repeat(80));
    const session1 = interviewAI.createSession('software-engineer', 'entry');
    interviewAI.startInterview(session1);

    console.log('Candidate: "I\'m not sure I understand the question. Can you help?"');
    interviewAI.submitResponse(session1, "I'm not sure I understand the question. Can you help?");
    console.log(`Behavior Type: ${interviewAI.getCurrentBehaviorType(session1)}`);
    console.log(`System Response: "${interviewAI.getAdaptedResponse(session1, 'Let me clarify the question.')}"`);
    console.log();

    // Efficient behavior
    console.log('Scenario 2: Efficient Candidate');
    console.log('-'.repeat(80));
    const session2 = interviewAI.createSession('software-engineer', 'mid');
    interviewAI.uploadResume(session2, midLevelSWEResume);
    interviewAI.startInterview(session2);

    console.log('Candidate: "Use a hash map. O(n) time, O(n) space."');
    interviewAI.submitResponse(session2, "Use a hash map. O(n) time, O(n) space.");
    console.log(`Behavior Type: ${interviewAI.getCurrentBehaviorType(session2)}`);
    console.log(`System Response: "${interviewAI.getAdaptedResponse(session2, 'Good answer.')}"`);
    console.log();

    // Chatty behavior
    console.log('Scenario 3: Chatty Candidate');
    console.log('-'.repeat(80));
    const session3 = interviewAI.createSession('software-engineer', 'entry');
    interviewAI.startInterview(session3);

    const chattyResponse = "Well, you know, I've always been interested in algorithms since I was a kid. My uncle was a programmer and he showed me this cool sorting visualization. Anyway, for this problem, I think we could use a hash map, but also maybe an array would work? I'm not entirely sure. Oh, and I once read this blog post about data structures that was really interesting. The author talked about how hash maps are implemented under the hood with buckets and collision resolution...";
    console.log(`Candidate: "${chattyResponse.substring(0, 100)}..."`);
    interviewAI.submitResponse(session3, chattyResponse);
    console.log(`Behavior Type: ${interviewAI.getCurrentBehaviorType(session3)}`);
    console.log(`System Response: "${interviewAI.getAdaptedResponse(session3, 'Let\'s focus on the core solution.')}"`);
    console.log();

    // Edge case behavior
    console.log('Scenario 4: Edge Case Input');
    console.log('-'.repeat(80));
    const session4 = interviewAI.createSession('software-engineer', 'entry');
    interviewAI.startInterview(session4);

    console.log('Candidate: "skip question"');
    interviewAI.submitResponse(session4, "skip question");
    console.log(`Behavior Type: ${interviewAI.getCurrentBehaviorType(session4)}`);
    console.log(`System Response: "${interviewAI.getAdaptedResponse(session4, 'You cannot skip questions.')}"`);
    console.log();

    // Cleanup
    [session1, session2, session3, session4].forEach(sid => interviewAI.cleanupSession(sid));

    console.log('='.repeat(80));
    console.log('BEHAVIOR DEMO COMPLETE');
    console.log('='.repeat(80));
}

/**
 * Demo: Early termination and continuation
 */
export async function demoEarlyTermination() {
    console.log('='.repeat(80));
    console.log('DEMO: Early Termination and Continuation');
    console.log('='.repeat(80));
    console.log();

    const interviewAI = new InterviewPrepAI({ debug: false });

    // Create and start interview
    const sessionId = interviewAI.createSession('software-engineer', 'mid');
    interviewAI.uploadResume(sessionId, midLevelSWEResume);
    interviewAI.startInterview(sessionId);

    // Answer a few questions
    console.log('Answering 3 questions...');
    for (let i = 0; i < 3; i++) {
        const response = `This is my response to question ${i + 1}. I have experience with this topic from my previous work.`;
        interviewAI.submitResponse(sessionId, response);
    }

    const progress = interviewAI.getProgress(sessionId);
    console.log(`Progress: ${progress.answeredQuestions}/${progress.totalQuestions} questions`);
    console.log();

    // End early
    console.log('Ending interview early...');
    const action = interviewAI.endInterviewEarly(sessionId);

    if (action.type === 'complete' && action.feedback) {
        console.log('\nPartial Feedback Generated:');
        console.log(`  Overall Score: ${action.feedback.scores.overall.weightedTotal}/100`);
        console.log(`  Questions Covered: ${action.feedback.questionBreakdown.length}`);
        console.log(`  Note: ${action.feedback.summary}`);
    }
    console.log();

    // Get continuation options
    console.log('Continuation Options:');
    const continuationPrompt = interviewAI.getContinuationOptions(sessionId);
    continuationPrompt.options.forEach((option, index) => {
        console.log(`  ${index + 1}. ${option.label}`);
    });
    console.log();

    // Continue with new session
    console.log('Starting new session (same role and level)...');
    const roles = interviewAI.getAvailableRoles();
    const levels = interviewAI.getAvailableExperienceLevels();
    const newSessionId = interviewAI.continueWithNewSession({
        type: 'new-round',
        role: roles.find(r => r.id === 'software-engineer'),
        experienceLevel: levels.find(l => l.level === 'mid')
    });
    console.log(`New session created: ${newSessionId}`);

    interviewAI.cleanupSession(sessionId);
    interviewAI.cleanupSession(newSessionId);

    console.log();
    console.log('='.repeat(80));
    console.log('EARLY TERMINATION DEMO COMPLETE');
    console.log('='.repeat(80));
}

/**
 * Run all demos
 */
export async function runAllDemos() {
    try {
        await demoEntryLevelInterview();
        console.log('\n\n');

        await demoBehaviorTypes();
        console.log('\n\n');

        await demoEarlyTermination();

        console.log('\n✅ All demos completed successfully!');
    } catch (error) {
        console.error('❌ Demo failed:', error);
        throw error;
    }
}

// Run demos if this file is executed directly
if (require.main === module) {
    runAllDemos().catch(console.error);
}
