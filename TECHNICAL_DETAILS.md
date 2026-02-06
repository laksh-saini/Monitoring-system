# Implementation Notes & Technical Details

## Project Structure

```
src/
├── components/
│   └── dashboard/
│       ├── sections/                     [NEW]
│       │   ├── IncidentHistory.tsx      (306 lines)
│       │   ├── Analytics.tsx            (312 lines)
│       │   └── MapView.tsx              (538 lines)
│       ├── AppSidebar.tsx               [MODIFIED]
│       ├── VideoPlayer.tsx
│       ├── EventTimeline.tsx
│       ├── AudioWaveform.tsx
│       ├── TranscriptLog.tsx
│       ├── IncidentMap.tsx
│       └── IntelligencePanel.tsx
├── pages/
│   ├── Dashboard.tsx                    [MODIFIED]
│   ├── Auth.tsx
│   ├── Index.tsx
│   └── NotFound.tsx
└── ...
```

---

## Technical Specifications

### Technologies Used
- **React 18+** with TypeScript
- **Recharts** for data visualization
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **shadcn/ui** for component library

### Component Specifications

#### 1. IncidentHistory Component

**Props**: None

**State**:
- `searchTerm`: string (search input)
- `selectedSeverity`: "all" | "critical" | "moderate" | "low"
- `dateRange`: "24h" | "7d" | "30d"
- `expandedId`: string | null (expanded row ID)

**Data Model - Incident**:
```typescript
interface Incident {
  id: string;              // e.g., "#4029"
  severity: "critical" | "moderate" | "low";
  type: string;            // e.g., "Vehicle Collision"
  typeIcon: React.ReactNode;  // Emoji or icon
  location: string;        // e.g., "Main St. & 4th Ave"
  time: string;           // e.g., "Today, 14:32"
  status: "open" | "investigating" | "closed" | "false-alarm";
  evidence: ("video" | "audio" | "report")[];
  description?: string;
}
```

**Features**:
- Real-time search filtering
- Multi-criterion filtering (severity, date range)
- Expandable rows with details
- Evidence icons with hover tooltips
- Results counter
- Responsive table with overflow handling

**Color Mapping**:
```typescript
const severityColors = {
  critical: "bg-destructive/10 text-destructive border-destructive/20",
  moderate: "bg-warning/10 text-warning border-warning/20",
  low: "bg-safe/10 text-safe border-safe/20",
};
```

---

#### 2. Analytics Component

**Props**: None

**State**:
- `hoveredSegment`: string | null (for donut chart interaction)

**Data Models**:

```typescript
interface StatCard {
  label: string;
  value: string;
  change: number;
  trend: "up" | "down";
  icon: React.ReactNode;
  color: string;
}

// Sample chart data
const incidentVolumeData = [
  { time: "00:00", incidents: 2, detected: 1 },
  // ... more entries
];

const typeDistributionData = [
  { name: "Traffic", value: 45, color: "#3B82F6" },
  // ... more entries
];

const heatmapData = [
  { day: "Mon", morning: 3, afternoon: 8, evening: 12, night: 4 },
  // ... more entries
];
```

**Widgets**:

1. **Stat Cards** (2 cards)
   - Displays KPIs
   - Shows trend indicators
   - Color-coded by metric type

2. **Incident Volume Chart**
   - Area chart using Recharts
   - Gradient fill effect
   - Interactive tooltips
   - Spike detection annotation

3. **Type Distribution Chart**
   - Donut/Pie chart
   - Interactive legend
   - Center text showing total
   - Hover effects for segments

4. **Risk Heatmap**
   - Grid layout: 7 days × 4 time periods
   - Color intensity represents incident count
   - Hover tooltips with exact values
   - Max value normalization (20)

**Styling**:
- Glassmorphic cards
- Dark theme with transparency
- Responsive grid (2 columns)
- Scrollable container

---

#### 3. MapView Component

**Props**: None

**State**:
- `showIncidents`: boolean
- `showCameras`: boolean
- `showUnits`: boolean
- `showHeatmap`: boolean
- `selectedIncident`: string | null
- `selectedCamera`: string | null
- `hoveredAlert`: string | null

**Data Models**:

```typescript
interface MapIncident {
  id: string;
  lat: number;
  lng: number;
  severity: "critical" | "moderate" | "low";
  title: string;
  time: string;
  location: string;
}

interface MapCamera {
  id: string;
  lat: number;
  lng: number;
  name: string;
  status: "online" | "offline";
  location: string;
}

interface MapUnit {
  id: string;
  lat: number;
  lng: number;
  type: "patrol" | "ambulance";
  status: string;
  responseTime?: string;
}

interface ActiveAlert {
  id: string;
  type: string;
  severity: "critical" | "moderate" | "low";
  location: string;
  time: string;
}
```

**Layout Structure**:
```
┌─────────────────────────────────────┐
│  Left Sidebar (w-80)                │
│  - Active Alerts list               │
│  - Click to select on map           │
├─────────────────────────────────────┤
│  Main Area (flex-1)                 │
│  - Layer Controls (top)             │
│  - Interactive Map (center)         │
│  - Details Panel (bottom)           │
└─────────────────────────────────────┘
```

**Map Positioning**:
- Position calculated from lat/lng coordinates
- Formula: `left = ((lng + 74.02) / 0.04) * 100%`
- Formula: `top = ((40.73 - lat) / 0.04) * 100%`
- SVG overlay for grid background

**Interactive Features**:
1. Click incident → select & expand details
2. Click camera → show status & feed options
3. Click alert → pan to location
4. Toggle layers → show/hide markers
5. Toggle heatmap → overlay gradient

**Marker Styling**:
- **Incidents**: 8×8 px circles with glow
- **Cameras**: Camera icons (color varies by status)
- **Units**: Navigation arrows (blue, rotated 45°)

---

### AppSidebar Modifications

**New Props**:
```typescript
interface AppSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  onNavigate?: (section: number) => void;  // NEW
}
```

**Modified Navigation**:
```tsx
onClick={() => {
  setActiveItem(index);
  onNavigate?.(index);  // Callback to parent
}}
```

**Nav Items Array**:
```typescript
const navItems = [
  { icon: Radio, label: "Live Monitoring", active: true },    // 0
  { icon: History, label: "Incident History", active: false }, // 1
  { icon: BarChart3, label: "Analytics", active: false },      // 2
  { icon: Map, label: "Map View", active: false },            // 3
  { icon: Settings, label: "Settings", active: false },       // 4
];
```

---

### Dashboard Modifications

**New State**:
```typescript
const [activeSection, setActiveSection] = useState(0);
```

**Section Routing**:
```tsx
{activeSection === 0 && <LiveMonitoring />}
{activeSection === 1 && <IncidentHistory />}
{activeSection === 2 && <Analytics />}
{activeSection === 3 && <MapView />}
{activeSection === 4 && <Settings />}
```

**Props Passed to Sidebar**:
```tsx
<AppSidebar
  collapsed={sidebarCollapsed}
  onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
  onNavigate={setActiveSection}  // NEW
/>
```

---

## Performance Considerations

### Optimization Techniques

1. **Responsive Containers**
   - `min-h-0` on flex children to enable proper overflow
   - `overflow-auto` for scrollable sections
   - Prevents layout shift and ensures proper sizing

2. **Chart Performance**
   - Limited data points (8 for volume, 7×4 for heatmap)
   - ResponsiveContainer for proper scaling
   - Memoization candidates for future optimization

3. **Table Performance**
   - 8 sample incidents (can handle ~100 without virtualization)
   - Filter calculations run on client-side
   - Consider virtual scrolling if dataset grows

4. **Map Performance**
   - SVG grid background (lightweight)
   - Positioned elements (CSS faster than canvas)
   - Layer toggles for conditional rendering

---

## Styling System

### Color Tokens Used

```
Destructive (Critical):   #EF4444  → bg-destructive/10, text-destructive
Warning (Moderate):       #F97316  → bg-warning/10, text-warning
Safe (Low):              #10B981  → bg-safe/10, text-safe
Primary (Selected):      #3B82F6  → bg-primary/10, text-primary
Info (Secondary):        #0EA5E9  → bg-info/10, text-info
Muted (Inactive):        #6B7280  → text-muted-foreground
```

### Component Classes

- `glass-panel`: `bg-background/50 backdrop-blur-sm`
- `border-panel-border`: Border color for panels
- `text-foreground`: Primary text color
- `text-muted-foreground`: Secondary text color

---

## Error Handling

### Current Error Handling

1. **Search**: Empty results show "Showing 0 of X incidents"
2. **Filters**: Invalid filters default to "all"
3. **Map**: Missing coordinates handled with fallback positioning
4. **Charts**: Empty data handled by Recharts defaults

### Future Enhancements

- Error boundaries for component isolation
- Toast notifications for user feedback
- Retry logic for API calls
- Validation for incident data

---

## Accessibility Features

### Implemented

- Semantic HTML structure
- Proper button elements for click handlers
- Label associations with inputs
- Color + icons for visual distinction
- Keyboard focus states (via Tailwind)

### Future Improvements

- ARIA labels for complex components
- Keyboard navigation shortcuts
- Screen reader support enhancements
- High contrast mode support

---

## Testing Recommendations

### Unit Tests

```typescript
// IncidentHistory.test.tsx
- Test search filtering
- Test severity filtering
- Test date range selection
- Test row expansion
- Test evidence icon display

// Analytics.test.tsx
- Test stat card rendering
- Test chart data display
- Test heatmap color calculation
- Test legend interaction

// MapView.test.tsx
- Test layer toggle functionality
- Test position calculation
- Test alert selection
- Test details panel display
```

### E2E Tests

```
- Navigate between sections
- Perform actions in each section
- Verify data persistence
- Test responsive behavior
- Validate user interactions
```

---

## Build & Deployment

### Build Output

```
✓ 2483 modules transformed
✓ Production build successful
✓ No TypeScript errors
✓ No ESLint warnings
```

### Build Command

```bash
npm run build
```

### Output Location

```
dist/
├── index.html
├── assets/
│   ├── index-[hash].js
│   ├── [fonts].woff2
│   └── ...
```

### File Sizes (Estimated)

- IncidentHistory.tsx: ~10KB gzipped
- Analytics.tsx: ~12KB gzipped
- MapView.tsx: ~18KB gzipped
- Total bundle increase: ~40KB gzipped

---

## Future Enhancements Roadmap

### Phase 2: Backend Integration
- [ ] Connect to real incident API
- [ ] WebSocket for real-time updates
- [ ] Database persistence
- [ ] Authentication & authorization

### Phase 3: Advanced Features
- [ ] Real Mapbox integration
- [ ] Video player integration
- [ ] Report generation
- [ ] Export functionality

### Phase 4: AI/ML Features
- [ ] Predictive analytics
- [ ] Anomaly detection
- [ ] Automated categorization
- [ ] Smart recommendations

### Phase 5: Mobile Support
- [ ] Responsive design refinement
- [ ] Touch-friendly interactions
- [ ] Offline support
- [ ] Native app (React Native)

---

## Configuration Files

### Relevant Config Files

- `vite.config.ts`: Build configuration
- `tailwind.config.ts`: Tailwind customization
- `tsconfig.json`: TypeScript configuration
- `eslint.config.js`: Linting rules

### No Configuration Changes Needed

All new components use existing:
- Tailwind classes
- shadcn/ui components
- Lucide icons
- TypeScript setup

---

## Dependencies Added

### No New Dependencies Required

All implementations use existing packages:
- `react`: Already installed
- `typescript`: Already installed
- `recharts`: Already installed
- `lucide-react`: Already installed
- `tailwind-css`: Already installed
- `@/components/ui/*`: Already available

---

## Documentation Files Created

1. `IMPLEMENTATION_SUMMARY.md` (10KB)
   - Comprehensive feature overview
   - Data structure documentation
   - Usage guide

2. `VISUAL_GUIDE.md` (8KB)
   - ASCII layout diagrams
   - Color schemes
   - Navigation structure
   - Quick reference

3. This file: `TECHNICAL_DETAILS.md` (7KB)
   - Technical specifications
   - Code structure
   - Performance notes
   - Future roadmap

---

## Quick Start

### For Developers

1. Review `IMPLEMENTATION_SUMMARY.md` for feature overview
2. Check `VISUAL_GUIDE.md` for UI layouts
3. Refer to this file for technical details
4. Examine component files for implementation details

### For Designers

1. Check `VISUAL_GUIDE.md` for color schemes and layouts
2. Review component styling in the `.tsx` files
3. Tailwind classes used for all styling

### For PMs/Stakeholders

1. Read `IMPLEMENTATION_SUMMARY.md` features list
2. Review `VISUAL_GUIDE.md` for UI preview
3. Check "Future Enhancements Roadmap" section

---

**Document Version**: 1.0
**Last Updated**: February 6, 2026
**Status**: ✅ Complete
