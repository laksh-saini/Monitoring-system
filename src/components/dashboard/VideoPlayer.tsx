import { useState, useRef, useEffect } from "react";
import {
  Play,
  Pause,
  Maximize2,
  Volume2,
  VolumeX,
  Car,
  Users,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";

const overlayToggles = [
  { icon: Car, label: "Vehicles", active: true },
  { icon: Users, label: "Pedestrians", active: true },
];

export function VideoPlayer({
  onIncident,
}: {
  onIncident?: (incident: any) => void;
}) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [toggles, setToggles] = useState(overlayToggles);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [hasVideo, setHasVideo] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const modelRef = useRef<any>(null);
  const rafRef = useRef<number | null>(null);
  const lastAnalysisRef = useRef<number>(0);
  const [isDetecting, setIsDetecting] = useState(false);
  const togglesRef = useRef(overlayToggles);
  const tracksRef = useRef<any[]>([]);

  const labelMap: Record<string, string> = {
    person: "Person",
    car: "Car",
    truck: "Truck",
    bus: "Bus",
    motorcycle: "Motorcycle",
    bicycle: "Bike",
  };

  const typeIconMap: Record<string, string> = {
    person: "🚶",
    car: "🚗",
    truck: "🚚",
    bus: "🚌",
    motorcycle: "🏍️",
    bicycle: "🚲",
  };

  const capitalize = (s: string) => (s && s[0].toUpperCase() + s.slice(1)) || s;

  const iou = (a: number[], b: number[]) => {
    const [ax, ay, aw, ah] = a;
    const [bx, by, bw, bh] = b;
    const ax2 = ax + aw;
    const ay2 = ay + ah;
    const bx2 = bx + bw;
    const by2 = by + bh;
    const ix = Math.max(0, Math.min(ax2, bx2) - Math.max(ax, bx));
    const iy = Math.max(0, Math.min(ay2, by2) - Math.max(ay, by));
    const inter = ix * iy;
    const union = aw * ah + bw * bh - inter;
    return union <= 0 ? 0 : inter / union;
  };

  const handleToggle = (index: number) => {
    setToggles((prev) =>
      prev.map((t, i) => (i === index ? { ...t, active: !t.active } : t))
    );
  };

  // keep ref in sync so detection loop can read latest toggles without
  // re-subscribing to effect deps
  useEffect(() => {
    togglesRef.current = toggles;
  }, [toggles]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (isPlaying) {
      const p = v.play();
      if (p && typeof p.then === "function") {
        p.catch(() => {
          // autoplay might be blocked; keep UI state in sync
          setIsPlaying(false);
        });
      }
    } else {
      v.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    if (videoRef.current) videoRef.current.muted = isMuted;
  }, [isMuted]);

  const handlePlayPause = () => {
    if (!videoRef.current) return setIsPlaying((s) => !s);
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      const p = videoRef.current.play();
      if (p && typeof p.then === "function") {
        p.catch(() => setIsPlaying(false));
      } else {
        setIsPlaying(true);
      }
    }
  };

  const handleMuteToggle = () => setIsMuted((m) => !m);

  // Draw detections on overlay canvas
  const drawDetections = (items: any[]) => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const vw = video.videoWidth || video.clientWidth;
    const vh = video.videoHeight || video.clientHeight;
    canvas.width = vw;
    canvas.height = vh;
    ctx.clearRect(0, 0, vw, vh);
    ctx.lineWidth = 2;
    ctx.font = "14px monospace";
    const vehicleClasses = new Set(["car", "truck", "bus", "motorcycle", "bicycle"]);

    items.forEach((p) => {
      const [x, y, w, h] = p.bbox;
      const cls = p.cls || p.class;
      const score = typeof p.score === "number" && p.score > 1 ? p.score : Math.round((p.score || 0) * 100);
      // Respect overlay toggles
      if (cls === "person" && !toggles[1].active) return;
      if (vehicleClasses.has(cls) && !toggles[0].active) return;
      if (!(cls === "person" || vehicleClasses.has(cls))) return;

      // choose color
      let color = cls === "person" ? "#3b82f6" : "#f97316";
      if (cls === "bicycle") color = "#10b981";
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.rect(x, y, w, h);
      ctx.stroke();

      const displayName = p.id || labelMap[cls] || capitalize(cls);
      const label = `${displayName} (${score}%)`;
      const textWidth = ctx.measureText(label).width + 8;
      const textHeight = 18;
      ctx.fillRect(x, Math.max(0, y - textHeight - 4), textWidth, textHeight);
      ctx.fillStyle = "#000";
      ctx.fillText(label, x + 4, Math.max(12, y - 6));
      ctx.fillStyle = color;
    });
  };

  // Detection loop using requestAnimationFrame but throttled to ~200ms
  useEffect(() => {
    let mounted = true;
    const loadModelAndStart = async () => {
      try {
        // dynamic import so it only runs in browser
        // @ts-ignore
        const coco = await import("@tensorflow-models/coco-ssd");
        // @ts-ignore
        await import("@tensorflow/tfjs");
        if (!mounted) return;
        modelRef.current = await coco.load();
        if (!mounted) return;
        setIsDetecting(true);
        const loop = async () => {
          const now = performance.now();
          const video = videoRef.current;
          const model = modelRef.current;
          if (!video || !model) {
            rafRef.current = requestAnimationFrame(loop);
            return;
          }
          // throttle to ~200ms
          const togglesActive = togglesRef.current[0]?.active || togglesRef.current[1]?.active;
          if (!togglesActive) {
            // clear canvas when no toggles are active
            const c = canvasRef.current;
            if (c) {
              const ctx = c.getContext("2d");
              if (ctx) ctx.clearRect(0, 0, c.width, c.height);
            }
            rafRef.current = requestAnimationFrame(loop);
            return;
          }

          if (now - lastAnalysisRef.current > 180 && !video.paused && !video.ended) {
            lastAnalysisRef.current = now;
            try {
              const predictions = await model.detect(video as HTMLVideoElement);
              // Process predictions: filter for person/vehicle classes
              const vehicleClasses = new Set(["car", "truck", "bus", "motorcycle", "bicycle"]);
              const relevant = predictions.filter((p: any) => p.class === "person" || vehicleClasses.has(p.class));

              // Simple tracker: match by IoU and same class
              const nowTs = Date.now();
              const newTracks: any[] = [];

              relevant.forEach((p: any) => {
                const bbox = p.bbox;
                const cls = p.class;
                let matched = null;
                let bestIou = 0;
                tracksRef.current.forEach((t) => {
                  if (t.cls !== cls) return;
                  const score = iou(t.bbox, bbox);
                  if (score > 0.3 && score > bestIou) {
                    bestIou = score;
                    matched = t;
                  }
                });

                if (matched) {
                  // update matched track
                  matched.bbox = bbox;
                  matched.lastSeen = nowTs;
                  newTracks.push(matched);
                } else {
                  // create new track
                  const track = {
                    id: labelMap[cls] || capitalize(cls),
                    cls,
                    bbox,
                    score: Math.round(p.score * 100),
                    createdAt: nowTs,
                    lastSeen: nowTs,
                  };
                  newTracks.push(track);

                  // emit incident for new track
                  const incident = {
                    id: `DET-${nowTs}-${track.id}`,
                    severity: "moderate",
                    type: cls === "person" ? "Person Detected" : `${labelMap[cls] || capitalize(cls)} Detected`,
                    typeIcon: typeIconMap[cls] ?? "🚗",
                    location: "CAM-04",
                    time: new Date(nowTs).toLocaleString(),
                    status: "open",
                    evidence: ["video"],
                    description: `${track.id} detected (${track.score}%)`,
                  };
                  if (onIncident) onIncident(incident);
                }
              });

              // keep tracks that were updated recently
              tracksRef.current = newTracks;
              drawDetections(tracksRef.current);
            } catch (e) {
              // ignore detection errors
            }
          }
          rafRef.current = requestAnimationFrame(loop);
        };
        rafRef.current = requestAnimationFrame(loop);
      } catch (e) {
        // model load failed
        setIsDetecting(false);
      }
    };

    loadModelAndStart();

    return () => {
      mounted = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      modelRef.current = null;
      setIsDetecting(false);
    };
  }, []);

  return (
    <div className="relative w-full aspect-video glass-panel overflow-hidden group">
      {/* Video Element (load your file to /public/media/incident.mp4) */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        src="/media/incident.mp4"
        playsInline
        onError={() => setHasVideo(false)}
        onLoadedMetadata={() => setHasVideo(true)}
        muted={isMuted}
      />

      {/* Canvas overlay for detections */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        aria-hidden
      />

      {/* Video Background Simulation (keeps overlays if video missing) */}
      {!hasVideo && (
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
      )}

      {/* Canvas overlay for detections (on top) */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-50"
        aria-hidden
      />

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
              onClick={handlePlayPause}
              className="w-9 h-9 rounded-lg bg-white/10 backdrop-blur hover:bg-white/20 flex items-center justify-center transition-colors"
              aria-label={isPlaying ? "Pause video" : "Play video"}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 text-white" />
              ) : (
                <Play className="w-4 h-4 text-white" />
              )}
            </button>
            <button
              onClick={handleMuteToggle}
              className="w-9 h-9 rounded-lg bg-white/10 backdrop-blur hover:bg-white/20 flex items-center justify-center transition-colors"
              aria-label={isMuted ? "Unmute video" : "Mute video"}
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-white" />
              ) : (
                <Volume2 className="w-4 h-4 text-white" />
              )}
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
