# Running InterviewPrepAI on Localhost

## Quick Start (Web Interface)

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Server
```bash
npm start
```

### 3. Open Your Browser
Go to: **http://localhost:3000**

That's it! You'll see a beautiful web interface where you can:
- Select your job role and experience level
- Upload your resume (optional)
- Answer interview questions
- Get real-time feedback
- See your behavior adaptation
- Review comprehensive scoring

---

## Alternative: Run Demo Scripts

### Run Complete Demo (Terminal)
```bash
npm run demo
```

This runs all three demo scenarios:
1. Entry-level interview with resume
2. Behavior type demonstrations
3. Early termination and continuation

### Run Individual Examples
```bash
# Quick start example
npx ts-node examples/quick-start.ts

# Basic usage with detailed output
npx ts-node examples/basic-usage.ts

# Error handling examples
npx ts-node examples/error-handling.ts

# Behavior examples
npx ts-node examples/behavior-examples.ts
```

---

## What You'll See

### Web Interface Features

**Setup Screen:**
- Dropdown to select job role (Software Engineer, Product Manager, etc.)
- Dropdown to select experience level (Entry, Mid, Senior, Lead)
- Text area to paste your resume (optional)

**Interview Screen:**
- Progress bar showing completion percentage
- Current question with type indicator (Technical/Behavioral)
- Text area for your response
- Behavior indicator showing your communication style
- Submit button and End Early option

**Feedback Screen:**
- Overall grade (A-F) and score (0-100)
- Communication scores (Clarity, Articulation, Structure, Professionalism)
- Technical scores (Depth, Accuracy, Relevance, Problem Solving)
- List of strengths
- List of improvements with actionable suggestions
- Resume alignment feedback (if resume was uploaded)

---

## Server API Endpoints

If you want to integrate with the backend directly:

### Get Available Roles
```
GET /api/roles
```

### Get Experience Levels
```
GET /api/levels
```

### Create Session
```
POST /api/session
Body: { "role": "software-engineer", "level": "mid" }
```

### Upload Resume
```
POST /api/session/:sessionId/resume
Body: { "content": "resume text..." }
```

### Start Interview
```
POST /api/session/:sessionId/start
```

### Submit Response
```
POST /api/session/:sessionId/response
Body: { "response": "my answer..." }
```

### Get Progress
```
GET /api/session/:sessionId/progress
```

### End Early
```
POST /api/session/:sessionId/end
```

### Cleanup Session
```
DELETE /api/session/:sessionId
```

---

## Troubleshooting

### Port Already in Use
If port 3000 is already in use, edit `server.ts` and change:
```typescript
const PORT = 3000;  // Change to 3001, 8080, etc.
```

### TypeScript Errors
Make sure you've built the project:
```bash
npm run build
```

### Module Not Found
Reinstall dependencies:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Server Won't Start
Check that all dependencies are installed:
```bash
npm install express @types/express
```

---

## Development Tips

### Enable Debug Mode
The server runs with debug mode enabled by default. You'll see detailed logs in the terminal.

### Hot Reload
For development with auto-reload, install nodemon:
```bash
npm install -D nodemon
```

Then add to package.json scripts:
```json
"dev:server": "nodemon --exec ts-node server.ts"
```

Run with:
```bash
npm run dev:server
```

### Customize the UI
Edit `public/index.html` and `public/app.js` to customize the interface.

### Add New Features
The server code is in `server.ts`. Add new API endpoints there.

---

## Example Usage Flow

1. **Start Server:**
   ```bash
   npm start
   ```

2. **Open Browser:**
   Navigate to http://localhost:3000

3. **Select Options:**
   - Role: Software Engineer
   - Level: Mid
   - (Optional) Paste your resume

4. **Start Interview:**
   Click "Start Interview"

5. **Answer Questions:**
   - Read each question
   - Type your response
   - Click "Submit Answer"
   - Watch your progress bar fill up

6. **Review Feedback:**
   - See your overall grade and score
   - Review strengths and improvements
   - Check resume alignment

7. **Start Over:**
   Click "Start New Interview" to practice again

---

## Production Deployment

To deploy this to production:

1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Update server.ts** to use compiled files:
   ```typescript
   import { InterviewPrepAI } from './dist/index';
   ```

3. **Set environment variables:**
   ```bash
   export PORT=3000
   export NODE_ENV=production
   ```

4. **Run with Node:**
   ```bash
   node dist/server.js
   ```

5. **Use a process manager** like PM2:
   ```bash
   npm install -g pm2
   pm2 start dist/server.js --name interview-prep-ai
   ```

---

## Next Steps

- Customize the UI styling in `public/index.html`
- Add authentication for multi-user support
- Integrate with a database for session persistence
- Add voice mode support
- Deploy to a cloud platform (Heroku, AWS, etc.)

---

## Support

For issues or questions:
- Check the [User Guide](docs/USER_GUIDE.md)
- Review the [API Reference](docs/API_REFERENCE.md)
- See [Examples](examples/README.md)
