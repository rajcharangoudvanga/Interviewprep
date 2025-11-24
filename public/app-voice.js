// Voice Interview App
let sessionId = null;
let currentQuestion = null;
let recognition = null;
let isRecording = false;
let transcript = '';
let synthesis = window.speechSynthesis;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadRoles();
    loadLevels();
    initializeSpeechRecognition();
    checkBrowserSupport();
});

// Check browser support
function checkBrowserSupport() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        alert('⚠️ Your browser doesn\'t support speech recognition. Please use Chrome, Edge, or Safari.');
    }

    if (!('speechSynthesis' in window)) {
        alert('⚠️ Your browser doesn\'t support text-to-speech.');
    }
}

// Initialize speech recognition
function initializeSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
        console.error('Speech recognition not supported');
        return;
    }

    recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
        isRecording = true;
        updateMicButton();
        updateVoiceStatus('🎤 Listening... Speak now');
    };

    recognition.onend = () => {
        isRecording = false;
        updateMicButton();
        updateVoiceStatus('Click the microphone to start speaking');
    };

    recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcriptPiece = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
                finalTranscript += transcriptPiece + ' ';
            } else {
                interimTranscript += transcriptPiece;
            }
        }

        if (finalTranscript) {
            transcript += finalTranscript;
        }

        displayTranscript(transcript + interimTranscript);
    };

    recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        updateVoiceStatus('❌ Error: ' + event.error);
        isRecording = false;
        updateMicButton();
    };
}

// Toggle recording
function toggleRecording() {
    if (!recognition) {
        alert('Speech recognition not available');
        return;
    }

    if (isRecording) {
        recognition.stop();
    } else {
        recognition.start();
    }
}

// Update mic button appearance
function updateMicButton() {
    const button = document.getElementById('mic-button');
    if (isRecording) {
        button.classList.add('recording');
        button.textContent = '⏹️';
    } else {
        button.classList.remove('recording');
        button.textContent = '🎤';
    }
}

// Update voice status
function updateVoiceStatus(message) {
    document.getElementById('voice-status').textContent = message;
}

// Display transcript
function displayTranscript(text) {
    const transcriptEl = document.getElementById('transcript');
    if (text.trim()) {
        transcriptEl.textContent = text;
        transcriptEl.classList.remove('empty');
    } else {
        transcriptEl.textContent = 'Your response will appear here as you speak...';
        transcriptEl.classList.add('empty');
    }
}

// Clear transcript
function clearTranscript() {
    transcript = '';
    displayTranscript('');
}

// Speak question
function speakQuestion() {
    if (!currentQuestion) return;

    // Cancel any ongoing speech
    synthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(currentQuestion.text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;

    const speakerIcon = document.getElementById('speaker-icon');
    speakerIcon.classList.add('speaking');

    utterance.onend = () => {
        speakerIcon.classList.remove('speaking');
    };

    synthesis.speak(utterance);
}

// Load roles
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
    }
}

// Load levels
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

    try {
        // Create session with voice mode
        const sessionResponse = await fetch('/api/session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ role, level, mode: 'voice' })
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

        // Auto-speak first question
        setTimeout(() => speakQuestion(), 500);
    } catch (error) {
        console.error('Failed to start interview:', error);
        alert('Failed to start interview. Please try again.');
    }
}

// Display question
function displayQuestion(question) {
    document.getElementById('question-text').textContent = question.text;
    clearTranscript();
}

// Submit response
async function submitResponse() {
    const responseText = transcript.trim();

    if (!responseText) {
        alert('Please provide a response (speak into the microphone)');
        return;
    }

    // Stop recording if active
    if (isRecording) {
        recognition.stop();
    }

    try {
        const response = await fetch(`/api/session/${sessionId}/response`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ response: responseText })
        });
        const data = await response.json();

        // Handle action
        if (data.action.type === 'next-question' || data.action.type === 'follow-up') {
            currentQuestion = data.action.question;
            displayQuestion(currentQuestion);
            updateProgress();

            // Auto-speak next question
            setTimeout(() => speakQuestion(), 500);
        } else if (data.action.type === 'complete') {
            displayFeedback(data.action.feedback);
            showStep('feedback');
        } else if (data.action.type === 'redirect') {
            alert(data.action.message);
        }
    } catch (error) {
        console.error('Failed to submit response:', error);
        alert('Failed to submit response. Please try again.');
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

// End early
async function endEarly() {
    if (!confirm('Are you sure you want to end the interview early?')) {
        return;
    }

    if (isRecording) {
        recognition.stop();
    }

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
    }
}

// Display feedback
function displayFeedback(feedback) {
    const content = document.getElementById('feedback-content');

    content.innerHTML = `
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 12px; text-align: center; margin: 20px 0;">
            <h2 style="font-size: 3em; margin-bottom: 10px;">${feedback.scores.overall.grade}</h2>
            <p style="font-size: 1.2em;">${Math.round(feedback.scores.overall.weightedTotal)}/100</p>
        </div>
        
        <h3>Strengths</h3>
        ${feedback.strengths.map(s => `<div style="background: #e8f5e9; padding: 15px; border-radius: 8px; margin: 10px 0; border-left: 4px solid #4caf50;">✓ ${s}</div>`).join('')}
        
        <h3 style="margin-top: 30px;">Areas for Improvement</h3>
        ${feedback.improvements.slice(0, 5).map(i => `
            <div style="background: #fff3e0; padding: 15px; border-radius: 8px; margin: 10px 0; border-left: 4px solid #ff9800;">
                <h4>${i.category} (${i.priority} priority)</h4>
                <p><strong>Suggestion:</strong> ${i.suggestion}</p>
            </div>
        `).join('')}
    `;

    // Speak feedback summary
    const summaryText = `Interview complete. Your grade is ${feedback.scores.overall.grade}. Score: ${Math.round(feedback.scores.overall.weightedTotal)} out of 100.`;
    const utterance = new SpeechSynthesisUtterance(summaryText);
    synthesis.speak(utterance);
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

    synthesis.cancel();
    sessionId = null;
    currentQuestion = null;
    transcript = '';
    document.getElementById('resume').value = '';
    showStep('setup');
}

// Show step
function showStep(stepName) {
    document.querySelectorAll('.step').forEach(step => {
        step.classList.remove('active');
    });
    document.getElementById(`step-${stepName}`).classList.add('active');
}
