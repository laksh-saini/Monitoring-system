import React, { useState } from "react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, TrendingDown, Clock, Zap } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Chart data
const incidentVolumeData = [
  { time: "00:00", incidents: 2, detected: 1 },
  { time: "04:00", incidents: 3, detected: 2 },
  { time: "08:00", incidents: 8, detected: 6 },
  { time: "12:00", incidents: 14, detected: 12 },
  { time: "16:00", incidents: 18, detected: 15 },
  { time: "18:00", incidents: 24, detected: 21 },
  { time: "20:00", incidents: 22, detected: 19 },
  { time: "00:00", incidents: 5, detected: 4 },
];

const typeDistributionData = [
  { name: "Traffic", value: 45, color: "#3B82F6" },
  { name: "Public Safety", value: 30, color: "#EF4444" },
  { name: "Fire", value: 15, color: "#F97316" },
  { name: "Medical", value: 10, color: "#10B981" },
];

const heatmapData = [
  { day: "Mon", morning: 3, afternoon: 8, evening: 12, night: 4 },
  { day: "Tue", morning: 4, afternoon: 9, evening: 14, night: 5 },
  { day: "Wed", morning: 2, afternoon: 7, evening: 10, night: 3 },
  { day: "Thu", morning: 5, afternoon: 11, evening: 16, night: 6 },
  { day: "Fri", morning: 6, afternoon: 13, evening: 18, night: 7 },
  { day: "Sat", morning: 8, afternoon: 15, evening: 20, night: 9 },
  { day: "Sun", morning: 7, afternoon: 12, evening: 17, night: 8 },
];

interface StatCard {
  label: string;
  value: string;
  change: number;
  trend: "up" | "down";
  icon: React.ReactNode;
  color: string;
}

const statCards: StatCard[] = [
  {
    label: "Avg. Detection Time",
    value: "1.2s",
    change: 12,
    trend: "down",
    icon: <Clock className="w-5 h-5" />,
    color: "text-safe",
  },
  {
    label: "Avg. Dispatch Time",
    value: "4m 30s",
    change: 8,
    trend: "down",
    icon: <Zap className="w-5 h-5" />,
    color: "text-info",
  },
];

export const Analytics = () => {
  const [hoveredSegment, setHoveredSegment] = useState<string | null>(null);

  const totalIncidents = typeDistributionData.reduce(
    (sum, item) => sum + item.value,
    0
  );

  return (
    <div className="h-full flex flex-col gap-4 p-4 overflow-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-1">
          📊 Analytics Dashboard
        </h2>
        <p className="text-sm text-muted-foreground">
          High-level trends for decision makers
        </p>
      </div>

      {/* Stat Cards Row */}
      <div className="grid grid-cols-2 gap-4">
        {statCards.map((stat, idx) => (
          <Card key={idx} className="glass-panel border-panel-border p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  {stat.label}
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {stat.value}
                </p>
              </div>
              <div className={cn("p-2 rounded-lg bg-accent", stat.color)}>
                {stat.icon}
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1">
              {stat.trend === "down" ? (
                <>
                  <TrendingDown className="w-4 h-4 text-safe" />
                  <span className="text-xs text-safe">
                    {stat.change}% vs last week
                  </span>
                </>
              ) : (
                <>
                  <TrendingUp className="w-4 h-4 text-destructive" />
                  <span className="text-xs text-destructive">
                    {stat.change}% vs last week
                  </span>
                </>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-2 gap-4 flex-1 min-h-0">
        {/* Incident Volume Chart */}
        <Card className="glass-panel border-panel-border p-4 flex flex-col">
          <h3 className="text-sm font-semibold text-foreground mb-3">
            Incident Volume (Last 24h)
          </h3>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={incidentVolumeData}>
                <defs>
                  <linearGradient id="colorIncidents" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="time" stroke="rgba(255,255,255,0.5)" />
                <YAxis stroke="rgba(255,255,255,0.5)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(0,0,0,0.8)",
                    border: "1px solid rgba(255,255,255,0.2)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="incidents"
                  stroke="#3B82F6"
                  fillOpacity={1}
                  fill="url(#colorIncidents)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            ⚠️ Spike detected between 18:00 - 20:00
          </p>
        </Card>

        {/* Type Distribution Donut */}
        <Card className="glass-panel border-panel-border p-4 flex flex-col">
          <h3 className="text-sm font-semibold text-foreground mb-3">
            Incident Type Distribution
          </h3>
          <div className="flex-1 flex items-center justify-center min-h-0">
            <div className="w-full h-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={typeDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {typeDistributionData.map((entry) => (
                      <Cell
                        key={`cell-${entry.name}`}
                        fill={entry.color}
                        opacity={
                          hoveredSegment === null || hoveredSegment === entry.name
                            ? 1
                            : 0.4
                        }
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}%`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="mt-3 text-center">
            <p className="text-2xl font-bold text-foreground">
              {totalIncidents}
            </p>
            <p className="text-xs text-muted-foreground">Total Incidents</p>
          </div>
          <div className="mt-3 flex flex-wrap gap-2 justify-center">
            {typeDistributionData.map((item) => (
              <Badge
                key={item.name}
                variant="outline"
                className="gap-2 cursor-pointer"
                onMouseEnter={() => setHoveredSegment(item.name)}
                onMouseLeave={() => setHoveredSegment(null)}
              >
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                {item.name} ({item.value}%)
              </Badge>
            ))}
          </div>
        </Card>
      </div>

      {/* Heatmap */}
      <Card className="glass-panel border-panel-border p-4">
        <h3 className="text-sm font-semibold text-foreground mb-3">
          Incident Heatmap (Day/Time)
        </h3>
        <div className="grid grid-cols-4 gap-2">
          {["Morning", "Afternoon", "Evening", "Night"].map((period) => (
            <div key={period} className="text-xs font-semibold text-muted-foreground text-center mb-2">
              {period}
            </div>
          ))}
          {heatmapData.map((row) => (
            <React.Fragment key={row.day}>
              <div className="text-xs font-semibold text-foreground flex items-center mb-2">
                {row.day}
              </div>
              {["morning", "afternoon", "evening", "night"].map((period) => {
                const value = row[period as keyof typeof row] as number;
                const maxValue = 20;
                const intensity = value / maxValue;
                return (
                  <div
                    key={`${row.day}-${period}`}
                    className="aspect-square rounded flex items-center justify-center text-xs font-semibold cursor-pointer transition-all hover:scale-105"
                    style={{
                      backgroundColor: `rgba(239, 68, 68, ${intensity * 0.8})`,
                      opacity: 0.7 + intensity * 0.3,
                    }}
                    title={`${row.day} ${period}: ${value} incidents`}
                  >
                    {value}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </Card>
    </div>
  );
}
