/**
 * Simple Express server to run InterviewPrepAI on localhost
 * 
 * Run with: npx ts-node server.ts
 * Then open: http://localhost:3000
 */

import express from 'express';
import { InterviewPrepAI } from './src/index';

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Store active sessions (in production, use a proper session store)
const sessions = new Map<string, string>();
const interviewAI = new InterviewPrepAI({ debug: true });

// API Routes

// Get available roles
app.get('/api/roles', (_req, res) => {
    try {
        const roles = interviewAI.getAvailableRoles();
        res.json(roles);
    } catch (error) {
        res.status(500).json({ error: 'Failed to get roles' });
    }
});

// Get available experience levels
app.get('/api/levels', (_req, res) => {
    try {
        const levels = interviewAI.getAvailableExperienceLevels();
        res.json(levels);
    } catch (error) {
        res.status(500).json({ error: 'Failed to get levels' });
    }
});

// Create a new session
app.post('/api/session', (req, res) => {
    try {
        const { role, level } = req.body;
        const sessionId = interviewAI.createSession(role, level);
        sessions.set(sessionId, sessionId);
        res.json({ sessionId });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// Upload resume
app.post('/api/session/:sessionId/resume', (req, res) => {
    try {
        const { sessionId } = req.params;
        const { content } = req.body;

        const analysis = interviewAI.uploadResume(sessionId, {
            content,
            format: 'text',
            filename: 'resume.txt'
        });

        res.json(analysis);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// Start interview
app.post('/api/session/:sessionId/start', (req, res) => {
    try {
        const { sessionId } = req.params;
        const question = interviewAI.startInterview(sessionId);
        const duration = interviewAI.getExpectedDuration(sessionId);

        res.json({ question, expectedDuration: duration });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// Submit response
app.post('/api/session/:sessionId/response', (req, res) => {
    try {
        const { sessionId } = req.params;
        const { response } = req.body;

        const action = interviewAI.submitResponse(sessionId, response);
        const progress = interviewAI.getProgress(sessionId);
        const behaviorType = interviewAI.getCurrentBehaviorType(sessionId);

        res.json({ action, progress, behaviorType });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// Get progress
app.get('/api/session/:sessionId/progress', (req, res) => {
    try {
        const { sessionId } = req.params;
        const progress = interviewAI.getProgress(sessionId);
        res.json(progress);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// End interview early
app.post('/api/session/:sessionId/end', (req, res) => {
    try {
        const { sessionId } = req.params;
        const action = interviewAI.endInterviewEarly(sessionId);
        res.json(action);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// Get continuation options
app.get('/api/session/:sessionId/continuation', (req, res) => {
    try {
        const { sessionId } = req.params;
        const options = interviewAI.getContinuationOptions(sessionId);
        res.json(options);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// Cleanup session
app.delete('/api/session/:sessionId', (req, res) => {
    try {
        const { sessionId } = req.params;
        interviewAI.cleanupSession(sessionId);
        sessions.delete(sessionId);
        res.json({ success: true });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║           InterviewPrepAI Server Running! 🚀               ║
║                                                            ║
║   Open your browser and go to:                            ║
║   👉  http://localhost:${PORT}                              ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
    `);
});
