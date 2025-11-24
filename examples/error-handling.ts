/**
 * Error Handling Example
 * 
 * This example demonstrates proper error handling when using InterviewPrepAI
 */

import {
    createInterviewPrepAI,
    InvalidRoleInputError,
    SessionError,
    InvalidStateTransitionError,
    ResumeParsingError
} from '../src/index';

function demonstrateErrorHandling() {
    console.log('=== Error Handling Examples ===\n');

    const interviewAI = createInterviewPrepAI({ debug: false });

    // Example 1: Invalid role input
    console.log('1. Handling Invalid Role Input:');
    try {
        interviewAI.createSession('invalid-role', 'mid');
    } catch (error) {
        if (error instanceof InvalidRoleInputError) {
            console.log(`   Error: ${error.message}`);
            console.log(`   Available options: ${error.availableOptions.join(', ')}`);
            console.log('   ✓ Caught and handled gracefully\n');
        }
    }

    // Example 2: Invalid experience level
    console.log('2. Handling Invalid Experience Level:');
    try {
        interviewAI.createSession('software-engineer', 'expert');
    } catch (error) {
        if (error instanceof InvalidRoleInputError) {
            console.log(`   Error: ${error.message}`);
            console.log(`   Available options: ${error.availableOptions.join(', ')}`);
            console.log('   ✓ Caught and handled gracefully\n');
        }
    }

    // Example 3: Session not found
    console.log('3. Handling Non-existent Session:');
    try {
        interviewAI.startInterview('non-existent-session-id');
    } catch (error) {
        if (error instanceof SessionError) {
            console.log(`   Error: ${error.message}`);
            console.log('   ✓ Caught and handled gracefully\n');
        }
    }

    // Example 4: Invalid state transition
    console.log('4. Handling Invalid State Transition:');
    try {
        const sessionId = interviewAI.createSession('software-engineer', 'mid');
        interviewAI.startInterview(sessionId);

        // Try to upload resume after starting (invalid state)
        interviewAI.uploadResume(sessionId, {
            content: 'Resume content',
            format: 'text',
            filename: 'resume.txt'
        });
    } catch (error) {
        if (error instanceof InvalidStateTransitionError) {
            console.log(`   Error: ${error.message}`);
            console.log(`   Current state: ${error.currentState}`);
            console.log(`   Attempted action: ${error.attemptedAction}`);
            console.log('   ✓ Caught and handled gracefully\n');
        }
    }

    // Example 5: Malformed resume (handled gracefully)
    console.log('5. Handling Malformed Resume:');
    try {
        const sessionId = interviewAI.createSession('software-engineer', 'mid');

        // Upload empty/malformed resume
        const analysis = interviewAI.uploadResume(sessionId, {
            content: '',
            format: 'text',
            filename: 'empty.txt'
        });

        console.log('   Resume parsing failed but system continued gracefully');
        console.log(`   Alignment score: ${analysis.alignmentScore.overall}%`);
        console.log('   ✓ Graceful degradation - interview can continue\n');
    } catch (error) {
        console.log('   Unexpected error:', error);
    }

    // Example 6: Proper error handling in production code
    console.log('6. Production-Ready Error Handling Pattern:');

    async function conductInterviewSafely(roleId: string, level: string) {
        let sessionId: string | null = null;

        try {
            // Create session with validation
            sessionId = interviewAI.createSession(roleId, level);
            console.log(`   ✓ Session created: ${sessionId.substring(0, 8)}...`);

            // Start interview
            const firstQuestion = interviewAI.startInterview(sessionId);
            console.log(`   ✓ Interview started`);
            console.log(`   ✓ First question: ${firstQuestion.type}`);

            // Submit response
            const action = interviewAI.submitResponse(
                sessionId,
                'This is my response to the question.'
            );
            console.log(`   ✓ Response processed: ${action.type}`);

            return { success: true, sessionId };

        } catch (error) {
            // Centralized error handling
            if (error instanceof InvalidRoleInputError) {
                console.error(`   ✗ Invalid input: ${error.message}`);
                console.error(`   Available options: ${error.availableOptions.join(', ')}`);
                return { success: false, error: 'INVALID_INPUT', message: error.message };

            } else if (error instanceof SessionError) {
                console.error(`   ✗ Session error: ${error.message}`);
                return { success: false, error: 'SESSION_ERROR', message: error.message };

            } else if (error instanceof InvalidStateTransitionError) {
                console.error(`   ✗ Invalid state transition: ${error.message}`);
                return { success: false, error: 'INVALID_STATE', message: error.message };

            } else {
                console.error(`   ✗ Unexpected error:`, error);
                return { success: false, error: 'UNKNOWN', message: 'An unexpected error occurred' };
            }

        } finally {
            // Always cleanup
            if (sessionId) {
                try {
                    interviewAI.cleanupSession(sessionId);
                    console.log(`   ✓ Session cleaned up`);
                } catch (cleanupError) {
                    console.error(`   ✗ Cleanup failed:`, cleanupError);
                }
            }
        }
    }

    // Test the production pattern
    conductInterviewSafely('software-engineer', 'mid');

    console.log('\n=== Error Handling Examples Complete ===');
}

// Run the example
if (require.main === module) {
    demonstrateErrorHandling();
}

export { demonstrateErrorHandling };
