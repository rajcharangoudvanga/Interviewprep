/**
 * Example Outputs for Each Behavior Type
 * 
 * This file demonstrates how the system adapts its communication style
 * based on different user behavior patterns.
 */

/**
 * Example 1: Confused Behavior
 * 
 * Trigger: User asks for help, gives unclear responses, or explicitly states confusion
 * Adaptation: System provides guidance, clarification, and step-by-step explanations
 */
export const confusedBehaviorExample = {
    scenario: 'Confused Candidate',
    trigger: {
        question: 'Describe a time when you had to optimize the performance of an application.',
        candidateResponse: "I'm not sure what you mean by optimize. Can you explain?"
    },
    systemBehavior: {
        classification: 'confused',
        adaptedResponse: `Let me clarify. Performance optimization means improving how fast or efficiently an application runs. This could include:
- Making pages load faster
- Reducing memory usage
- Improving database query speed
- Reducing API response times

Can you think of a time when you made something run faster or use fewer resources?`,
        acknowledgment: 'I understand this might be unclear. Let me help you with that.',
        transition: 'Take your time to think about it. I\'m here to help if you need clarification.'
    },
    notes: 'System provides detailed explanations and encouragement'
};

/**
 * Example 2: Efficient Behavior
 * 
 * Trigger: User gives concise, direct, technically accurate responses
 * Adaptation: System maintains fast pace with minimal explanatory text
 */
export const efficientBehaviorExample = {
    scenario: 'Efficient Candidate',
    trigger: {
        question: 'How would you design a URL shortening service?',
        candidateResponse: 'Use base62 encoding for short URLs. Hash table for lookups. Distributed cache for hot keys. Partition by hash for scalability. TTL for expiration.'
    },
    systemBehavior: {
        classification: 'efficient',
        adaptedResponse: 'Good. Next question.',
        acknowledgment: 'Got it.',
        transition: 'Moving on.'
    },
    notes: 'System matches the candidate\'s efficient communication style'
};

/**
 * Example 3: Chatty Behavior
 * 
 * Trigger: User provides verbose, off-topic, or excessively detailed responses
 * Adaptation: System politely redirects to stay focused on interview context
 */
export const chattyBehaviorExample = {
    scenario: 'Chatty Candidate',
    trigger: {
        question: 'What is your experience with React?',
        candidateResponse: `Oh, React! I love React. I remember when I first learned it back in 2020, it was such a different paradigm from jQuery which I had been using before. My friend actually recommended it to me at a coffee shop, and we spent hours talking about virtual DOM and all that. Anyway, I've used it in a few projects. One was this personal blog I built, which was really fun because I got to experiment with hooks. Hooks are great, by the way. I also tried Redux but found it a bit complicated at first. Oh, and I went to a React conference once where Dan Abramov was speaking...`
    },
    systemBehavior: {
        classification: 'chatty',
        adaptedResponse: 'I appreciate the context. Let\'s focus on your specific React experience. Can you briefly describe one project where you used React and what you built?',
        acknowledgment: 'Thank you for sharing.',
        transition: 'Let\'s keep our responses focused on the question at hand.'
    },
    notes: 'System gently redirects to maintain interview structure'
};

/**
 * Example 4: Edge Case Behavior
 * 
 * Trigger: User provides invalid input, attempts impossible actions, or gives nonsensical responses
 * Adaptation: System explains limitations and offers valid alternatives
 */
export const edgeCaseBehaviorExample = {
    scenario: 'Edge Case Input',
    trigger: {
        question: 'Tell me about a challenging project you worked on.',
        candidateResponse: 'skip'
    },
    systemBehavior: {
        classification: 'edge-case',
        adaptedResponse: `I understand you might want to skip this question, but in a real interview, you would need to provide an answer. 

Here are your options:
1. Take a moment to think and provide an answer
2. Ask for clarification if the question is unclear
3. End the interview early if you need to stop

Would you like me to rephrase the question?`,
        acknowledgment: 'I see you entered "skip".',
        transition: 'Let me explain what you can do instead.'
    },
    notes: 'System explains constraints and provides valid alternatives'
};

/**
 * Example 5: Standard Behavior
 * 
 * Trigger: User provides appropriate, well-structured responses
 * Adaptation: System maintains professional, encouraging tone
 */
export const standardBehaviorExample = {
    scenario: 'Standard Candidate',
    trigger: {
        question: 'Describe your experience with version control systems.',
        candidateResponse: 'I have extensive experience with Git. I use it daily for version control, branching, and collaboration. I\'m comfortable with commands like merge, rebase, cherry-pick, and resolving conflicts. I\'ve also used GitHub for pull requests and code reviews in team environments.'
    },
    systemBehavior: {
        classification: 'standard',
        adaptedResponse: 'Thank you for that detailed response. Your experience with Git sounds solid.',
        acknowledgment: 'Great, thank you.',
        transition: 'Let\'s move on to the next question.'
    },
    notes: 'System maintains balanced, professional communication'
};

/**
 * All behavior examples
 */
export const allBehaviorExamples = [
    confusedBehaviorExample,
    efficientBehaviorExample,
    chattyBehaviorExample,
    edgeCaseBehaviorExample,
    standardBehaviorExample
];

/**
 * Print all behavior examples in a readable format
 */
export function printBehaviorExamples() {
    console.log('='.repeat(80));
    console.log('BEHAVIOR TYPE EXAMPLES');
    console.log('='.repeat(80));
    console.log();

    allBehaviorExamples.forEach((example, index) => {
        console.log(`Example ${index + 1}: ${example.scenario}`);
        console.log('-'.repeat(80));
        console.log();

        console.log('TRIGGER:');
        console.log(`Question: "${example.trigger.question}"`);
        console.log(`Candidate: "${example.trigger.candidateResponse}"`);
        console.log();

        console.log('SYSTEM BEHAVIOR:');
        console.log(`Classification: ${example.systemBehavior.classification}`);
        console.log(`Acknowledgment: "${example.systemBehavior.acknowledgment}"`);
        console.log(`Adapted Response: "${example.systemBehavior.adaptedResponse}"`);
        console.log(`Transition: "${example.systemBehavior.transition}"`);
        console.log();

        console.log(`Notes: ${example.notes}`);
        console.log();
        console.log();
    });
}

// Run if executed directly
if (require.main === module) {
    printBehaviorExamples();
}
