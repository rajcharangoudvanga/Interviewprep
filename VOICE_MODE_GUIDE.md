# 🎤 Voice Mode Guide

## What is Voice Mode?

Voice Mode allows you to practice interviews using **speech** instead of typing! The system will:
- **Read questions aloud** using text-to-speech
- **Listen to your answers** using speech recognition
- **Transcribe your responses** in real-time
- **Provide the same detailed feedback** as text mode

---

## How to Use Voice Mode

### 1. Access Voice Mode

**Option A: From the main page**
- Go to http://localhost:3000
- Click the **"🎤 Voice Mode"** button at the top

**Option B: Direct link**
- Go directly to http://localhost:3000/index-voice.html

### 2. Setup Your Interview

1. **Select your job role** (Software Engineer, Product Manager, etc.)
2. **Choose experience level** (Entry, Mid, Senior, Lead)
3. **Paste your resume** (optional)
4. Click **"Start Voice Interview"**

### 3. During the Interview

**Hearing Questions:**
- Questions are automatically read aloud when they appear
- Click the 🔊 speaker icon to hear the question again

**Answering Questions:**
1. Click the **🎤 microphone button** to start recording
2. Speak your answer naturally
3. Your words appear as text in real-time
4. Click the microphone again (⏹️) to stop recording
5. Review your transcribed answer
6. Click **"Submit Answer"** when ready

**Controls:**
- **🎤 Microphone** - Start/stop recording
- **Clear** - Clear your current transcript
- **Submit Answer** - Submit your response
- **End Interview** - End early and get partial feedback

### 4. Get Feedback

- Feedback is displayed on screen
- Overall grade and score are read aloud automatically
- Review detailed scoring and suggestions

---

## Browser Requirements

### ✅ Supported Browsers

**Best Experience:**
- **Google Chrome** (recommended)
- **Microsoft Edge**
- **Safari** (macOS/iOS)

**Features:**
- ✅ Speech Recognition (microphone input)
- ✅ Text-to-Speech (audio output)
- ✅ Real-time transcription

### ❌ Not Supported
- Firefox (limited speech recognition support)
- Internet Explorer
- Older browser versions

---

## Tips for Best Results

### 🎤 Microphone Tips

1. **Use a good microphone**
   - Built-in laptop mic works fine
   - Headset microphone is better
   - External USB mic is best

2. **Quiet environment**
   - Find a quiet room
   - Close windows
   - Turn off fans/AC if possible

3. **Speak clearly**
   - Normal speaking pace
   - Clear pronunciation
   - Natural tone (not too fast or slow)

4. **Proper distance**
   - 6-12 inches from microphone
   - Not too close (causes distortion)
   - Not too far (hard to hear)

### 🔊 Audio Tips

1. **Check your speakers/headphones**
   - Make sure volume is up
   - Test audio before starting

2. **Listen to questions**
   - Questions auto-play when they appear
   - Click 🔊 to replay if needed

3. **Adjust speech rate**
   - Questions are read at 0.9x speed for clarity
   - This is optimized for comprehension

### 💬 Speaking Tips

1. **Structure your answers**
   - Use STAR method for behavioral questions
   - State problem → approach → solution for technical

2. **Pause between thoughts**
   - Brief pauses help with transcription
   - Gives you time to think

3. **Review before submitting**
   - Check the transcript for accuracy
   - Edit if needed (you can type corrections)

4. **Don't rush**
   - Take your time
   - Quality over speed

---

## Troubleshooting

### Microphone Not Working

**Problem:** "Microphone access denied"
**Solution:**
1. Click the 🔒 lock icon in browser address bar
2. Allow microphone access
3. Refresh the page

**Problem:** "No sound detected"
**Solution:**
1. Check system microphone settings
2. Select correct input device
3. Test microphone in system settings
4. Try a different browser

### Speech Recognition Issues

**Problem:** "Words not transcribed correctly"
**Solution:**
1. Speak more clearly and slowly
2. Reduce background noise
3. Move closer to microphone
4. Use a better microphone

**Problem:** "Recognition stops unexpectedly"
**Solution:**
1. Click microphone button again to restart
2. Check browser console for errors
3. Try refreshing the page

### Audio Playback Issues

**Problem:** "Can't hear questions"
**Solution:**
1. Check system volume
2. Check browser isn't muted
3. Try headphones
4. Click 🔊 icon manually

**Problem:** "Audio is choppy"
**Solution:**
1. Close other tabs/applications
2. Check CPU usage
3. Try a different browser

---

## Features Comparison

| Feature | Text Mode | Voice Mode |
|---------|-----------|------------|
| Type responses | ✅ | ❌ |
| Speak responses | ❌ | ✅ |
| Hear questions | ❌ | ✅ |
| Real-time transcription | ❌ | ✅ |
| Edit responses | ✅ | ✅ (edit transcript) |
| Detailed feedback | ✅ | ✅ |
| Resume upload | ✅ | ✅ |
| Progress tracking | ✅ | ✅ |
| Behavior adaptation | ✅ | ✅ |

---

## Technical Details

### Speech Recognition
- Uses **Web Speech API**
- Continuous recognition mode
- Real-time interim results
- English (US) language
- Automatic punctuation

### Text-to-Speech
- Uses **Speech Synthesis API**
- Natural voice selection
- Adjustable rate (0.9x for clarity)
- Automatic question reading
- Feedback summary narration

### Privacy
- All speech processing happens **in your browser**
- No audio is sent to our servers
- Only transcribed text is submitted
- Same privacy as text mode

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| Space | Start/stop recording |
| Enter | Submit answer |
| Esc | Stop recording |
| R | Replay question |

*(Coming soon)*

---

## Advanced Usage

### Custom Voice Settings

Edit `public/app-voice.js` to customize:

```javascript
// Speech recognition settings
recognition.lang = 'en-US';  // Change language
recognition.continuous = true;  // Continuous mode

// Text-to-speech settings
utterance.rate = 0.9;  // Speech rate (0.1-10)
utterance.pitch = 1;   // Voice pitch (0-2)
utterance.volume = 1;  // Volume (0-1)
```

### Voice Selection

```javascript
// Get available voices
const voices = synthesis.getVoices();

// Select specific voice
utterance.voice = voices[0];  // Change index
```

---

## FAQ

**Q: Is voice mode as accurate as text mode?**
A: Yes! The transcription is very accurate with clear speech. You can always edit the transcript before submitting.

**Q: Can I use voice mode on mobile?**
A: Yes! Works great on iOS Safari and Android Chrome.

**Q: Does it work offline?**
A: Speech recognition requires internet, but the interview logic works offline.

**Q: Can I switch between voice and text mode?**
A: Yes! Use the mode toggle buttons at the top of the page.

**Q: What languages are supported?**
A: Currently English (US). More languages coming soon!

**Q: Is my voice recorded?**
A: No! Only the transcribed text is saved. Audio is processed in real-time and not stored.

---

## Coming Soon

- 🌍 Multiple language support
- ⌨️ Keyboard shortcuts
- 🎚️ Voice settings panel
- 📊 Speech analytics (pace, filler words)
- 🎭 Emotion detection
- 🔄 Voice feedback (spoken suggestions)

---

## Support

Having issues with voice mode?

1. Check [Browser Requirements](#browser-requirements)
2. Review [Troubleshooting](#troubleshooting)
3. Try [Text Mode](http://localhost:3000) as alternative
4. Check browser console for errors (F12)

---

## Try It Now!

Ready to practice with voice?

### 👉 http://localhost:3000/index-voice.html

Or click **"🎤 Voice Mode"** from the main page!
