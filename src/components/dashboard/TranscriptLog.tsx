import {
  MessageSquare,
  AlertCircle,
  User,
  Mic,
  MicOff,
  Trash2,
  Globe,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  type TranscriptEntry,
  SUPPORTED_LANGUAGES,
} from '@/hooks/useVideoTranscription';

interface TranscriptLogProps {
  entries: TranscriptEntry[];
  isTranscribing: boolean;
  error: string | null;
  languageCode: string;
  onLanguageChange: (code: string) => void;
  onStart: () => void;
  onStop: () => void;
  onClear: () => void;
}

export function TranscriptLog({
  entries,
  isTranscribing,
  error,
  languageCode,
  onLanguageChange,
  onStart,
  onStop,
  onClear,
}: TranscriptLogProps) {
  const getSpeakerStyle = (speaker: TranscriptEntry['speaker']) => {
    switch (speaker) {
      case 'system':
        return 'text-muted-foreground';
      case 'person':
        return 'text-foreground';
      case 'alert':
        return 'text-warning font-medium';
    }
  };

  const getSpeakerIcon = (speaker: TranscriptEntry['speaker']) => {
    switch (speaker) {
      case 'system':
        return MessageSquare;
      case 'person':
        return User;
      case 'alert':
        return AlertCircle;
    }
  };

  return (
    <div className='glass-panel p-4 h-full flex flex-col'>
      {/* Header */}
      <div className='flex items-center justify-between mb-3'>
        <div className='flex items-center gap-2'>
          <MessageSquare className='w-4 h-4 text-primary' />
          <span className='text-xs font-medium text-muted-foreground uppercase tracking-wider'>
            Real-time Transcript
          </span>
          <span className='text-[9px] font-mono text-primary/50'>
            SARVAM AI
          </span>
        </div>

        <div className='flex items-center gap-2'>
          {/* Language selector */}
          <div className='flex items-center gap-1'>
            <Globe className='w-3 h-3 text-muted-foreground' />
            <select
              value={languageCode}
              onChange={(e) => onLanguageChange(e.target.value)}
              disabled={isTranscribing}
              className='text-[10px] bg-transparent border border-border/40 rounded px-1 py-0.5 text-muted-foreground focus:outline-none focus:border-primary/50 disabled:opacity-50'
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.label}
                </option>
              ))}
            </select>
          </div>

          {/* Transcription controls */}
          <button
            onClick={isTranscribing ? onStop : onStart}
            className={cn(
              'flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium transition-colors',
              isTranscribing
                ? 'bg-critical/20 text-critical hover:bg-critical/30'
                : 'bg-safe/20 text-safe hover:bg-safe/30',
            )}
          >
            {isTranscribing ? (
              <>
                <MicOff className='w-3 h-3' /> Stop
              </>
            ) : (
              <>
                <Mic className='w-3 h-3' /> Transcribe
              </>
            )}
          </button>

          {entries.length > 0 && (
            <button
              onClick={onClear}
              className='p-1 rounded text-muted-foreground hover:text-foreground transition-colors'
              title='Clear transcript'
            >
              <Trash2 className='w-3 h-3' />
            </button>
          )}

          {/* Live indicator */}
          {isTranscribing && (
            <div className='flex items-center gap-1.5'>
              <div className='w-2 h-2 bg-safe rounded-full animate-pulse' />
              <span className='text-[10px] font-mono text-safe'>LIVE</span>
            </div>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className='mb-2 px-2 py-1.5 rounded bg-critical/10 border border-critical/20 text-[10px] text-critical'>
          {error}
        </div>
      )}

      {/* Transcript entries */}
      <div className='flex-1 overflow-y-auto custom-scrollbar space-y-2 min-h-[100px]'>
        {entries.length === 0 && (
          <div className='flex flex-col items-center justify-center h-full text-muted-foreground gap-2 py-8'>
            <Mic className='w-8 h-8 opacity-30' />
            <p className='text-xs text-center'>
              Click <strong>Transcribe</strong> to extract speech from the video
              using Sarvam AI
            </p>
            <p className='text-[10px] opacity-60'>
              Make sure the proxy server is running and the video has audio
            </p>
          </div>
        )}

        {entries.map((entry) => {
          const Icon = getSpeakerIcon(entry.speaker);
          return (
            <div
              key={entry.id}
              className={cn(
                'flex gap-2 p-2 rounded-lg animate-in fade-in slide-in-from-top-1 duration-300',
                entry.speaker === 'alert' &&
                  'bg-warning/5 border border-warning/20',
              )}
            >
              <Icon
                className={cn(
                  'w-3.5 h-3.5 mt-0.5 flex-shrink-0',
                  entry.speaker === 'alert'
                    ? 'text-warning'
                    : 'text-muted-foreground',
                )}
              />
              <div className='flex-1 min-w-0'>
                <div className='flex items-center gap-2 mb-0.5'>
                  <span className='text-[10px] font-mono text-muted-foreground'>
                    {entry.time}
                  </span>
                  {entry.confidence != null && (
                    <span className='text-[9px] font-mono text-primary/60'>
                      {entry.confidence}%
                    </span>
                  )}
                  {entry.languageCode && (
                    <span className='text-[9px] font-mono text-info/50'>
                      {entry.languageCode}
                    </span>
                  )}
                </div>
                <p
                  className={cn(
                    'text-xs leading-relaxed',
                    getSpeakerStyle(entry.speaker),
                  )}
                >
                  {entry.text}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
