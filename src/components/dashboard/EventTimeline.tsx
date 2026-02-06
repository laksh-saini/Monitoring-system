import { useState } from "react";
import { AlertTriangle, Volume2, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimelineEvent {
  time: string;
  position: number;
  type: "critical" | "warning" | "info";
  label: string;
}

const events: TimelineEvent[] = [
  { time: "0:45", position: 45, type: "critical", label: "Crash Detected" },
  { time: "0:50", position: 50, type: "warning", label: "Screaming Audio" },
  { time: "0:52", position: 52, type: "warning", label: "Glass Breaking" },
  { time: "0:55", position: 55, type: "info", label: "911 Call Initiated" },
];

export function EventTimeline() {
  const [currentTime, setCurrentTime] = useState(48);
  const [hoveredEvent, setHoveredEvent] = useState<TimelineEvent | null>(null);

  const getEventColor = (type: TimelineEvent["type"]) => {
    switch (type) {
      case "critical":
        return "bg-critical";
      case "warning":
        return "bg-warning";
      case "info":
        return "bg-info";
    }
  };

  const getEventGlow = (type: TimelineEvent["type"]) => {
    switch (type) {
      case "critical":
        return "glow-critical";
      case "warning":
        return "glow-warning";
      case "info":
        return "glow-info";
    }
  };

  return (
    <div className="glass-panel p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Event Timeline
          </span>
          <span className="text-xs font-mono text-foreground bg-accent px-2 py-0.5 rounded">
            {Math.floor(currentTime / 60)}:{String(currentTime % 60).padStart(2, "0")} / 1:30
          </span>
        </div>
        
        <div className="flex items-center gap-1">
          <button className="p-1.5 rounded hover:bg-accent transition-colors">
            <ChevronLeft className="w-4 h-4 text-muted-foreground" />
          </button>
          <button className="p-1.5 rounded hover:bg-accent transition-colors">
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Timeline Track */}
      <div className="relative h-12">
        {/* Background track */}
        <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-1 bg-accent rounded-full" />
        
        {/* Progress */}
        <div
          className="absolute top-1/2 -translate-y-1/2 left-0 h-1 bg-primary/50 rounded-full transition-all"
          style={{ width: `${(currentTime / 90) * 100}%` }}
        />

        {/* Event Markers */}
        {events.map((event, index) => (
          <div
            key={index}
            className="absolute top-1/2 -translate-y-1/2 cursor-pointer group"
            style={{ left: `${(event.position / 90) * 100}%` }}
            onMouseEnter={() => setHoveredEvent(event)}
            onMouseLeave={() => setHoveredEvent(null)}
          >
            {/* Marker dot */}
            <div
              className={cn(
                "w-4 h-4 rounded-full -ml-2 transition-transform group-hover:scale-125",
                getEventColor(event.type),
                getEventGlow(event.type)
              )}
            >
              {event.type === "critical" && (
                <AlertTriangle className="w-2.5 h-2.5 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              )}
              {event.type === "warning" && (
                <Volume2 className="w-2.5 h-2.5 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              )}
            </div>

            {/* Tooltip */}
            {hoveredEvent === event && (
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-popover border border-panel-border rounded-lg px-3 py-1.5 shadow-lg whitespace-nowrap z-10">
                <div className="text-xs font-medium text-foreground">{event.label}</div>
                <div className="text-[10px] font-mono text-muted-foreground">{event.time}</div>
              </div>
            )}
          </div>
        ))}

        {/* Playhead */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-foreground cursor-ew-resize"
          style={{ left: `${(currentTime / 90) * 100}%` }}
        >
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-foreground rounded-full" />
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-foreground rounded-full" />
        </div>
      </div>

      {/* Time markers */}
      <div className="flex justify-between mt-2 text-[10px] font-mono text-muted-foreground">
        <span>0:00</span>
        <span>0:30</span>
        <span>1:00</span>
        <span>1:30</span>
      </div>
    </div>
  );
}
