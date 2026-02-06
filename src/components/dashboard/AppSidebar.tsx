import { useState } from "react";
import {
  Radio,
  History,
  BarChart3,
  Map,
  Settings,
  ChevronLeft,
  ChevronRight,
  Zap,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { IncidentHistory } from "./sections/IncidentHistory";
import { Analytics } from "./sections/Analytics";
import { MapView } from "./sections/MapView";

const navItems = [
  { icon: Radio, label: "Live Monitoring", active: true },
  { icon: History, label: "Incident History", active: false },
  { icon: BarChart3, label: "Analytics", active: false },
  { icon: Map, label: "Map View", active: false },
  { icon: Settings, label: "Settings", active: false },
];

interface AppSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  onNavigate?: (section: number) => void;
}

export function AppSidebar({ collapsed, onToggle, onNavigate }: AppSidebarProps) {
  const [activeItem, setActiveItem] = useState(0);

  return (
    <aside
      className={cn(
        "h-screen flex flex-col glass-panel border-r border-panel-border transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="p-4 border-b border-panel-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-info to-primary flex items-center justify-center glow-info">
            <Shield className="w-6 h-6 text-foreground" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-foreground tracking-tight">
                OmniSense
              </span>
              <span className="text-xs text-primary font-medium">AI</span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item, index) => (
          <button
            key={item.label}
            onClick={() => {
              setActiveItem(index);
              onNavigate?.(index);
            }}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
              activeItem === index
                ? "bg-primary/10 text-primary border border-primary/20"
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
            )}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {!collapsed && (
              <span className="text-sm font-medium">{item.label}</span>
            )}
          </button>
        ))}
      </nav>

      {/* System Status */}
      <div className="p-3 border-t border-panel-border">
        <div
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-lg bg-safe/5 border border-safe/20",
            collapsed && "justify-center"
          )}
        >
          <div className="relative">
            <Zap className="w-4 h-4 text-safe" />
            <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-safe rounded-full animate-pulse" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-xs font-medium text-safe">
                System Operational
              </span>
              <span className="text-[10px] text-muted-foreground font-mono">
                Latency: 12ms
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={onToggle}
        className="absolute top-1/2 -right-3 w-6 h-6 bg-panel border border-panel-border rounded-full flex items-center justify-center hover:bg-accent transition-colors"
      >
        {collapsed ? (
          <ChevronRight className="w-3 h-3 text-muted-foreground" />
        ) : (
          <ChevronLeft className="w-3 h-3 text-muted-foreground" />
        )}
      </button>
    </aside>
  );
}
