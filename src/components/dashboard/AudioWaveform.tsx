import { useEffect, useState } from "react";
import { Mic, Volume2 } from "lucide-react";

export function AudioWaveform() {
  const [bars, setBars] = useState<number[]>(Array(32).fill(20));

  useEffect(() => {
    const interval = setInterval(() => {
      setBars((prev) =>
        prev.map(() => Math.random() * 80 + 20)
      );
    }, 100);
    return () => clearInterval(interval);
  }, []);

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
          <Volume2 className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-xs font-mono text-muted-foreground">-12dB</span>
        </div>
      </div>

      {/* Waveform Visualizer */}
      <div className="flex-1 flex items-center justify-center gap-0.5 min-h-[100px]">
        {bars.map((height, index) => (
          <div
            key={index}
            className="w-1.5 rounded-full bg-gradient-to-t from-info/50 to-info transition-all duration-100"
            style={{ height: `${height}%` }}
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
