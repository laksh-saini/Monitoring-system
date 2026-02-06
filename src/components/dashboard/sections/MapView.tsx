import React, { useState } from "react";
import {
  MapPin,
  Camera,
  AlertCircle,
  AlertTriangle,
  AlertOctagon,
  Users,
  Layers,
  Radio,
  Eye,
  EyeOff,
  Navigation,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

// Type definitions
interface MapIncident {
  id: string;
  lat: number;
  lng: number;
  severity: "critical" | "moderate" | "low";
  title: string;
  time: string;
  location: string;
}

interface MapCamera {
  id: string;
  lat: number;
  lng: number;
  name: string;
  status: "online" | "offline";
  location: string;
}

interface MapUnit {
  id: string;
  lat: number;
  lng: number;
  type: "patrol" | "ambulance";
  status: string;
  responseTime?: string;
}

interface ActiveAlert {
  id: string;
  type: string;
  severity: "critical" | "moderate" | "low";
  location: string;
  time: string;
}

// Mock data
const incidents: MapIncident[] = [
  {
    id: "inc-1",
    lat: 40.7128,
    lng: -74.006,
    severity: "critical",
    title: "Vehicle Collision",
    time: "14:32",
    location: "Main St. & 4th Ave",
  },
  {
    id: "inc-2",
    lat: 40.715,
    lng: -74.008,
    severity: "critical",
    title: "Fire Alarm",
    time: "13:15",
    location: "Downtown Building 12",
  },
  {
    id: "inc-3",
    lat: 40.71,
    lng: -73.99,
    severity: "moderate",
    title: "Medical Emergency",
    time: "12:45",
    location: "Central Park Entrance",
  },
  {
    id: "inc-4",
    lat: 40.7,
    lng: -74.01,
    severity: "low",
    title: "Traffic Violation",
    time: "11:20",
    location: "Highway 101, Mile 45",
  },
];

const cameras: MapCamera[] = [
  {
    id: "cam-1",
    lat: 40.7128,
    lng: -74.006,
    name: "Main St. Camera 1",
    status: "online",
    location: "Main St. & 4th Ave",
  },
  {
    id: "cam-2",
    lat: 40.715,
    lng: -74.008,
    name: "Downtown Cam 1",
    status: "online",
    location: "Downtown Building 12",
  },
  {
    id: "cam-3",
    lat: 40.71,
    lng: -73.99,
    name: "Park Entrance Cam",
    status: "offline",
    location: "Central Park Entrance",
  },
  {
    id: "cam-4",
    lat: 40.7,
    lng: -74.01,
    name: "Highway Cam 1",
    status: "online",
    location: "Highway 101, Mile 45",
  },
];

const units: MapUnit[] = [
  {
    id: "unit-1",
    lat: 40.714,
    lng: -74.007,
    type: "patrol",
    status: "Responding to Main St incident",
    responseTime: "2 min ETA",
  },
  {
    id: "unit-2",
    lat: 40.712,
    lng: -74.005,
    type: "ambulance",
    status: "En route to Medical Emergency",
    responseTime: "5 min ETA",
  },
  {
    id: "unit-3",
    lat: 40.708,
    lng: -74.002,
    type: "patrol",
    status: "Patrolling Downtown Area",
  },
];

const activeAlerts: ActiveAlert[] = [
  {
    id: "alert-1",
    type: "🚗 Vehicle Collision",
    severity: "critical",
    location: "Main St. & 4th Ave",
    time: "14:32",
  },
  {
    id: "alert-2",
    type: "🔥 Fire Alert",
    severity: "critical",
    location: "Downtown Building 12",
    time: "13:15",
  },
  {
    id: "alert-3",
    type: "🚑 Medical Emergency",
    severity: "moderate",
    location: "Central Park Entrance",
    time: "12:45",
  },
];

const severityColors = {
  critical: { bg: "bg-destructive/20", text: "text-destructive", icon: AlertOctagon },
  moderate: { bg: "bg-warning/20", text: "text-warning", icon: AlertTriangle },
  low: { bg: "bg-safe/20", text: "text-safe", icon: AlertCircle },
};

export const MapView = () => {
  const [showIncidents, setShowIncidents] = useState(true);
  const [showCameras, setShowCameras] = useState(true);
  const [showUnits, setShowUnits] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<string | null>(null);
  const [selectedCamera, setSelectedCamera] = useState<string | null>(null);
  const [hoveredAlert, setHoveredAlert] = useState<string | null>(null);

  return (
    <div className="h-full flex gap-4 p-4">
      {/* Left Sidebar - Active Alerts */}
      <div className="w-80 flex flex-col gap-3">
        <div>
          <h2 className="text-lg font-bold text-foreground mb-1">
            🗺️ Active Alerts
          </h2>
          <p className="text-xs text-muted-foreground">
            Click to pan and view details
          </p>
        </div>

        <div className="flex-1 overflow-auto space-y-2">
          {activeAlerts.map((alert) => {
            const severityColor = severityColors[alert.severity];
            const Icon = severityColor.icon;

            return (
              <Card
                key={alert.id}
                onClick={() => setSelectedIncident(alert.id)}
                className={cn(
                  "glass-panel border-panel-border p-3 cursor-pointer transition-all hover:border-primary/50",
                  selectedIncident === alert.id && "border-primary/50 bg-primary/10"
                )}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      "p-2 rounded-lg flex-shrink-0",
                      severityColor.bg
                    )}
                  >
                    <Icon className={cn("w-4 h-4", severityColor.text)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {alert.type}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {alert.location}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {alert.time}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[10px] py-0.5 flex-shrink-0",
                      severityColor.text
                    )}
                  >
                    {alert.severity === "critical" ? "🔴" : "🟡"}
                  </Badge>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Main Map Area */}
      <div className="flex-1 flex flex-col">
        {/* Layer Controls */}
        <Card className="glass-panel border-panel-border p-3 mb-3">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs font-semibold text-foreground">
                Map Layers:
              </span>
            </div>
            <div className="flex gap-3">
              {/* Incidents Toggle */}
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={showIncidents}
                  onCheckedChange={(checked) =>
                    setShowIncidents(checked as boolean)
                  }
                />
                <span className="text-xs text-foreground">Incidents</span>
              </label>

              {/* Cameras Toggle */}
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={showCameras}
                  onCheckedChange={(checked) =>
                    setShowCameras(checked as boolean)
                  }
                />
                <span className="text-xs text-foreground">Cameras</span>
              </label>

              {/* Units Toggle */}
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={showUnits}
                  onCheckedChange={(checked) =>
                    setShowUnits(checked as boolean)
                  }
                />
                <span className="text-xs text-foreground">Units</span>
              </label>

              {/* Heatmap Toggle */}
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={showHeatmap}
                  onCheckedChange={(checked) =>
                    setShowHeatmap(checked as boolean)
                  }
                />
                <span className="text-xs text-foreground">Heatmap</span>
              </label>
            </div>
          </div>
        </Card>

        {/* Map Container */}
        <Card className="glass-panel border-panel-border flex-1 p-4 flex flex-col overflow-hidden relative">
          {/* Heatmap Background */}
          {showHeatmap && (
            <div className="absolute inset-0 rounded-lg opacity-20 pointer-events-none">
              <div
                className="absolute w-40 h-40 rounded-full"
                style={{
                  background:
                    "radial-gradient(circle, rgba(239, 68, 68, 0.8), transparent)",
                  top: "30%",
                  left: "40%",
                }}
              />
              <div
                className="absolute w-32 h-32 rounded-full"
                style={{
                  background:
                    "radial-gradient(circle, rgba(249, 115, 22, 0.6), transparent)",
                  top: "50%",
                  right: "35%",
                }}
              />
            </div>
          )}

          {/* Map Grid */}
          <div className="relative flex-1 border border-panel-border rounded-lg bg-gradient-to-br from-slate-900 to-slate-800 p-4 overflow-hidden">
            {/* Map markers SVG overlay */}
            <svg
              className="absolute inset-0 w-full h-full"
              style={{ pointerEvents: "none" }}
            >
              {/* Grid lines */}
              <defs>
                <pattern
                  id="grid"
                  width="40"
                  height="40"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M 40 0 L 0 0 0 40"
                    fill="none"
                    stroke="rgba(255,255,255,0.05)"
                    strokeWidth="0.5"
                  />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>

            {/* Incidents */}
            {showIncidents &&
              incidents.map((incident) => (
                <div
                  key={incident.id}
                  onClick={() => setSelectedIncident(incident.id)}
                  className={cn(
                    "absolute w-8 h-8 -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all",
                    selectedIncident === incident.id && "scale-125"
                  )}
                  style={{
                    left: `${((incident.lng + 74.02) / 0.04) * 100}%`,
                    top: `${((40.73 - incident.lat) / 0.04) * 100}%`,
                  }}
                >
                  <div className="relative">
                    <div
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold animate-pulse z-10 relative",
                        incident.severity === "critical"
                          ? "bg-destructive text-white shadow-lg shadow-destructive"
                          : incident.severity === "moderate"
                            ? "bg-warning text-white shadow-lg shadow-warning"
                            : "bg-safe text-white shadow-lg shadow-safe"
                      )}
                    >
                      {incident.severity === "critical"
                        ? "🔴"
                        : incident.severity === "moderate"
                          ? "🟡"
                          : "🟢"}
                    </div>
                    {selectedIncident === incident.id && (
                      <div className="absolute inset-0 rounded-full border-2 border-current animate-ping" />
                    )}
                  </div>
                </div>
              ))}

            {/* Cameras */}
            {showCameras &&
              cameras.map((camera) => (
                <div
                  key={camera.id}
                  onClick={() => setSelectedCamera(camera.id)}
                  className={cn(
                    "absolute w-6 h-6 -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all",
                    selectedCamera === camera.id && "scale-125"
                  )}
                  style={{
                    left: `${((camera.lng + 74.02) / 0.04) * 100}%`,
                    top: `${((40.73 - camera.lat) / 0.04) * 100}%`,
                  }}
                >
                  <Camera
                    className={cn(
                      "w-6 h-6 drop-shadow-lg",
                      camera.status === "online"
                        ? "text-primary"
                        : "text-muted-foreground"
                    )}
                  />
                </div>
              ))}

            {/* Units */}
            {showUnits &&
              units.map((unit) => (
                <div
                  key={unit.id}
                  className="absolute w-6 h-6 -translate-x-1/2 -translate-y-1/2"
                  style={{
                    left: `${((unit.lng + 74.02) / 0.04) * 100}%`,
                    top: `${((40.73 - unit.lat) / 0.04) * 100}%`,
                  }}
                >
                  <Navigation
                    className="w-6 h-6 text-info drop-shadow-lg"
                    style={{ transform: "rotate(45deg)" }}
                  />
                </div>
              ))}
          </div>

          {/* Legend */}
          <div className="mt-3 flex gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="text-lg">🔴</span>
              <span>Critical Incident</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg">🟡</span>
              <span>Moderate</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg">🟢</span>
              <span>Low Priority</span>
            </div>
            <div className="flex items-center gap-2">
              <Camera className="w-4 h-4 text-primary" />
              <span>Camera</span>
            </div>
            <div className="flex items-center gap-2">
              <Navigation className="w-4 h-4 text-info" style={{ transform: "rotate(45deg)" }} />
              <span>Responding Unit</span>
            </div>
          </div>
        </Card>

        {/* Details Panel */}
        {(selectedIncident || selectedCamera) && (
          <Card className="glass-panel border-panel-border p-3 mt-3">
            {selectedIncident && (
              <>
                {incidents
                  .filter((inc) => inc.id === selectedIncident)
                  .map((incident) => (
                    <div key={incident.id} className="space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-semibold text-foreground">
                            {incident.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {incident.location}
                          </p>
                        </div>
                        <Button size="sm" variant="outline">
                          <Eye className="w-3 h-3 mr-1" />
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
              </>
            )}
            {selectedCamera && !selectedIncident && (
              <>
                {cameras
                  .filter((cam) => cam.id === selectedCamera)
                  .map((camera) => (
                    <div key={camera.id} className="space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-semibold text-foreground">
                            {camera.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {camera.location}
                          </p>
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[10px] mt-1",
                              camera.status === "online"
                                ? "text-safe border-safe/20"
                                : "text-muted-foreground border-muted/20"
                            )}
                          >
                            {camera.status === "online" ? "🟢" : "⚪"}{" "}
                            {camera.status === "online" ? "Online" : "Offline"}
                          </Badge>
                        </div>
                        <Button size="sm" variant="outline">
                          <Radio className="w-3 h-3 mr-1" />
                          Live Feed
                        </Button>
                      </div>
                    </div>
                  ))}
              </>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}
