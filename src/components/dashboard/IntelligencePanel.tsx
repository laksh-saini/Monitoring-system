import { useState } from "react";
import {
  Eye,
  Mic,
  FileText,
  Ambulance,
  Shield,
  FileDown,
  CheckCircle2,
  ChevronRight,
  Phone,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CallDialog } from "./CallDialog";
import { useActionTracking } from "@/hooks/useActionTracking";
import { getContactByType, EmergencyContact } from "@/lib/EmergencyContacts";
import { generateIncidentReport } from "@/lib/ReportGenerator";
import { ActionLogger } from "@/lib/ActionLogger";
import { toast } from "sonner";

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

interface ActionItem {
  id: string;
  icon: typeof Ambulance;
  label: string;
  priority: "critical" | "warning" | "info";
  contactType?: "ems" | "police" | "security";
  action: "call" | "report" | "notify";
}

const actionItems: ActionItem[] = [
  {
    id: "dispatch_ems",
    icon: Ambulance,
    label: "Dispatch EMS",
    priority: "critical",
    contactType: "ems",
    action: "call",
  },
  {
    id: "alert_patrol",
    icon: Shield,
    label: "Alert Patrol Unit",
    priority: "warning",
    contactType: "security",
    action: "call",
  },
  {
    id: "generate_report",
    icon: FileDown,
    label: "Generate PDF Report",
    priority: "info",
    action: "report",
  },
];

const INCIDENT_ID = "4029";
const INCIDENT_DESCRIPTION = "Multi-vehicle collision • Active response";

interface IntelligencePanelProps {
  severityScore?: number;
  severityFactors?: string[];
}

export function IntelligencePanel({
  severityScore = 50,
  severityFactors = []
}: IntelligencePanelProps) {
  const [callDialogOpen, setCallDialogOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<EmergencyContact | null>(null);
  const [currentActionId, setCurrentActionId] = useState<string>("");

  const { isCompleted, completeAction, completionCount, completedActions, resetActions } = useActionTracking(
    INCIDENT_ID,
    actionItems.length
  );

  const handleResetActions = () => {
    resetActions();
    toast.info("Actions Reset", {
      description: "All actions have been cleared. You can start fresh.",
    });
  };

  const handleGenerateReport = () => {
    try {
      // Get completed action labels
      const completedActionLabels = actionItems
        .filter(action => completedActions.has(action.id))
        .map(action => action.label);

      // Generate the PDF report
      generateIncidentReport({
        incidentId: INCIDENT_ID,
        title: "Multi-Vehicle Collision",
        description: INCIDENT_DESCRIPTION,
        timestamp: new Date(),
        severityScore: severityScore,
        evidenceScores: {
          visual: evidenceItems[0].score,
          audio: evidenceItems[1].score,
          textReports: evidenceItems[2].score,
        },
        actionsCompleted: completedActionLabels,
        location: "Highway 101, Exit 45",
      });

      // Log the action
      ActionLogger.log("REPORT_GENERATED", INCIDENT_ID, {
        description: "PDF incident report generated and downloaded",
      });

      toast.success("Report Generated", {
        description: `Incident #${INCIDENT_ID} report downloaded successfully.`,
      });

      completeAction("generate_report");
    } catch (error) {
      console.error("Error generating report:", error);
      toast.error("Report Generation Failed", {
        description: "Unable to generate PDF report. Please try again.",
      });
    }
  };

  const handleActionClick = (action: ActionItem) => {
    console.log("Action clicked:", action);
    if (action.action === "call" && action.contactType) {
      const contact = getContactByType(action.contactType);
      console.log("Contact found:", contact);
      if (contact) {
        setSelectedContact(contact);
        setCurrentActionId(action.id);
        setCallDialogOpen(true);
      } else {
        console.error("Contact not found for type:", action.contactType);
        toast.error("Contact not found", {
          description: `Unable to find contact information for ${action.label}`,
        });
      }
    } else if (action.action === "report") {
      handleGenerateReport();
    } else if (action.action === "notify") {
      toast.success("Notification Sent", {
        description: `${action.label} notification has been sent.`,
      });
      completeAction(action.id);
    }
  };

  const handleCallCompleted = () => {
    if (currentActionId) {
      completeAction(currentActionId);
      toast.success("Call Initiated", {
        description: `Emergency call to ${selectedContact?.name} has been initiated.`,
      });
    }
  };

  return (
    <aside className="w-80 flex-shrink-0 glass-panel-glow border-l border-panel-border flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-panel-border">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-foreground">
            Incident #{INCIDENT_ID} Analysis
          </h2>
          <span className="badge-critical text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
            Critical
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          {INCIDENT_DESCRIPTION}
        </p>
      </div>

      {/* Severity Score */}
      <div className="p-4 border-b border-panel-border">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Severity Score
          </span>
          <span className="text-2xl font-bold text-critical font-mono">{severityScore}</span>
        </div>

        {/* Radial-ish progress bar */}
        <div className="relative h-3 bg-muted rounded-full overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-safe via-warning to-critical rounded-full transition-all duration-500"
            style={{ width: `${severityScore}%` }}
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
          {actionItems.map((action) => {
            const completed = isCompleted(action.id);

            return (
              <button
                key={action.id}
                onClick={() => !completed && handleActionClick(action)}
                disabled={completed}
                className={cn(
                  "w-full flex items-center justify-between p-2.5 rounded-lg transition-all text-sm font-medium",
                  completed && "opacity-60 cursor-not-allowed",
                  !completed && action.priority === "critical" &&
                  "bg-critical hover:bg-critical/90 text-critical-foreground glow-critical",
                  !completed && action.priority === "warning" &&
                  "bg-warning/10 hover:bg-warning/20 text-warning border border-warning/30",
                  !completed && action.priority === "info" &&
                  "bg-accent hover:bg-accent/80 text-muted-foreground",
                  completed && "bg-safe/10 border border-safe/30"
                )}
              >
                <div className="flex items-center gap-2">
                  {completed ? (
                    <CheckCircle2 className="w-4 h-4 text-safe" />
                  ) : action.action === "call" ? (
                    <Phone className="w-4 h-4" />
                  ) : (
                    <action.icon className="w-4 h-4" />
                  )}
                  <span className={completed ? "text-safe" : ""}>
                    {action.label}
                  </span>
                </div>
                {completed ? (
                  <CheckCircle2 className="w-4 h-4 text-safe" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
            );
          })}
        </div>

        {/* Completion Status */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <CheckCircle2 className="w-4 h-4 text-safe" />
            <span>{completionCount} of {actionItems.length} actions completed</span>
          </div>
          {completionCount > 0 && (
            <button
              onClick={handleResetActions}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              title="Reset all actions"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Call Dialog */}
      {selectedContact && (
        <CallDialog
          open={callDialogOpen}
          onOpenChange={setCallDialogOpen}
          contact={selectedContact}
          incidentId={INCIDENT_ID}
          incidentDescription={INCIDENT_DESCRIPTION}
          onCallCompleted={handleCallCompleted}
        />
      )}
    </aside>
  );
}
