/**
 * Sarvam AI Backend Proxy
 *
 * Proxies requests to Sarvam AI APIs. Keeps your API key secure on the server.
 * Run: SARVAM_API_KEY=your_key node server/sarvam-proxy.js
 *
 * Get your key at: https://dashboard.sarvam.ai/
 */

import express from "express";
import multer from "multer";
import { createReadStream } from "fs";
import { unlink } from "fs/promises";
import { tmpdir } from "os";
import FormData from "form-data";

const app = express();
const upload = multer({ dest: tmpdir() });
const SARVAM_API_KEY = process.env.SARVAM_API_KEY;
const PORT = process.env.PORT || 3001;

if (!SARVAM_API_KEY) {
  console.error("Error: Set SARVAM_API_KEY environment variable");
  console.error("  Windows: set SARVAM_API_KEY=your_key && node server/sarvam-proxy.js");
  console.error("  Mac/Linux: SARVAM_API_KEY=your_key node server/sarvam-proxy.js");
  console.error("Get your key at https://dashboard.sarvam.ai/");
  process.exit(1);
}

// CORS - allow Vite dev server
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

app.use(express.json());

// Speech-to-Text
app.post("/api/sarvam/speech-to-text", upload.single("file"), async (req, res) => {
  let filePath = req.file?.path;
  if (!filePath) {
    return res.status(400).json({ message: "No audio file provided" });
  }

  try {
    const form = new FormData();
    form.append("file", createReadStream(filePath));
    if (req.body.language_code) form.append("language_code", req.body.language_code);
    if (req.body.model) form.append("model", req.body.model || "saarika:v2.5");

    const sarvamRes = await fetch("https://api.sarvam.ai/speech-to-text", {
      method: "POST",
      headers: {
        "api-subscription-key": SARVAM_API_KEY,
        ...form.getHeaders(),
      },
      body: form,
    });

    const data = await sarvamRes.json();
    res.status(sarvamRes.status).json(data);
  } catch (err) {
    console.error("STT error:", err);
    res.status(500).json({ message: err.message || "Transcription failed" });
  } finally {
    if (filePath) unlink(filePath).catch(() => {});
  }
});

// Text Translation
app.post("/api/sarvam/translate", async (req, res) => {
  try {
    const { input, source_language_code, target_language_code } = req.body;
    const sarvamRes = await fetch("https://api.sarvam.ai/text/translate", {
      method: "POST",
      headers: {
        "api-subscription-key": SARVAM_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        input: input || "",
        source_language_code: source_language_code || "auto",
        target_language_code: target_language_code || "en-IN",
      }),
    });
    const data = await sarvamRes.json();
    res.status(sarvamRes.status).json(data);
  } catch (err) {
    console.error("Translate error:", err);
    res.status(500).json({ message: err.message });
  }
});

// Chat Completion (incident summaries, etc.)
app.post("/api/sarvam/chat", async (req, res) => {
  try {
    const { messages, model } = req.body;
    const sarvamRes = await fetch("https://api.sarvam.ai/chat/completions", {
      method: "POST",
      headers: {
        "api-subscription-key": SARVAM_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: model || "OpenHathi-7B-Instruct",
        messages: messages || [],
      }),
    });
    const data = await sarvamRes.json();
    res.status(sarvamRes.status).json(data);
  } catch (err) {
    console.error("Chat error:", err);
    res.status(500).json({ message: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`\nSarvam AI proxy running at http://localhost:${PORT}`);
  console.log("Endpoints:");
  console.log("  POST /api/sarvam/speech-to-text  - Transcribe audio");
  console.log("  POST /api/sarvam/translate       - Translate text");
  console.log("  POST /api/sarvam/chat            - Chat completion\n");
});
