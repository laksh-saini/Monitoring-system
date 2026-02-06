# OmniSense Dashboard - Quick Visual Reference

## Navigation Structure

```
┌─────────────────────────────────────────────────────────┐
│  OmniSense AI                                           │
├─────────────────────────────────────────────────────────┤
│ ○ Live Monitoring      (Original Layout)               │
│ ○ Incident History     (Logbook)                       │
│ ○ Analytics            (City Health Dashboard)         │
│ ○ Map View             (Geospatial Command)            │
│ ○ Settings             (Coming Soon)                   │
├─────────────────────────────────────────────────────────┤
│ 🟢 System Operational                                   │
│    Latency: 12ms                                       │
└─────────────────────────────────────────────────────────┘
```

---

## Section 1: INCIDENT HISTORY 📕

### Layout:
```
┌────────────────────────────────────────────────────────┐
│  📕 Incident History                                   │
│  Searchable database of all past events                │
├────────────────────────────────────────────────────────┤
│ Search [...................]  📅 Last 24 Hours ▼      │
├────────────────────────────────────────────────────────┤
│ Severity: [All] [Critical] [Moderate] [Low]           │
├────────────────────────────────────────────────────────┤
│ ID    │Severity│Type           │Location │Time │Status│
├──────┼────────┼──────────────┼────────┼────┼──────┤
│#4032 │🔴CRI  │🚗 Collision  │Main St │14:3│Invst │
│#4031 │🔴CRI  │🔥 Fire       │Dwntn   │13:1│Invst │
│#4030 │🟡MOD  │🚑 Medical    │Park    │12:4│Close │
│      │        │              │        │    │      │
│ ↳ Full incident details, evidence icons, expandable   │
├────────────────────────────────────────────────────────┤
│ Showing 8 of 8 incidents                               │
└────────────────────────────────────────────────────────┘
```

### Evidence Icons:
- 📹 Video Feed Available
- 🎙️ Audio Recording Available  
- 📄 Written Report Available

### Severity Badges:
- 🔴 Critical (Red) - Urgent action required
- 🟡 Moderate (Orange) - Attention needed
- 🟢 Low (Green) - Monitor status

### Status Badges:
- 🔵 Open - Awaiting triage
- 🟠 Investigating - Active response
- 🟢 Closed - Resolved
- ⚪ False Alarm - Non-incident

---

## Section 2: ANALYTICS 📊

### Layout:
```
┌────────────────────────────────────────────────────────┐
│ 📊 Analytics Dashboard                                 │
│ High-level trends for decision makers                  │
├─────────────────────────┬──────────────────────────────┤
│ Avg Detection Time      │ Avg Dispatch Time            │
│ 1.2s                    │ 4m 30s                       │
│ ⬇ 12% vs last week      │ ⬇ 8% vs last week           │
├─────────────────────────┼──────────────────────────────┤
│                         │                              │
│  Incident Volume        │  Type Distribution           │
│  (Line Chart)           │  (Donut Chart)               │
│                         │    Traffic: 45%              │
│  Spike 18:00-20:00 ▲    │    Safety: 30%               │
│                         │    Fire: 15%                 │
│                         │    Medical: 10%              │
│                         │    Total: 100                │
├────────────────────────────────────────────────────────┤
│ Incident Heatmap (Day/Time)                            │
│                                                        │
│        Morning  Afternoon  Evening  Night              │
│ Mon    3        8          12       4                  │
│ Tue    4        9          14       5                  │
│ Wed    2        7          10       3                  │
│ Thu    5        11         16       6    ← Peak Day   │
│ Fri    6        13         18       7                  │
│ Sat    8        15         20       9    ← Max Peak   │
│ Sun    7        12         17       8                  │
│                                                        │
│        [Colors intensify = higher risk]               │
└────────────────────────────────────────────────────────┘
```

### Key Metrics:
- **Detection Time**: How quickly AI detects incidents
- **Dispatch Time**: Average response dispatch delay
- **Type Distribution**: Breakdown of incident categories
- **Heatmap**: Identifies dangerous times and days

---

## Section 3: MAP VIEW 🗺️

### Layout:
```
┌──────────────────┬─────────────────────────────────────┐
│  Active Alerts   │        GEOSPATIAL MAP               │
│  ════════════    │  ┌───────────────────────────────┐  │
│                  │  │                               │  │
│ 🔴 Vehicle Col   │  │    🔴 (Pulsing)              │  │
│ Main St & 4th   │  │                               │  │
│ 14:32            │  │         🟡          📹       │  │
│ [Selected]       │  │                 🟢   🟢       │  │
│ ─────────────    │  │      ➜ (Moving)              │  │
│                  │  │                               │  │
│ 🔴 Fire Alert    │  │  🔴 (Pulsing + Glow)        │  │
│ Downtown 12      │  │                               │  │
│ 13:15            │  │      📷  📷       ➜          │  │
│                  │  │                               │  │
│ 🟡 Medical Emg   │  │                               │  │
│ Park Entrance    │  │                               │  │
│ 12:45            │  │    Grid Background            │  │
│                  │  └───────────────────────────────┘  │
│                  │  Layers: [✓]Incidents [✓]Cameras   │
│                  │           [✓]Units [☐]Heatmap     │
├──────────────────┼─────────────────────────────────────┤
│                  │  Legend: 🔴 Critical  🟡 Moderate   │
│                  │          🟢 Low  📷 Camera  ➜ Unit  │
├──────────────────┼─────────────────────────────────────┤
│                  │  Details Panel (Expandable)         │
│                  │  Vehicle Collision - Main St & 4th  │
│                  │  [View Details Button]              │
└──────────────────┴─────────────────────────────────────┘
```

### Map Symbols:
- **🔴** Pulsing red dot = Critical incident
- **🟡** Pulsing orange dot = Moderate incident
- **🟢** Pulsing green dot = Low priority incident
- **📷** Camera icon = CCTV location
- **➜** Blue arrow = Responding unit
- **Glow effect** = Selected/active element

### Layer Controls:
- Toggle incidents on/off
- Toggle cameras (shows online/offline status)
- Toggle responding units
- Enable/disable historical heatmap overlay

### Features:
- Click alerts to pan map
- Click incidents for details
- Click cameras for live feed
- Hover coordinates show exact position
- Expandable details panel

---

## Color Scheme

| Status | Color | Hex | Usage |
|--------|-------|-----|-------|
| Critical | Red | #EF4444 | Highest priority incidents |
| Moderate | Orange | #F97316 | Medium priority incidents |
| Low | Green | #10B981 | Minor incidents/monitoring |
| Primary | Blue | #3B82F6 | Highlights, selected items |
| Info | Cyan | #0EA5E9 | Information, camera status |
| Muted | Gray | #6B7280 | Secondary info, disabled |

---

## State Transitions

```
┌─ Dashboard Component
├─ activeSection = 0-4
│
├─ 0: Live Monitoring (default)
│  └─ Original video/audio interface
│
├─ 1: Incident History
│  └─ Expandable data table
│     ├─ Search enabled
│     ├─ Filtering available
│     └─ Detail rows expandable
│
├─ 2: Analytics
│  └─ Four dashboard widgets
│     ├─ Stat cards (2)
│     ├─ Charts (2)
│     └─ Heatmap (1)
│
├─ 3: Map View
│  └─ Interactive geospatial display
│     ├─ Left sidebar alerts
│     ├─ Layer controls
│     ├─ Interactive markers
│     └─ Details panel
│
└─ 4: Settings
   └─ Placeholder (coming soon)
```

---

## Responsive Behavior

### Desktop (Full Width):
- Sidebar: 64px (collapsed) or 256px (expanded)
- Main content: Full remaining width
- All sections fully visible

### Tablet/Mobile:
- Sidebar collapses to icons
- Map view adapts to narrow screens
- Table sections maintain scrollability
- Charts remain responsive

---

## Keyboard Shortcuts (Future)

```
[1]     Switch to Live Monitoring
[2]     Switch to Incident History
[3]     Switch to Analytics
[4]     Switch to Map View
[ESC]   Close expanded details
[/]     Open search in Incident History
[H]     Toggle Map heatmap
[?]     Help menu
```

---

## Data Flow

```
User clicks Sidebar
        │
        ▼
onNavigate(section)
        │
        ▼
setActiveSection(section)
        │
        ▼
activeSection state updates
        │
        ▼
Conditional rendering
        │
        ├─ Section 0? → Show Live Monitoring
        ├─ Section 1? → Show IncidentHistory component
        ├─ Section 2? → Show Analytics component
        ├─ Section 3? → Show MapView component
        └─ Section 4? → Show Settings placeholder
```

---

**Last Updated**: February 6, 2026
**Version**: 1.0
**Status**: ✅ Production Ready
