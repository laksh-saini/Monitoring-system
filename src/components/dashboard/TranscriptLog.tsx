import { MessageSquare, AlertCircle, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface TranscriptEntry {
  time: string;
  speaker: "system" | "person" | "alert";
  text: string;
  confidence?: number;
}

const transcriptData: TranscriptEntry[] = [
  {
    time: "14:32:42",
    speaker: "system",
    text: "Audio stream initialized. Analyzing ambient noise patterns.",
    confidence: 99,
  },
  {
    time: "14:32:45",
    speaker: "alert",
    text: "HIGH-VELOCITY IMPACT DETECTED - 87dB peak amplitude",
  },
  {
    time: "14:32:46",
    speaker: "system",
    text: "Glass shattering signature identified (confidence: 94%)",
    confidence: 94,
  },
  {
    time: "14:32:48",
    speaker: "person",
    text: '"Oh my god! Someone call 911!"',
    confidence: 78,
  },
  {
    time: "14:32:50",
    speaker: "alert",
    text: "DISTRESS VOCALIZATIONS DETECTED - Female voice, elevated stress markers",
  },
  {
    time: "14:32:52",
    speaker: "person",
    text: '"Is anyone hurt? Stay in your vehicle!"',
    confidence: 82,
  },
  {
    time: "14:32:55",
    speaker: "system",
    text: "Car alarm triggered - matching SUV #2 audio signature",
    confidence: 91,
  },
];

export function TranscriptLog() {
  const getSpeakerStyle = (speaker: TranscriptEntry["speaker"]) => {
    switch (speaker) {
      case "system":
        return "text-muted-foreground";
      case "person":
        return "text-foreground";
      case "alert":
        return "text-warning font-medium";
    }
  };

  const getSpeakerIcon = (speaker: TranscriptEntry["speaker"]) => {
    switch (speaker) {
      case "system":
        return MessageSquare;
      case "person":
        return User;
      case "alert":
        return AlertCircle;
    }
  };

  return (
    <div className="glass-panel p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-primary" />
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Real-time Transcript
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 bg-safe rounded-full animate-pulse" />
          <span className="text-[10px] font-mono text-safe">LIVE</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 min-h-[100px]">
        {transcriptData.map((entry, index) => {
          const Icon = getSpeakerIcon(entry.speaker);
          return (
            <div
              key={index}
              className={cn(
                "flex gap-2 p-2 rounded-lg",
                entry.speaker === "alert" && "bg-warning/5 border border-warning/20"
              )}
            >
              <Icon
                className={cn(
                  "w-3.5 h-3.5 mt-0.5 flex-shrink-0",
                  entry.speaker === "alert" ? "text-warning" : "text-muted-foreground"
                )}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[10px] font-mono text-muted-foreground">
                    {entry.time}
                  </span>
                  {entry.confidence && (
                    <span className="text-[9px] font-mono text-primary/60">
                      {entry.confidence}%
                    </span>
                  )}
                </div>
                <p className={cn("text-xs leading-relaxed", getSpeakerStyle(entry.speaker))}>
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
