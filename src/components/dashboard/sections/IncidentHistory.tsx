import React, { useState } from "react";
import {
  Search,
  Filter,
  ChevronDown,
  AlertCircle,
  AlertTriangle,
  AlertOctagon,
  Video,
  Headphones,
  FileText,
  MapPin,
  Clock,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

// Type definitions
export interface Incident {
  id: string;
  severity: "critical" | "moderate" | "low";
  type: string;
  typeIcon: React.ReactNode;
  location: string;
  time: string;
  status: "open" | "investigating" | "closed" | "false-alarm";
  evidence: ("video" | "audio" | "report")[];
  description?: string;
  aiSummary?: string;
}

// Sample data
const incidentData: Incident[] = [
  {
    id: "#4032",
    severity: "critical",
    type: "Vehicle Collision",
    typeIcon: "🚗",
    location: "Main St. & 4th Ave",
    time: "Today, 14:32",
    status: "investigating",
    evidence: ["video", "audio", "report"],
    description: "Multi-vehicle collision blocking main intersection",
  },
  {
    id: "#4031",
    severity: "critical",
    type: "Fire",
    typeIcon: "🔥",
    location: "Downtown Building 12",
    time: "Today, 13:15",
    status: "investigating",
    evidence: ["video", "report"],
    description: "Fire reported in commercial building",
  },
  {
    id: "#4030",
    severity: "moderate",
    type: "Medical Emergency",
    typeIcon: "🚑",
    location: "Central Park Entrance",
    time: "Today, 12:45",
    status: "closed",
    evidence: ["audio", "report"],
    description: "Cardiac emergency, patient transported",
  },
  {
    id: "#4029",
    severity: "moderate",
    type: "Traffic Violation",
    typeIcon: "🚨",
    location: "Highway 101, Mile 45",
    time: "Today, 11:20",
    status: "closed",
    evidence: ["video"],
    description: "Speeding vehicle detected and reported",
  },
  {
    id: "#4028",
    severity: "low",
    type: "Disturbance",
    typeIcon: "🔔",
    location: "Shopping District",
    time: "Today, 10:05",
    status: "false-alarm",
    evidence: ["report"],
    description: "Noise complaint, no issue found",
  },
  {
    id: "#4027",
    severity: "critical",
    type: "Intrusion Alert",
    typeIcon: "🚨",
    location: "Bank of Americas - Branch 7",
    time: "Yesterday, 22:30",
    status: "closed",
    evidence: ["video", "audio"],
    description: "Unauthorized entry attempt detected",
  },
  {
    id: "#4026",
    severity: "moderate",
    type: "Hit & Run",
    typeIcon: "🚗",
    location: "Residential Area, Elm St.",
    time: "Yesterday, 18:45",
    status: "investigating",
    evidence: ["video", "report"],
    description: "Vehicle fled scene after minor collision",
  },
  {
    id: "#4025",
    severity: "low",
    type: "Parking Violation",
    typeIcon: "🅿️",
    location: "Downtown Garage Level 3",
    time: "Yesterday, 16:20",
    status: "closed",
    evidence: ["report"],
    description: "Illegally parked vehicle towed",
  },
];

// Severity badge color mapping
const severityColors = {
  critical: "bg-destructive/10 text-destructive border-destructive/20",
  moderate: "bg-warning/10 text-warning border-warning/20",
  low: "bg-safe/10 text-safe border-safe/20",
};

const severityIcons = {
  critical: <AlertOctagon className="w-4 h-4" />,
  moderate: <AlertTriangle className="w-4 h-4" />,
  low: <AlertCircle className="w-4 h-4" />,
};

const statusBadges = {
  open: "bg-primary/10 text-primary border-primary/20",
  investigating: "bg-warning/10 text-warning border-warning/20",
  closed: "bg-safe/10 text-safe border-safe/20",
  "false-alarm": "bg-muted/10 text-muted-foreground border-muted/20",
};

export const IncidentHistory = ({
  incoming = [],
}: {
  incoming?: Incident[];
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSeverity, setSelectedSeverity] = useState<
    "all" | "critical" | "moderate" | "low"
  >("all");
  const [dateRange, setDateRange] = useState<"24h" | "7d" | "30d">("24h");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Merge incoming detections at the top, keep only 12 incidents total
  const merged = [...incoming, ...incidentData].slice(0, 12);

  // Filter incidents
  const filteredIncidents = merged.filter((incident) => {
    const matchesSearch =
      incident.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.type.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSeverity =
      selectedSeverity === "all" || incident.severity === selectedSeverity;

    return matchesSearch && matchesSeverity;
  });

  const displayedIncidents = filteredIncidents;

  return (
    <div className="h-full flex flex-col gap-4 p-4">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          📕 Incident History
        </h2>
        <p className="text-sm text-muted-foreground">
          Searchable database of all past events
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3">
        {/* Search and Date Range */}
        <div className="flex gap-2 items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search incidents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-panel border-panel-border"
            />
          </div>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as "24h" | "7d" | "30d")}
            className="px-3 py-2 bg-panel border border-panel-border rounded-lg text-sm text-foreground hover:bg-accent transition-colors"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
        </div>

        {/* Severity Filter */}
        <div className="flex gap-2">
          <span className="text-xs text-muted-foreground flex items-center">
            <Filter className="w-4 h-4 mr-1" /> Severity:
          </span>
          {(["all", "critical", "moderate", "low"] as const).map((severity) => (
            <button
              key={severity}
              onClick={() => setSelectedSeverity(severity)}
              className={cn(
                "px-3 py-1 rounded-full text-xs font-medium transition-all",
                selectedSeverity === severity
                  ? "bg-primary/20 text-primary border border-primary/30"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
            >
              {severity.charAt(0).toUpperCase() + severity.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto incident-scrollbar glass-panel border border-panel-border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow className="border-panel-border hover:bg-transparent">
              <TableHead className="w-16">ID</TableHead>
              <TableHead className="w-24">Severity</TableHead>
              <TableHead className="w-32">Type</TableHead>
              <TableHead className="flex-1">Location</TableHead>
              <TableHead className="w-24">Time</TableHead>
              <TableHead className="w-28">Status</TableHead>
              <TableHead className="w-32">Evidence</TableHead>
              <TableHead className="w-8"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayedIncidents.map((incident) => (
              <React.Fragment key={incident.id}>
                <TableRow
                  onClick={() =>
                    setExpandedId(
                      expandedId === incident.id ? null : incident.id
                    )
                  }
                  className="cursor-pointer hover:bg-accent/50 border-panel-border"
                >
                  <TableCell>
                    <a
                      href="#"
                      className="text-primary hover:underline font-mono text-sm"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {incident.id}
                    </a>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        "gap-1.5 py-1",
                        severityColors[incident.severity]
                      )}
                    >
                      {severityIcons[incident.severity]}
                      {incident.severity.charAt(0).toUpperCase() +
                        incident.severity.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    <span className="mr-2">{incident.typeIcon}</span>
                    {incident.type}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    <MapPin className="w-3.5 h-3.5 inline mr-1" />
                    {incident.location}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    <Clock className="w-3.5 h-3.5 inline mr-1" />
                    {incident.time}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn("py-0.5", statusBadges[incident.status])}
                    >
                      {incident.status.charAt(0).toUpperCase() +
                        incident.status.slice(1).replace("-", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {incident.evidence.includes("video") && (
                        <div className="w-6 h-6 rounded bg-info/10 flex items-center justify-center hover:bg-info/20 transition-colors">
                          <Video className="w-3.5 h-3.5 text-info" />
                        </div>
                      )}
                      {incident.evidence.includes("audio") && (
                        <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors">
                          <Headphones className="w-3.5 h-3.5 text-primary" />
                        </div>
                      )}
                      {incident.evidence.includes("report") && (
                        <div className="w-6 h-6 rounded bg-warning/10 flex items-center justify-center hover:bg-warning/20 transition-colors">
                          <FileText className="w-3.5 h-3.5 text-warning" />
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <ChevronDown
                      className={cn(
                        "w-4 h-4 text-muted-foreground transition-transform",
                        expandedId === incident.id && "rotate-180"
                      )}
                    />
                  </TableCell>
                </TableRow>

                {/* Expanded Details Row */}
                {expandedId === incident.id && (
                  <TableRow className="hover:bg-accent/30 border-panel-border">
                    <TableCell colSpan={8} className="bg-accent/20 p-4">
                      <div className="space-y-3">
                        {incident.aiSummary && (
                          <div className="bg-panel border border-panel-border p-3 rounded-md">
                            <div className="flex items-start gap-3">
                              <div className="text-warning mt-1">
                                <AlertTriangle className="w-5 h-5" />
                              </div>
                              <div>
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">AI Summary</p>
                                <p className="text-sm text-foreground mt-1">
                                  {incident.aiSummary}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                        <div className="text-sm">
                          <p className="text-foreground font-semibold mb-2">
                            Incident Details
                          </p>
                          <p className="text-muted-foreground">
                            {incident.description}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          className="gap-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Eye className="w-4 h-4" />
                          View Full Report
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Results status bar */}
      <div className="flex items-center justify-between px-4 py-3 rounded-lg glass-panel border border-panel-border bg-panel/50">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-xs font-medium text-muted-foreground">
            Showing{" "}
            <span className="font-mono text-foreground">{displayedIncidents.length}</span>
            {" of "}
            <span className="font-mono text-foreground">{filteredIncidents.length}</span>
            {" incidents"}
          </span>
        </div>
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground/80">
          12 max
        </span>
      </div>
    </div>
  );
};
