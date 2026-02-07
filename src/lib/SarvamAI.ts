/**
 * Sarvam AI Service
 *
 * Client for Sarvam AI APIs - Indian language AI (Speech-to-Text, Text-to-Speech,
 * Translation, Chat Completion). Calls go through a backend proxy to keep API keys secure.
 *
 * Setup: Configure VITE_SARVAM_API_URL to point to your backend proxy (e.g. /api/sarvam)
 */

const getBaseUrl = () =>
  import.meta.env.VITE_SARVAM_API_URL ?? "/api/sarvam";

async function sarvamFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${getBaseUrl()}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error((err as { message?: string }).message || "Sarvam AI request failed");
  }

  return res.json();
}

/** Transcribe audio to text (Speech-to-Text) - Indian languages + English */
export async function transcribeAudio(
  audioBlob: Blob,
  options?: { languageCode?: string; model?: string }
): Promise<{ transcript: string; language_code?: string }> {
  const formData = new FormData();
  formData.append("file", audioBlob, "audio.wav");
  if (options?.languageCode) formData.append("language_code", options.languageCode);
  if (options?.model) formData.append("model", options.model ?? "saarika:v2.5");

  const url = `${getBaseUrl()}/speech-to-text`;
  const res = await fetch(url, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error((err as { message?: string }).message || "Transcription failed");
  }

  return res.json();
}

/** Translate text to another language */
export async function translateText(
  input: string,
  targetLanguage: string,
  options?: { sourceLanguage?: string }
): Promise<{ translated_text: string }> {
  return sarvamFetch("/translate", {
    method: "POST",
    body: JSON.stringify({
      input,
      source_language_code: options?.sourceLanguage ?? "auto",
      target_language_code: targetLanguage,
    }),
  });
}

/** Generate text via Chat Completion (e.g. incident summaries) */
export async function chatCompletion(
  messages: Array<{ role: "user" | "assistant" | "system"; content: string }>,
  options?: { model?: string }
): Promise<{ content: string }> {
  const res = await sarvamFetch<{
    choices?: Array<{ message?: { content?: string } }>;
    translated_text?: string;
  }>("/chat", {
    method: "POST",
    body: JSON.stringify({
      messages,
      model: options?.model ?? "OpenHathi-7B-Instruct",
    }),
  });

  const content =
    res.choices?.[0]?.message?.content ??
    (res as { content?: string }).content ??
    "";
  return { content };
}

/** Text-to-Speech - returns audio blob URL */
export async function textToSpeech(
  text: string,
  options?: { languageCode?: string; speakerGender?: "Male" | "Female" }
): Promise<Blob> {
  const res = await fetch(`${getBaseUrl()}/text-to-speech`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text,
      language_code: options?.languageCode ?? "hi-IN",
      speaker_gender: options?.speakerGender ?? "Female",
    }),
  });

  if (!res.ok) throw new Error("TTS failed");
  return res.blob();
}
