import { useState, useRef, useCallback, useEffect } from 'react';
import { transcribeAudio } from '@/lib/SarvamAI';

export interface TranscriptEntry {
  id: string;
  time: string;
  speaker: 'system' | 'person' | 'alert';
  text: string;
  confidence?: number;
  languageCode?: string;
}

const SUPPORTED_LANGUAGES = [
  { code: 'unknown', label: 'Auto-Detect' },
  { code: 'en-IN', label: 'English' },
  { code: 'hi-IN', label: 'Hindi' },
  { code: 'bn-IN', label: 'Bengali' },
  { code: 'ta-IN', label: 'Tamil' },
  { code: 'te-IN', label: 'Telugu' },
  { code: 'gu-IN', label: 'Gujarati' },
  { code: 'kn-IN', label: 'Kannada' },
  { code: 'ml-IN', label: 'Malayalam' },
  { code: 'mr-IN', label: 'Marathi' },
  { code: 'pa-IN', label: 'Punjabi' },
  { code: 'od-IN', label: 'Odia' },
] as const;

export { SUPPORTED_LANGUAGES };

/** Interval between recording chunks (ms) */
const RECORD_DURATION = 5_000;
const RECORD_GAP = 1_500;

let entryCounter = 0;
function nextId() {
  return `stt-${Date.now()}-${++entryCounter}`;
}

function timeNow() {
  return new Date().toLocaleTimeString('en-US', { hour12: false });
}

export function useVideoTranscription() {
  const [entries, setEntries] = useState<TranscriptEntry[]>([]);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [languageCode, setLanguageCode] = useState<string>('unknown');

  const videoElRef = useRef<HTMLVideoElement | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const languageRef = useRef(languageCode);
  const isTranscribingRef = useRef(false);

  // Keep language ref in sync
  useEffect(() => {
    languageRef.current = languageCode;
  }, [languageCode]);

  const addEntry = useCallback(
    (entry: Omit<TranscriptEntry, 'id'>) =>
      setEntries((prev) => [{ ...entry, id: nextId() }, ...prev]),
    [],
  );

  /** Attach video element (call from VideoPlayer via callback ref) */
  const setVideoElement = useCallback((el: HTMLVideoElement | null) => {
    videoElRef.current = el;
  }, []);



  /** Start capturing audio from the video and transcribing via Sarvam AI */
  const startTranscription = useCallback(() => {
    const video = videoElRef.current;
    if (!video) {
      setError('No video element available');
      return;
    }

    // Obtain MediaStream from the video element
    let stream: MediaStream;
    try {
      // Obtain MediaStream via captureStream (non-standard but widely supported)
      const vid = video as HTMLVideoElement & {
        captureStream?: () => MediaStream;
        mozCaptureStream?: () => MediaStream;
      };
      if (typeof vid.captureStream === 'function') {
        stream = vid.captureStream();
      } else if (typeof vid.mozCaptureStream === 'function') {
        stream = vid.mozCaptureStream();
      } else {
        setError('Your browser does not support captureStream()');
        return;
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setError(`captureStream failed: ${msg}`);
      return;
    }

    const audioTracks = stream.getAudioTracks();
    if (audioTracks.length === 0) {
      addEntry({
        time: timeNow(),
        speaker: 'alert',
        text: 'No audio track found in video — transcription unavailable.',
      });
      setError('No audio track in the video');
      return;
    }

    const audioStream = new MediaStream(audioTracks);
    streamRef.current = audioStream;

    // Pick a supported MIME type for MediaRecorder
    const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
      ? 'audio/webm;codecs=opus'
      : MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : 'audio/ogg';

    setIsTranscribing(true);
    isTranscribingRef.current = true;
    setError(null);

    addEntry({
      time: timeNow(),
      speaker: 'system',
      text: 'Sarvam AI transcription initialized — listening for speech…',
      confidence: 99,
    });

    /** Record one chunk, send to Sarvam, push result */
    const recordAndTranscribe = () => {
      if (!isTranscribingRef.current) return;

      const video = videoElRef.current;
      if (!video || video.paused || video.ended) return;

      let chunks: Blob[] = [];
      let recorder: MediaRecorder;
      try {
        recorder = new MediaRecorder(audioStream, { mimeType });
      } catch {
        return;
      }
      recorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = async () => {
        if (chunks.length === 0) return;
        // Strip codec params from MIME type — Sarvam only accepts base types like audio/webm
        const uploadType = mimeType.split(';')[0];
        const blob = new Blob(chunks, { type: uploadType });
        chunks = [];

        // Skip very small blobs (silence / static)
        if (blob.size < 500) return;

        try {
          const ext = mimeType.includes('webm') ? 'webm' : 'ogg';
          const result = await transcribeAudio(blob, {
            languageCode: languageRef.current,
            model: 'saarika:v2.5',
            fileName: `audio.${ext}`,
          });

          const text = result.transcript?.trim();
          if (text) {
            addEntry({
              time: timeNow(),
              speaker: 'person',
              text,
              confidence: result.confidence,
              languageCode: result.language_code,
            });
          }
        } catch (err: unknown) {
          const msg =
            err instanceof Error ? err.message : 'Transcription failed';
          console.error('[Sarvam STT]', msg);
          addEntry({
            time: timeNow(),
            speaker: 'alert',
            text: `STT error: ${msg}`,
          });
        }
      };

      recorder.start();
      setTimeout(() => {
        if (recorder.state === 'recording') {
          recorder.stop();
        }
      }, RECORD_DURATION);
    };

    // Kick off first recording immediately
    recordAndTranscribe();

    // Continue with a recurring interval
    intervalRef.current = setInterval(
      recordAndTranscribe,
      RECORD_DURATION + RECORD_GAP,
    );
  }, [addEntry]);

  // Auto-start transcription when video element is available
  useEffect(() => {
    const checkAndStart = () => {
      if (videoElRef.current && !isTranscribingRef.current && !error) {
        startTranscription();
      }
    };

    const timer = setTimeout(checkAndStart, 2000);
    return () => clearTimeout(timer);
  }, [videoElRef.current, startTranscription, error]);

  /** Stop transcription */
  const stopTranscription = useCallback(() => {
    isTranscribingRef.current = false;

    if (recorderRef.current?.state === 'recording') {
      recorderRef.current.stop();
    }
    recorderRef.current = null;

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }

    setIsTranscribing(false);

    addEntry({
      time: timeNow(),
      speaker: 'system',
      text: 'Transcription stopped.',
    });
  }, [addEntry]);

  /** Clear all entries */
  const clearEntries = useCallback(() => setEntries([]), []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isTranscribingRef.current = false;
      if (recorderRef.current?.state === 'recording')
        recorderRef.current.stop();
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (streamRef.current)
        streamRef.current.getTracks().forEach((t) => t.stop());
    };
  }, []);

  return {
    entries,
    isTranscribing,
    error,
    languageCode,
    setLanguageCode,
    setVideoElement,
    startTranscription,
    stopTranscription,
    clearEntries,
  };
}
