import { useState } from "react";
import {
  Play,
  Pause,
  Maximize2,
  Volume2,
  Car,
  Users,
  Box,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";

const overlayToggles = [
  { icon: Car, label: "Vehicles", active: true },
  { icon: Users, label: "Pedestrians", active: true },
  { icon: Box, label: "Objects", active: false },
];

export function VideoPlayer() {
  const [isPlaying, setIsPlaying] = useState(true);
  const [toggles, setToggles] = useState(overlayToggles);

  const handleToggle = (index: number) => {
    setToggles((prev) =>
      prev.map((t, i) => (i === index ? { ...t, active: !t.active } : t))
    );
  };

  return (
    <div className="relative w-full aspect-video glass-panel overflow-hidden group">
      {/* Video Background Simulation */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {/* Scan line effect */}
        <div className="absolute inset-0 overflow-hidden opacity-10">
          <div className="absolute w-full h-px bg-gradient-to-r from-transparent via-info to-transparent animate-scan-line" />
        </div>
        
        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "linear-gradient(hsl(var(--info)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--info)) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* Simulated detection boxes */}
        <div className="absolute top-1/4 left-1/4 w-32 h-20 border-2 border-critical/70 rounded">
          <span className="absolute -top-5 left-0 text-[10px] font-mono bg-critical/80 px-1.5 py-0.5 rounded text-critical-foreground">
            SUV #1 (98%)
          </span>
        </div>
        <div className="absolute top-1/3 right-1/4 w-28 h-18 border-2 border-warning/70 rounded">
          <span className="absolute -top-5 left-0 text-[10px] font-mono bg-warning/80 px-1.5 py-0.5 rounded text-warning-foreground">
            SUV #2 (94%)
          </span>
        </div>
        <div className="absolute bottom-1/4 left-1/3 w-8 h-16 border border-info/50 rounded">
          <span className="absolute -top-5 left-0 text-[10px] font-mono bg-info/80 px-1.5 py-0.5 rounded text-info-foreground whitespace-nowrap">
            Person (87%)
          </span>
        </div>
      </div>

      {/* Top Overlay - LIVE Badge & Time */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* LIVE Badge */}
          <div className="flex items-center gap-1.5 bg-critical/90 backdrop-blur px-2.5 py-1 rounded-md">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            <span className="text-xs font-bold text-white tracking-wide">LIVE</span>
          </div>
          
          {/* Camera ID */}
          <div className="bg-black/50 backdrop-blur px-2.5 py-1 rounded-md">
            <span className="text-xs font-mono text-muted-foreground">
              CAM-04 | 4K HDR
            </span>
          </div>
        </div>

        {/* Timestamp */}
        <div className="bg-black/50 backdrop-blur px-3 py-1 rounded-md">
          <span className="text-xs font-mono text-foreground">
            2024-01-15 14:32:45.892
          </span>
        </div>
      </div>

      {/* Bottom Overlay - Controls */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 pt-12 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex items-center justify-between">
          {/* Playback Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-9 h-9 rounded-lg bg-white/10 backdrop-blur hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 text-white" />
              ) : (
                <Play className="w-4 h-4 text-white" />
              )}
            </button>
            <button className="w-9 h-9 rounded-lg bg-white/10 backdrop-blur hover:bg-white/20 flex items-center justify-center transition-colors">
              <Volume2 className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Overlay Toggles */}
          <div className="flex items-center gap-1">
            <Eye className="w-4 h-4 text-muted-foreground mr-2" />
            {toggles.map((toggle, index) => (
              <button
                key={toggle.label}
                onClick={() => handleToggle(index)}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all",
                  toggle.active
                    ? "bg-primary/20 text-primary border border-primary/30"
                    : "bg-white/10 text-muted-foreground hover:bg-white/20"
                )}
              >
                <toggle.icon className="w-3.5 h-3.5" />
                {toggle.label}
              </button>
            ))}
          </div>

          {/* Fullscreen */}
          <button className="w-9 h-9 rounded-lg bg-white/10 backdrop-blur hover:bg-white/20 flex items-center justify-center transition-colors">
            <Maximize2 className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
