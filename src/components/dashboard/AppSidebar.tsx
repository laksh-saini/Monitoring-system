import { useState } from "react";
import { createPortal } from "react-dom";
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
  Menu,
  X,
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <aside
      className={cn(
        "flex flex-row lg:flex-col glass-panel border-b lg:border-b-0 lg:border-r border-panel-border transition-all duration-300",
        "h-auto lg:h-screen w-full lg:w-auto",
        collapsed ? "lg:w-16" : "lg:w-64"
      )}
    >
      {/* Logo */}
      <div className="p-4 border-b border-panel-border flex items-center justify-between w-full lg:w-auto">
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

        {/* Mobile Hamburger */}
        <button
          className="lg:hidden p-2 text-muted-foreground hover:text-foreground"
          onClick={() => setMobileMenuOpen(true)}
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Navigation - Desktop */}
      <nav className="hidden lg:flex flex-1 flex-col p-3 gap-2">
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
              <span className="text-sm font-medium whitespace-nowrap">{item.label}</span>
            )}
          </button>
        ))}
      </nav>

      {/* Mobile Menu Backdrop & Drawer */}
      {mobileMenuOpen && createPortal(
        <div className="fixed inset-0 z-[9999] lg:hidden font-sans">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Panel */}
          <div className="absolute inset-y-0 left-0 w-3/4 max-w-sm bg-background border-r border-panel-border p-6 shadow-2xl animate-in slide-in-from-left duration-300">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-info to-primary flex items-center justify-center glow-info">
                  <Shield className="w-6 h-6 text-foreground" />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-foreground tracking-tight">OmniSense</span>
                  <span className="text-xs text-primary font-medium">AI</span>
                </div>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 -mr-2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <nav className="space-y-2">
              {navItems.map((item, index) => (
                <button
                  key={item.label}
                  onClick={() => {
                    setActiveItem(index);
                    onNavigate?.(index);
                    setMobileMenuOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-all text-left",
                    activeItem === index
                      ? "bg-primary/10 text-primary border border-primary/20"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="text-base font-medium">{item.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>,
        document.body
      )}

      {/* System Status */}
      <div className={cn("p-3 border-t border-panel-border", mobileMenuOpen ? "hidden" : "hidden lg:block")}>
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
        className="hidden lg:flex absolute top-1/2 -right-3 w-6 h-6 bg-panel border border-panel-border rounded-full items-center justify-center hover:bg-accent transition-colors"
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
