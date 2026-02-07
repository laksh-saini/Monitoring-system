/**
 * Sarvam AI Service
 *
 * Client for Sarvam AI APIs - Indian language AI (Speech-to-Text, Text-to-Speech,
 * Translation, Chat Completion). Calls the Sarvam API directly using your API key
 * set via the VITE_SARVAM_API_KEY environment variable.
 *
 * Setup: Add VITE_SARVAM_API_KEY=your_key to a .env file in the project root.
 */

const SARVAM_BASE = 'https://api.sarvam.ai';

function getApiKey(): string {
  const key = import.meta.env.VITE_SARVAM_API_KEY;
  if (!key)
    throw new Error(
      'VITE_SARVAM_API_KEY is not set. Add it to your .env file.',
    );
  return key;
}

async function sarvamFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${SARVAM_BASE}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'api-subscription-key': getApiKey(),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(
      (err as { message?: string }).message || 'Sarvam AI request failed',
    );
  }

  return res.json();
}

/** Transcribe audio to text (Speech-to-Text) - Indian languages + English */
export async function transcribeAudio(
  audioBlob: Blob,
  options?: { languageCode?: string; model?: string; fileName?: string },
): Promise<{
  transcript: string;
  language_code?: string;
  confidence?: number;
}> {
  const formData = new FormData();
  formData.append('file', audioBlob, options?.fileName ?? 'audio.wav');
  // language_code is optional — omit it to let the API auto-detect
  if (options?.languageCode && options.languageCode !== 'unknown') {
    formData.append('language_code', options.languageCode);
  }
  formData.append('model', options?.model ?? 'saarika:v2.5');

  const res = await fetch(`${SARVAM_BASE}/speech-to-text`, {
    method: 'POST',
    headers: {
      'api-subscription-key': getApiKey(),
    },
    body: formData,
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    let msg = `Sarvam STT ${res.status}`;
    try {
      const parsed = JSON.parse(body);
      msg = parsed?.error?.message || parsed?.message || parsed?.detail || msg;
    } catch {
      /* use default */
    }
    console.error('[Sarvam STT] API error:', res.status, body);
    throw new Error(msg);
  }

  return res.json();
}

/** Translate text to another language */
export async function translateText(
  input: string,
  targetLanguage: string,
  options?: { sourceLanguage?: string },
): Promise<{ translated_text: string }> {
  return sarvamFetch('/translate', {
    method: 'POST',
    body: JSON.stringify({
      input,
      source_language_code: options?.sourceLanguage ?? 'auto',
      target_language_code: targetLanguage,
    }),
  });
}

/** Generate text via Chat Completion (e.g. incident summaries) */
export async function chatCompletion(
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
  options?: { model?: string },
): Promise<{ content: string }> {
  const res = await sarvamFetch<{
    choices?: Array<{ message?: { content?: string } }>;
    translated_text?: string;
  }>('/chat/completions', {
    method: 'POST',
    body: JSON.stringify({
      messages,
      model: options?.model ?? 'OpenHathi-7B-Instruct',
    }),
  });

  const content =
    res.choices?.[0]?.message?.content ??
    (res as { content?: string }).content ??
    '';
  return { content };
}

/** Text-to-Speech - returns audio blob URL */
export async function textToSpeech(
  text: string,
  options?: { languageCode?: string; speakerGender?: 'Male' | 'Female' },
): Promise<Blob> {
  const res = await fetch(`${SARVAM_BASE}/text-to-speech`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-subscription-key': getApiKey(),
    },
    body: JSON.stringify({
      text,
      language_code: options?.languageCode ?? 'hi-IN',
      speaker_gender: options?.speakerGender ?? 'Female',
    }),
  });

  if (!res.ok) throw new Error('TTS failed');
  return res.blob();
}
