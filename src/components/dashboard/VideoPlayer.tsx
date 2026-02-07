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
  Upload,
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
  const [hasVideo, setHasVideo] = useState(false);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const modelRef = useRef<any>(null);
  const rafRef = useRef<number | null>(null);
  const lastAnalysisRef = useRef<number>(0);
  const [isDetecting, setIsDetecting] = useState(false);
  const togglesRef = useRef(overlayToggles);
  const tracksRef = useRef<any[]>([]);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const labelMap: Record<string, string> = {
    person: "Person",
    car: "Car",
    truck: "Truck",
    bus: "Bus",
    motorcycle: "Motorcycle",
    bicycle: "Bike",
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
        p
          .then(() => {
            setIsPlaying(true);
          })
          .catch(() => {
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
        p.then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
      } else {
        setIsPlaying(true);
      }
    }
  };

  const handleMuteToggle = () => setIsMuted((m) => !m);

  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file is a video
    if (!file.type.startsWith("video/")) {
      alert("Please upload a valid video file");
      return;
    }

    // Create blob URL for the uploaded file
    const blobUrl = URL.createObjectURL(file);
    setVideoSrc(blobUrl);
    setHasVideo(true);
    setIsPlaying(true);

    // Clean up previous blob URL if exists
    return () => {
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;

    if (!isFullscreen) {
      const requestFullscreen = 
        container.requestFullscreen ||
        (container as any).webkitRequestFullscreen ||
        (container as any).mozRequestFullScreen ||
        (container as any).msRequestFullscreen;

      if (requestFullscreen) {
        requestFullscreen.call(container).catch(() => {});
        setIsFullscreen(true);
      }
    } else {
      const exitFullscreen =
        document.exitFullscreen ||
        (document as any).webkitExitFullscreen ||
        (document as any).mozCancelFullScreen ||
        (document as any).msExitFullscreen;

      if (exitFullscreen) {
        exitFullscreen.call(document).catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("mozfullscreenchange", handleFullscreenChange);
    document.addEventListener("msfullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
      document.removeEventListener("mozfullscreenchange", handleFullscreenChange);
      document.removeEventListener("msfullscreenchange", handleFullscreenChange);
    };
  }, []);

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
      // Respect overlay toggles (read from ref so RAF loop sees latest)
      const togglesNow = togglesRef.current;
      if (cls === "person" && !togglesNow[1]?.active) return;
      if (vehicleClasses.has(cls) && !togglesNow[0]?.active) return;
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

                  // Build AI summary heuristics from current and previous tracks
                  const prevTracks = tracksRef.current || [];
                  const vehicleClassesLocal = new Set(["car", "truck", "bus", "motorcycle", "bicycle"]);

                  const center = (b: number[]) => [b[0] + b[2] / 2, b[1] + b[3] / 2];
                  const dist = (a: number[], b: number[]) => {
                    const dx = a[0] - b[0];
                    const dy = a[1] - b[1];
                    return Math.sqrt(dx * dx + dy * dy);
                  };

                  let aiSummary = `${labelMap[cls] || capitalize(cls)} detected on CAM-04.`;
                  // check overlaps with previous tracks to detect collisions
                  const collisions: string[] = [];
                  let highVelocity = false;

                  prevTracks.forEach((pt) => {
                    const iouScore = iou(pt.bbox, track.bbox);
                    if (iouScore > 0.15) {
                      const a = labelMap[pt.cls] || capitalize(pt.cls);
                      const b = labelMap[track.cls] || capitalize(track.cls);
                      collisions.push(`${a} & ${b}`);
                    }
                    // estimate velocity by displacement of previous center -> current center over time
                    if (pt.cls === track.cls && pt.lastSeen && track.createdAt) {
                      const prevCenter = center(pt.bbox);
                      const curCenter = center(track.bbox);
                      const dt = Math.max(1, track.createdAt - pt.lastSeen) / 1000; // seconds
                      const pxPerSec = dist(prevCenter, curCenter) / dt;
                      if (vehicleClassesLocal.has(track.cls) && pxPerSec > 200) {
                        highVelocity = true;
                      }
                    }
                  });

                  if (collisions.length > 0) {
                    const uniq = Array.from(new Set(collisions)).join(", ");
                    aiSummary = `The system detected a potential collision involving ${uniq}.`;
                    if (highVelocity) aiSummary = aiSummary.replace(".", " at high velocity.");
                    aiSummary += " Review video evidence; emergency response may be required.";
                  } else if (vehicleClassesLocal.has(track.cls)) {
                    aiSummary = `A ${labelMap[track.cls] || capitalize(track.cls)} was detected moving in the scene.`;
                    if (highVelocity) aiSummary += " Movement indicates high velocity; exercise caution.";
                  } else if (track.cls === "person") {
                    aiSummary = "A person was detected in the scene near vehicle activity.";
                  }

                  // emit incident for new track, include AI summary
                  const incident = {
                    id: `DET-${nowTs}-${track.id}`,
                    severity: collisions.length > 0 ? (highVelocity ? "high" : "moderate") : "low",
                    type: cls === "person" ? "Person Detected" : `${labelMap[cls] || capitalize(cls)} Detected`,
                    typeIcon: cls === "person" ? "🚶" : "🚗",
                    location: "CAM-04",
                    time: new Date(nowTs).toLocaleString(),
                    status: "open",
                    evidence: ["video"],
                    description: `${track.id} detected (${track.score}%)`,
                    aiSummary,
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
    <div
      ref={containerRef}
      className="relative w-full aspect-video glass-panel overflow-hidden group"
    >
      {/* Video Element (load your file to /public/media/incident.mp4) */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        src={videoSrc || "/media/incident.mp4"}
        playsInline
        onError={() => setHasVideo(false)}
        onLoadedMetadata={() => setHasVideo(true)}
        muted={isMuted}
      />

      

      {/* Video Background Simulation (keeps overlays if video missing) */}
      {!hasVideo && (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
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

        {/* Upload prompt */}
        <div className="relative z-10 text-center space-y-4">
          <div className="text-6xl mb-4">🎥</div>
          <h3 className="text-xl font-bold text-foreground">No Video Loaded</h3>
          <p className="text-sm text-muted-foreground max-w-xs">
            Upload a video file to begin analysis. Supported formats: MP4, WebM, Ogg
          </p>
          <button
            onClick={handleUploadClick}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
          >
            Upload Video
          </button>
        </div>

        {/* Simulated detection boxes */}
        <div className="absolute top-1/4 left-1/4 w-32 h-20 border-2 border-critical/70 rounded opacity-30">
          <span className="absolute -top-5 left-0 text-[10px] font-mono bg-critical/80 px-1.5 py-0.5 rounded text-critical-foreground">
            SUV #1 (98%)
          </span>
        </div>
        <div className="absolute top-1/3 right-1/4 w-28 h-18 border-2 border-warning/70 rounded opacity-30">
          <span className="absolute -top-5 left-0 text-[10px] font-mono bg-warning/80 px-1.5 py-0.5 rounded text-warning-foreground">
            SUV #2 (94%)
          </span>
        </div>
        <div className="absolute bottom-1/4 left-1/3 w-8 h-16 border border-info/50 rounded opacity-30">
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
            <button
              onClick={handleUploadClick}
              className="w-9 h-9 rounded-lg bg-white/10 backdrop-blur hover:bg-white/20 flex items-center justify-center transition-colors"
              aria-label="Upload video"
            >
              <Upload className="w-4 h-4 text-white" />
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
          <button
            onClick={handleFullscreen}
            className="w-9 h-9 rounded-lg bg-white/10 backdrop-blur hover:bg-white/20 flex items-center justify-center transition-colors"
            aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          >
            <Maximize2 className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      {/* Hidden file input for video upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        onChange={handleVideoUpload}
        className="hidden"
        aria-label="Upload video file"
      />
    </div>
  );
}
