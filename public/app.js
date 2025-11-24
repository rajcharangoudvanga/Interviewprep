// Global state
let sessionId = null;
let currentQuestion = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadRoles();
    loadLevels();
});

// Load available roles
async function loadRoles() {
    try {
        const response = await fetch('/api/roles');
        const roles = await response.json();

        const select = document.getElementById('role');
        select.innerHTML = '<option value="">Select a role...</option>';

        roles.forEach(role => {
            const option = document.createElement('option');
            option.value = role.id;
            option.textContent = role.name;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Failed to load roles:', error);
        alert('Failed to load roles. Please refresh the page.');
    }
}

// Load available experience levels
async function loadLevels() {
    try {
        const response = await fetch('/api/levels');
        const levels = await response.json();

        const select = document.getElementById('level');
        select.innerHTML = '<option value="">Select a level...</option>';

        levels.forEach(level => {
            const option = document.createElement('option');
            option.value = level.level;
            option.textContent = `${level.level.charAt(0).toUpperCase() + level.level.slice(1)} (${level.yearsMin}-${level.yearsMax} years)`;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Failed to load levels:', error);
        alert('Failed to load levels. Please refresh the page.');
    }
}

// Start interview
async function startInterview() {
    const role = document.getElementById('role').value;
    const level = document.getElementById('level').value;
    const resume = document.getElementById('resume').value;

    if (!role || !level) {
        alert('Please select both a role and experience level');
        return;
    }

    showStep('loading');

    try {
        // Create session
        const sessionResponse = await fetch('/api/session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ role, level })
        });
        const sessionData = await sessionResponse.json();
        sessionId = sessionData.sessionId;

        // Upload resume if provided
        if (resume.trim()) {
            await fetch(`/api/session/${sessionId}/resume`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: resume })
            });
        }

        // Start interview
        const startResponse = await fetch(`/api/session/${sessionId}/start`, {
            method: 'POST'
        });
        const startData = await startResponse.json();

        currentQuestion = startData.question;
        displayQuestion(currentQuestion);
        updateProgress();

        showStep('interview');
    } catch (error) {
        console.error('Failed to start interview:', error);
        alert('Failed to start interview. Please try again.');
        showStep('setup');
    }
}

// Display question
function displayQuestion(question) {
    document.getElementById('question-type').textContent = question.type;
    document.getElementById('question-text').textContent = question.text;
    document.getElementById('response').value = '';

    // Add type-specific styling
    const typeElement = document.getElementById('question-type');
    typeElement.className = 'question-type';
    if (question.type === 'behavioral') {
        typeElement.style.background = '#764ba2';
    } else {
        typeElement.style.background = '#667eea';
    }
}

// Submit response
async function submitResponse() {
    const responseText = document.getElementById('response').value.trim();

    if (!responseText) {
        alert('Please provide a response');
        return;
    }

    showStep('loading');

    try {
        const response = await fetch(`/api/session/${sessionId}/response`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ response: responseText })
        });
        const data = await response.json();

        // Update behavior indicator
        updateBehaviorIndicator(data.behaviorType);

        // Handle action
        if (data.action.type === 'next-question' || data.action.type === 'follow-up') {
            currentQuestion = data.action.question;
            displayQuestion(currentQuestion);
            updateProgress();
            showStep('interview');
        } else if (data.action.type === 'complete') {
            displayFeedback(data.action.feedback);
            showStep('feedback');
        } else if (data.action.type === 'redirect') {
            alert(data.action.message);
            showStep('interview');
        }
    } catch (error) {
        console.error('Failed to submit response:', error);
        alert('Failed to submit response. Please try again.');
        showStep('interview');
    }
}

// Update progress
async function updateProgress() {
    try {
        const response = await fetch(`/api/session/${sessionId}/progress`);
        const progress = await response.json();

        const percent = progress.percentComplete;
        document.getElementById('progress-fill').style.width = percent + '%';
        document.getElementById('progress-text').textContent =
            `Question ${progress.answeredQuestions} of ${progress.totalQuestions} (${Math.round(percent)}% complete)`;
    } catch (error) {
        console.error('Failed to update progress:', error);
    }
}

// Update behavior indicator
function updateBehaviorIndicator(behaviorType) {
    const indicator = document.getElementById('behavior-indicator');
    const behaviorMessages = {
        'confused': '💡 I notice you might need clarification. Feel free to ask!',
        'efficient': '⚡ Great concise responses! Keep it up.',
        'chatty': '📝 Try to keep responses focused on the question.',
        'edge-case': '⚠️ Please provide a valid response.',
        'standard': '✅ Good response structure!'
    };

    const message = behaviorMessages[behaviorType] || '';
    if (message) {
        indicator.innerHTML = `<div class="behavior-badge behavior-${behaviorType}">${message}</div>`;
    }
}

// End interview early
async function endEarly() {
    if (!confirm('Are you sure you want to end the interview early? You will receive partial feedback.')) {
        return;
    }

    showStep('loading');

    try {
        const response = await fetch(`/api/session/${sessionId}/end`, {
            method: 'POST'
        });
        const data = await response.json();

        if (data.type === 'complete') {
            displayFeedback(data.feedback);
            showStep('feedback');
        }
    } catch (error) {
        console.error('Failed to end interview:', error);
        alert('Failed to end interview. Please try again.');
        showStep('interview');
    }
}

// Display feedback
function displayFeedback(feedback) {
    // Overall score
    document.getElementById('overall-grade').textContent = feedback.scores.overall.grade;
    document.getElementById('overall-score').textContent =
        `${Math.round(feedback.scores.overall.weightedTotal)}/100`;

    // Strengths
    const strengthsList = document.getElementById('strengths-list');
    strengthsList.innerHTML = '';
    feedback.strengths.forEach(strength => {
        const div = document.createElement('div');
        div.className = 'feedback-item strength';
        div.innerHTML = `<p>✓ ${strength}</p>`;
        strengthsList.appendChild(div);
    });

    // Improvements
    const improvementsList = document.getElementById('improvements-list');
    improvementsList.innerHTML = '';
    feedback.improvements.slice(0, 5).forEach(improvement => {
        const div = document.createElement('div');
        div.className = 'feedback-item improvement';
        div.innerHTML = `
            <h4>${improvement.category} (${improvement.priority} priority)</h4>
            <p><strong>Observation:</strong> ${improvement.observation}</p>
            <p><strong>Suggestion:</strong> ${improvement.suggestion}</p>
        `;
        improvementsList.appendChild(div);
    });
}

// Start over
async function startOver() {
    if (sessionId) {
        try {
            await fetch(`/api/session/${sessionId}`, { method: 'DELETE' });
        } catch (error) {
            console.error('Failed to cleanup session:', error);
        }
    }

    sessionId = null;
    currentQuestion = null;
    document.getElementById('resume').value = '';
    document.getElementById('response').value = '';
    showStep('setup');
}

// Show step
function showStep(stepName) {
    document.querySelectorAll('.step').forEach(step => {
        step.classList.remove('active');
    });
    document.getElementById(`step-${stepName}`).classList.add('active');
}
