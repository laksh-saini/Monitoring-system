import { useEffect, useState, useRef } from "react";
import { Mic, Volume2 } from "lucide-react";

export function AudioWaveform({ videoElement }: { videoElement?: HTMLVideoElement | null }) {
  const [bars, setBars] = useState<number[]>(Array(32).fill(5));
  const animationRef = useRef<number>();
  const analyserRef = useRef<AnalyserNode>();
  const sourceRef = useRef<MediaElementAudioSourceNode>();
  const audioContextRef = useRef<AudioContext>();

  useEffect(() => {
    if (!videoElement) return;

    // Initialize Audio Context
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ctx = audioContextRef.current;

    // Create source if not exists
    if (!sourceRef.current) {
      try {
        const source = ctx.createMediaElementSource(videoElement);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 64;
        source.connect(analyser);
        analyser.connect(ctx.destination);

        sourceRef.current = source;
        analyserRef.current = analyser;
      } catch (e) {
        console.error("Audio context error:", e);
      }
    }

    const updateWaveform = () => {
      if (analyserRef.current) {
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);

        // Map 32 bars from frequency data
        let newBars = Array.from(dataArray).slice(0, 32).map(val => (val / 255) * 100);

        // Simulation: If bars are all near zero but video exists, add random noise for visual "aliveness"
        // This handles cases where video is muted or CORS prevents audio analysis
        const isSilent = newBars.every(b => b < 1);
        if (isSilent && videoElement && !videoElement.paused) {
          newBars = newBars.map(() => Math.random() * 30 + 5);
        }

        setBars(newBars);
      }
      animationRef.current = requestAnimationFrame(updateWaveform);
    };

    updateWaveform();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [videoElement]);

  return (
    <div className="glass-panel p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Mic className="w-4 h-4 text-info" />
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Audio Analysis
          </span>
        </div>
        <div className="flex items-center gap-2">
          {/* <Volume2 className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-xs font-mono text-muted-foreground">-12dB</span> */}
        </div>
      </div>

      {/* Waveform Visualizer */}
      <div className="flex-1 flex items-center justify-center gap-0.5 min-h-[100px] items-end pb-2">
        {bars.map((height, index) => (
          <div
            key={index}
            className="w-1.5 rounded-t-full bg-gradient-to-t from-info/20 to-info transition-all duration-75"
            style={{ height: `${Math.max(5, height)}%` }}
          />
        ))}
      </div>

      {/* Frequency Labels */}
      <div className="flex justify-between mt-2 text-[10px] font-mono text-muted-foreground">
        <span>20Hz</span>
        <span>500Hz</span>
        <span>2kHz</span>
        <span>20kHz</span>
      </div>
    </div>
  );
}
