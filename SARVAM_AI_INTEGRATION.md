# Sarvam AI Integration Guide

This guide explains how to integrate **Sarvam AI** into the OmniSense monitoring system. Sarvam AI provides Indian language AI capabilities: Speech-to-Text, Text-to-Speech, Translation, and Chat Completion.

## What is Sarvam AI?

Sarvam AI is an AI platform focused on Indian languages. Key APIs:

| API | Use Case in Monitoring System |
|-----|-------------------------------|
| **Speech-to-Text** | Transcribe incident audio (e.g., distress calls, witness statements) in Hindi, Tamil, and 10+ Indian languages |
| **Text-to-Speech** | Voice alerts and announcements in regional languages |
| **Text Translation** | Translate incident reports/transcripts across 22 Indic languages |
| **Chat Completion** | AI-generated incident summaries in local languages |

## Setup (5 minutes)

### 1. Get an API Key

1. Sign up at [Sarvam AI Dashboard](https://dashboard.sarvam.ai/)
2. Create an API key in the API Keys section
3. Keep it secret—never commit to version control

### 2. Backend Proxy (Required)

Your API key must stay on the server. The project includes a proxy server:

**Install server dependencies:**

```bash
cd server
npm init -y
npm install express multer form-data
```

**Run the proxy:**

```bash
# Windows (PowerShell)
$env:SARVAM_API_KEY="your_api_key_here"
node sarvam-proxy.js

# Mac / Linux
SARVAM_API_KEY=your_api_key_here node sarvam-proxy.js
```

The proxy runs on `http://localhost:3001` by default.

### 3. Configure the Frontend

Create `.env.local` in the project root:

```env
VITE_SARVAM_API_URL=http://localhost:3001/api/sarvam
```

### 4. Vite Proxy (Alternative)

To avoid CORS and use the same port, add to `vite.config.ts`:

```ts
server: {
  proxy: {
    '/api/sarvam': {
      target: 'http://localhost:3001',
      changeOrigin: true,
    },
  },
},
```

Then set `VITE_SARVAM_API_URL=` (empty) so the app uses `/api/sarvam` relative to the Vite dev server.

## Integration Points

### 1. Real-time Transcript (TranscriptLog)

Replace mock transcript data with live Speech-to-Text:

```tsx
// In TranscriptLog.tsx or a custom hook
import { transcribeAudio } from "@/lib/SarvamAI";

// When audio is available (e.g., from MediaRecorder or video element)
const audioBlob = await getAudioChunk(); // Your audio capture logic
const { transcript, language_code } = await transcribeAudio(audioBlob, {
  languageCode: "unknown", // Auto-detect
});
// Append to transcript state
```

**Note:** For real-time streaming, Sarvam offers a [Streaming API](https://docs.sarvam.ai/api-reference-docs/api-guides-tutorials/speech-to-text/streaming-api) via WebSocket.

### 2. Incident Summary (IntelligencePanel)

Use Chat Completion for AI-generated summaries:

```tsx
import { chatCompletion } from "@/lib/SarvamAI";

const summary = await chatCompletion([
  {
    role: "system",
    content: "You are an incident analyst. Summarize in 1-2 sentences.",
  },
  {
    role: "user",
    content: `Incident: ${incidentType}. Evidence: ${evidence}. Location: ${location}.`,
  },
]);
// Display summary.content
```

### 3. Multilingual Alerts

Use Text-to-Speech for voice announcements:

```tsx
import { textToSpeech } from "@/lib/SarvamAI";

const audioBlob = await textToSpeech(
  "आपातकाल: दुर्घटना का पता चला।", // Emergency: Accident detected
  { languageCode: "hi-IN", speakerGender: "Female" }
);
const url = URL.createObjectURL(audioBlob);
const audio = new Audio(url);
audio.play();
```

### 4. Translate Incident Reports

```tsx
import { translateText } from "@/lib/SarvamAI";

const { translated_text } = await translateText(
  incidentDescription,
  "en-IN", // Target: English
  { sourceLanguage: "auto" }
);
```

## API Reference (Service Module)

The `src/lib/SarvamAI.ts` module provides:

| Function | Description |
|----------|-------------|
| `transcribeAudio(audioBlob, options?)` | Speech-to-Text. Options: `languageCode`, `model` |
| `translateText(input, targetLang, options?)` | Translate text. Options: `sourceLanguage` |
| `chatCompletion(messages, options?)` | Chat/LLM completion. Options: `model` |
| `textToSpeech(text, options?)` | Generate speech. Options: `languageCode`, `speakerGender` |

## Supported Languages

- **hi-IN** Hindi, **bn-IN** Bengali, **ta-IN** Tamil, **te-IN** Telugu
- **mr-IN** Marathi, **gu-IN** Gujarati, **kn-IN** Kannada, **ml-IN** Malayalam
- **pa-IN** Punjabi, **od-IN** Odia, **en-IN** English

Use `languageCode: "unknown"` for auto-detection.

## Resources

- [Sarvam AI Docs](https://docs.sarvam.ai/)
- [API Reference](https://docs.sarvam.ai/api-reference-docs/introduction)
- [Pricing](https://docs.sarvam.ai/api-reference-docs/getting-started/pricing)
- [Discord Community](https://discord.com/invite/5rAsykttcs)
