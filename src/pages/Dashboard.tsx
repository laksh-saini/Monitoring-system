import { useState } from "react";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { VideoPlayer } from "@/components/dashboard/VideoPlayer";
import { EventTimeline } from "@/components/dashboard/EventTimeline";
import { AudioWaveform } from "@/components/dashboard/AudioWaveform";
import { TranscriptLog } from "@/components/dashboard/TranscriptLog";
import { IncidentMap } from "@/components/dashboard/IncidentMap";
import { IntelligencePanel } from "@/components/dashboard/IntelligencePanel";
import { IncidentHistory } from "@/components/dashboard/sections/IncidentHistory";
import { Analytics } from "@/components/dashboard/sections/Analytics";
import { MapView } from "@/components/dashboard/sections/MapView";

const Dashboard = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState(0);
  const [detectedIncidents, setDetectedIncidents] = useState<any[]>([]);

  const handleNewIncident = (incident: any) => {
    setDetectedIncidents((prev) => [incident, ...prev]);
  };

  return (
    <div className="min-h-screen bg-background flex w-full">
      {/* Left Sidebar */}
      <div className="relative flex-shrink-0">
        <AppSidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          onNavigate={setActiveSection}
        />
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Live Monitoring - Section 0 */}
        {activeSection === 0 && (
          <div className="flex flex-col p-4 gap-4 min-w-0 overflow-hidden flex-1">
            {/* Top Section - Video Feed */}
            <div className="flex-shrink-0">
              <VideoPlayer onIncident={handleNewIncident} />
            </div>

            {/* Timeline */}
            <div className="flex-shrink-0">
              <EventTimeline />
            </div>

            {/* Bottom Section - Two Columns */}
            <div className="flex-1 grid grid-cols-2 gap-4 min-h-0">
              {/* Left Column - Audio */}
              <div className="flex flex-col gap-4 min-h-0">
                <div className="flex-1 min-h-0">
                  <AudioWaveform />
                </div>
                <div className="flex-1 min-h-0">
                  <TranscriptLog />
                </div>
              </div>

              {/* Right Column - Map */}
              <div className="min-h-0">
                <IncidentMap />
              </div>
            </div>
          </div>
        )}
        
        {/* Incident History - Section 1 */}
        {activeSection === 1 && (
          <IncidentHistory incoming={detectedIncidents} />
        )}
        
        {/* Analytics - Section 2 */}
        {activeSection === 2 && <Analytics />}
        
        {/* Map View - Section 3 */}
        {activeSection === 3 && <MapView />}
        
        {/* Settings - Section 4 */}
        {activeSection === 4 && (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <div className="text-center">
              <p className="text-lg font-semibold mb-2">Settings</p>
              <p className="text-sm">Settings coming soon...</p>
            </div>
          </div>
        )}
      </main>

      {/* Right Intelligence Panel */}
      <IntelligencePanel />
    </div>
  );
};

export default Dashboard;
