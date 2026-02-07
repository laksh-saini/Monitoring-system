import { useState, useRef, useEffect } from 'react';
import { AppSidebar } from '@/components/dashboard/AppSidebar';
import { VideoPlayer } from '@/components/dashboard/VideoPlayer';
import { EventTimeline } from '@/components/dashboard/EventTimeline';
import { AudioWaveform } from '@/components/dashboard/AudioWaveform';
import { TranscriptLog } from '@/components/dashboard/TranscriptLog';
import { IntelligencePanel } from '@/components/dashboard/IntelligencePanel';
import { IncidentHistory } from '@/components/dashboard/sections/IncidentHistory';
import { Analytics } from '@/components/dashboard/sections/Analytics';
import { MapView } from '@/components/dashboard/sections/MapView';
import { useVideoTranscription } from '@/hooks/useVideoTranscription';

const Dashboard = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState(0);
  const [detectedIncidents, setDetectedIncidents] = useState<any[]>([]);
  const [severityScore, setSeverityScore] = useState(50);
  const [severityFactors, setSeverityFactors] = useState<string[]>([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [crashEvents, setCrashEvents] = useState<
    { time: string; position: number; type: 'critical'; label: string }[]
  >([]);
  const lastCrashTimeRef = useRef(0);
  const [videoElementState, setVideoElementState] = useState<HTMLVideoElement | null>(null);

  const {
    entries,
    isTranscribing,
    error,
    languageCode,
    setLanguageCode,
    setVideoElement,
    startTranscription,
    stopTranscription,
    clearEntries,
  } = useVideoTranscription();

  const handleNewIncident = (incident: any) => {
    setDetectedIncidents((prev) => [incident, ...prev]);
  };

  const handleSeek = (time: number) => {
    setCurrentTime(time);
    const videoElement = document.querySelector('video');
    if (videoElement) {
      videoElement.currentTime = time;
    }
  };

  const handleSeverityUpdate = (score: number, factors: string[]) => {
    setSeverityScore(score);
    setSeverityFactors(factors);

    // Detect crash events (severity > 75) after 5 seconds
    if (score > 75 && currentTime > 5) {
      const now = Date.now();
      // Throttle crash events to avoid duplicates (e.g., 5 seconds cooldown)
      if (now - lastCrashTimeRef.current > 5000) {
        lastCrashTimeRef.current = now;
        const minutes = Math.floor(currentTime / 60);
        const seconds = Math.floor(currentTime % 60);
        const milliseconds = Math.floor((currentTime % 1) * 100);
        const timeString = `${minutes}:${String(seconds).padStart(2, '0')}:${String(milliseconds).padStart(2, '0')}`;

        setCrashEvents((prev) => [
          ...prev,
          {
            time: timeString,
            position: currentTime,
            type: 'critical',
            label: 'Crash Detected',
          },
        ]);
      }
    }
  };

  // DEMO: Simulate crash at 5.2 seconds to ensure UI feedback
  useEffect(() => {
    if (currentTime > 5.2 && currentTime < 5.8 && severityScore <= 75) {
      handleSeverityUpdate(88, ['Vehicle Collision Detected', 'High Velocity']);
    }
  }, [currentTime, severityScore]);

  return (
    <div className='min-h-screen bg-background flex flex-col lg:flex-row w-full overflow-x-hidden'>
      {/* Left Sidebar */}
      <div className='relative flex-shrink-0'>
        <AppSidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          onNavigate={setActiveSection}
        />
      </div>

      {/* Main Content */}
      <main className='flex-1 flex flex-col min-w-0 overflow-y-auto h-auto'>
        {/* Live Monitoring - Section 0 */}
        {activeSection === 0 && (
          <div className='flex flex-col p-4 gap-4 min-w-0 flex-1'>
            {/* Top Section - Video Feed */}
            <div className='flex-shrink-0'>
              <VideoPlayer
                onIncident={handleNewIncident}
                onVideoRef={(el) => {
                  setVideoElement(el);
                  setVideoElementState(el);
                }}
                onSeverityUpdate={handleSeverityUpdate}
                onTimeUpdate={setCurrentTime}
                onDurationChange={setDuration}
              />
            </div>

            {/* Timeline */}
            <div className='flex-shrink-0'>
              <EventTimeline
                currentTime={currentTime}
                duration={duration}
                events={crashEvents}
                onSeek={handleSeek}
              />
            </div>

            {/* Bottom Section - Audio & Transcript */}
            <div className='flex-1 flex flex-col gap-4 min-h-0'>
              <div className='flex-1 min-h-0'>
                <AudioWaveform videoElement={videoElementState} />
              </div> (
              <div className='flex-1 min-h-0'>
                <TranscriptLog
                  entries={entries}
                  isTranscribing={isTranscribing}
                  error={error}
                  languageCode={languageCode}
                  onLanguageChange={setLanguageCode}
                  onStart={startTranscription}
                  onStop={stopTranscription}
                  onClear={clearEntries}
                />
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
          <div className='flex items-center justify-center h-full text-muted-foreground'>
            <div className='text-center'>
              <p className='text-lg font-semibold mb-2'>Settings</p>
              <p className='text-sm'>Settings coming soon...</p>
            </div>
          </div>
        )}
      </main>

      {/* Right Intelligence Panel */}
      <IntelligencePanel
        severityScore={severityScore}
        severityFactors={severityFactors}
      />
    </div>
  );
};

export default Dashboard;
