import { MapPin, Navigation, Layers } from "lucide-react";

export function IncidentMap() {
  return (
    <div className="glass-panel p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-critical" />
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Incident Location
          </span>
        </div>
        <button className="p-1.5 rounded hover:bg-accent transition-colors">
          <Layers className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {/* Map Placeholder */}
      <div className="flex-1 relative rounded-lg overflow-hidden bg-muted/50 min-h-[100px]">
        {/* Grid lines */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "linear-gradient(hsl(var(--info) / 0.3) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--info) / 0.3) 1px, transparent 1px)",
            backgroundSize: "30px 30px",
          }}
        />

        {/* Road simulation */}
        <div className="absolute top-1/2 left-0 right-0 h-8 bg-secondary/50 -translate-y-1/2" />
        <div className="absolute top-0 bottom-0 left-1/3 w-6 bg-secondary/50" />

        {/* Incident marker */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-critical/30 animate-ping absolute inset-0" />
            <div className="w-8 h-8 rounded-full bg-critical flex items-center justify-center relative glow-critical">
              <Navigation className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>

        {/* Radius circle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border-2 border-dashed border-critical/30" />
      </div>

      {/* Location Details */}
      <div className="mt-3 space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Address</span>
          <span className="font-mono text-foreground">1247 Industrial Blvd</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Coordinates</span>
          <span className="font-mono text-foreground">34.0522° N, 118.2437° W</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Zone</span>
          <span className="font-mono text-warning">High Traffic Area</span>
        </div>
      </div>
    </div>
  );
}
