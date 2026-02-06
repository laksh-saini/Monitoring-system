import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Fingerprint, Lock, Scan } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const Auth = () => {
  const navigate = useNavigate();
  const [isVerifying, setIsVerifying] = useState(false);
  const [badgeId, setBadgeId] = useState("CMD-402");
  const [accessKey, setAccessKey] = useState("••••••••");

  const handleLogin = async () => {
    setIsVerifying(true);
    // Simulate biometric verification
    await new Promise((resolve) => setTimeout(resolve, 2500));
    navigate("/dashboard");
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background flex items-center justify-center">
      {/* Animated Mesh Gradient Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Base topology grid */}
        <div className="absolute inset-0 opacity-20">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="hsl(var(--primary) / 0.3)" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Animated gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-info/8 rounded-full blur-[100px] animate-pulse-slow" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[150px]" />

        {/* Scan line effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute w-full h-[2px] bg-gradient-to-r from-transparent via-primary/30 to-transparent animate-scan-line" />
        </div>
      </div>

      {/* Classification Banner */}
      <div className="absolute top-0 left-0 right-0 py-2 bg-critical/10 border-b border-critical/30 text-center">
        <span className="text-critical font-mono text-xs tracking-[0.3em] uppercase">
          ▲ Top Secret // OmniSense Clearance Required ▲
        </span>
      </div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md mx-4">
        {/* Outer glow effect */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 via-info/20 to-primary/20 rounded-2xl blur opacity-50" />
        
        {/* Card */}
        <div className="relative glass-panel-glow rounded-2xl p-8 space-y-8">
          {/* Logo Section */}
          <div className="text-center space-y-4">
            <div className="relative inline-flex items-center justify-center">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse-slow" />
              <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-info/20 border border-primary/30 flex items-center justify-center">
                <Shield className="w-10 h-10 text-primary" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                OmniSense<span className="text-primary">AI</span>
              </h1>
              <p className="text-sm text-muted-foreground mt-1 font-mono">
                Multimodal Incident Analysis Platform
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
            <Lock className="w-4 h-4 text-muted-foreground" />
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
          </div>

          {/* Form */}
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="badge" className="text-xs uppercase tracking-wider text-muted-foreground">
                Badge ID
              </Label>
              <div className="relative">
                <Input
                  id="badge"
                  value={badgeId}
                  onChange={(e) => setBadgeId(e.target.value)}
                  className="bg-secondary/50 border-border/50 font-mono pl-10 h-12"
                  disabled={isVerifying}
                />
                <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="access" className="text-xs uppercase tracking-wider text-muted-foreground">
                Access Key
              </Label>
              <div className="relative">
                <Input
                  id="access"
                  type="password"
                  value={accessKey}
                  onChange={(e) => setAccessKey(e.target.value)}
                  className="bg-secondary/50 border-border/50 font-mono pl-10 h-12"
                  disabled={isVerifying}
                />
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              </div>
            </div>

            {/* Login Button */}
            <Button
              onClick={handleLogin}
              disabled={isVerifying}
              className="w-full h-12 bg-gradient-to-r from-primary to-info hover:from-primary/90 hover:to-info/90 text-primary-foreground font-semibold tracking-wide relative overflow-hidden group"
            >
              {isVerifying ? (
                <div className="flex items-center gap-3">
                  <Fingerprint className="w-5 h-5 animate-pulse" />
                  <span className="font-mono">Verifying Biometrics...</span>
                </div>
              ) : (
                <>
                  <span className="relative z-10 flex items-center gap-2">
                    <Scan className="w-5 h-5" />
                    Initialize System
                  </span>
                  {/* Glow effect on hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-primary via-info to-primary opacity-0 group-hover:opacity-20 transition-opacity" />
                </>
              )}
              
              {/* Button glow */}
              <div className="absolute -inset-1 bg-gradient-to-r from-primary to-info rounded-lg blur opacity-30 group-hover:opacity-50 transition-opacity -z-10" />
            </Button>
          </div>

          {/* Verification Animation Overlay */}
          {isVerifying && (
            <div className="absolute inset-0 rounded-2xl overflow-hidden">
              <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center gap-6">
                {/* Fingerprint Scanner */}
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/30 rounded-full blur-xl animate-ping" />
                  <div className="relative w-24 h-24 rounded-full border-2 border-primary/50 flex items-center justify-center">
                    <Fingerprint className="w-12 h-12 text-primary animate-pulse" />
                  </div>
                  {/* Scanning line */}
                  <div className="absolute inset-0 overflow-hidden rounded-full">
                    <div className="absolute w-full h-1 bg-gradient-to-b from-transparent via-primary to-transparent animate-scan-line" />
                  </div>
                </div>
                
                <div className="text-center space-y-2">
                  <p className="text-foreground font-semibold">Verifying Biometrics</p>
                  <p className="text-muted-foreground text-sm font-mono">
                    Authenticating credentials...
                  </p>
                </div>

                {/* Progress dots */}
                <div className="flex gap-2">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-2 h-2 rounded-full bg-primary animate-pulse"
                      style={{ animationDelay: `${i * 0.2}s` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="text-center space-y-2 pt-4 border-t border-border/50">
            <p className="text-xs text-muted-foreground font-mono">
              Session will auto-terminate after 30 minutes of inactivity
            </p>
            <p className="text-xs text-muted-foreground/60">
              v3.2.1 • Secure Connection Established
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Classification Banner */}
      <div className="absolute bottom-0 left-0 right-0 py-2 bg-critical/10 border-t border-critical/30 text-center">
        <span className="text-critical font-mono text-xs tracking-[0.3em] uppercase">
          ▼ Unauthorized Access Will Be Prosecuted ▼
        </span>
      </div>
    </div>
  );
};

export default Auth;
