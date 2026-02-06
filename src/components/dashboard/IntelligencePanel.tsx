import {
  AlertTriangle,
  Eye,
  Mic,
  FileText,
  Ambulance,
  Shield,
  FileDown,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface EvidenceItem {
  icon: typeof Eye;
  label: string;
  score: number;
  status: "high" | "medium" | "low";
}

const evidenceItems: EvidenceItem[] = [
  { icon: Eye, label: "Visual Analysis", score: 98, status: "high" },
  { icon: Mic, label: "Audio Analysis", score: 85, status: "high" },
  { icon: FileText, label: "Text Reports", score: 67, status: "medium" },
];

const actionItems = [
  { icon: Ambulance, label: "Dispatch EMS", priority: "critical" },
  { icon: Shield, label: "Alert Patrol Unit", priority: "warning" },
  { icon: FileDown, label: "Generate PDF Report", priority: "info" },
];

export function IntelligencePanel() {
  return (
    <aside className="w-80 flex-shrink-0 glass-panel-glow border-l border-panel-border flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-panel-border">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-foreground">
            Incident #4029 Analysis
          </h2>
          <span className="badge-critical text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
            Critical
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          Multi-vehicle collision • Active response
        </p>
      </div>

      {/* Severity Score */}
      <div className="p-4 border-b border-panel-border">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Severity Score
          </span>
          <span className="text-2xl font-bold text-critical font-mono">92</span>
        </div>

        {/* Radial-ish progress bar */}
        <div className="relative h-3 bg-muted rounded-full overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-safe via-warning to-critical rounded-full transition-all duration-500"
            style={{ width: "92%" }}
          />
          <div className="absolute inset-0 flex items-center justify-between px-1">
            {[0, 25, 50, 75, 100].map((mark) => (
              <div
                key={mark}
                className="w-0.5 h-2 bg-background/50 rounded"
              />
            ))}
          </div>
        </div>
        <div className="flex justify-between mt-1 text-[10px] text-muted-foreground">
          <span>Low</span>
          <span>Moderate</span>
          <span>Critical</span>
        </div>
      </div>

      {/* AI Summary */}
      <div className="p-4 border-b border-panel-border">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="w-4 h-4 text-warning" />
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            AI Summary
          </span>
        </div>
        <p className="text-xs text-foreground leading-relaxed">
          The system has detected a{" "}
          <span className="text-critical font-medium">high-velocity collision</span>{" "}
          involving two SUVs. Audio analysis confirms breaking glass and distress
          signals. Emergency response is recommended.
        </p>
      </div>

      {/* Evidence Scores */}
      <div className="p-4 border-b border-panel-border flex-1 overflow-y-auto">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-3">
          Evidence Confidence
        </span>
        <div className="space-y-3">
          {evidenceItems.map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-3 p-2 rounded-lg bg-accent/30"
            >
              <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
                <item.icon className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-foreground">
                    {item.label}
                  </span>
                  <span
                    className={cn(
                      "text-xs font-bold font-mono",
                      item.status === "high" && "text-safe",
                      item.status === "medium" && "text-warning",
                      item.status === "low" && "text-critical"
                    )}
                  >
                    {item.score}%
                  </span>
                </div>
                <div className="h-1.5 bg-muted rounded-full mt-1 overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      item.status === "high" && "bg-safe",
                      item.status === "medium" && "bg-warning",
                      item.status === "low" && "bg-critical"
                    )}
                    style={{ width: `${item.score}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* New Evidence Alert */}
        <div className="mt-3 p-2 rounded-lg border border-info/30 bg-info/5">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-info" />
            <span className="text-xs text-info font-medium">
              3 New Social Media Reports
            </span>
          </div>
        </div>
      </div>

      {/* Action Plan */}
      <div className="p-4 border-t border-panel-border">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-3">
          Action Plan
        </span>
        <div className="space-y-2">
          {actionItems.map((action, index) => (
            <button
              key={action.label}
              className={cn(
                "w-full flex items-center justify-between p-2.5 rounded-lg transition-all text-sm font-medium",
                action.priority === "critical" &&
                  "bg-critical hover:bg-critical/90 text-critical-foreground glow-critical",
                action.priority === "warning" &&
                  "bg-warning/10 hover:bg-warning/20 text-warning border border-warning/30",
                action.priority === "info" &&
                  "bg-accent hover:bg-accent/80 text-muted-foreground"
              )}
            >
              <div className="flex items-center gap-2">
                {index === 0 ? (
                  <action.icon className="w-4 h-4" />
                ) : (
                  <action.icon className="w-4 h-4" />
                )}
                {action.label}
              </div>
              <ChevronRight className="w-4 h-4" />
            </button>
          ))}
        </div>

        {/* Completion Status */}
        <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
          <CheckCircle2 className="w-4 h-4 text-safe" />
          <span>2 of 5 actions completed</span>
        </div>
      </div>
    </aside>
  );
}
