# Dashboard - Cowork-Inspired Design

A modern, workflow-first dashboard for Olleey, inspired by Anthropic's Cowork mode principles.

## 🎯 Design Philosophy

### Core Principles

1. **Workflow over chat** - Live control room, not a historical feed
2. **Execution over advice** - System owns the pipeline, UI enables monitoring and steering
3. **Transparency through progressive disclosure** - Clean high-level status with drill-down details
4. **Inline permissions and safety** - Contextual confirmations before irreversible actions
5. **Sandboxed trust** - Clear visibility into channel connections and permissions

## 📐 Layout Structure

### Three-Zone Layout

```
┌──────────────┬─────────────────────────────────────┬────────────────┐
│              │                                     │                │
│  Left        │         Center Panel                │  Right         │
│  Sidebar     │      (Primary Workspace)            │  Sidebar       │
│              │                                     │  (Contextual)  │
│  - Logo      │  - Dashboard View                   │                │
│  - Nav       │  - Job Detail View                  │  - Activity    │
│  - Active    │  - Videos View                      │    Log         │
│    Count     │  - Channels View                    │  - Cost        │
│  - User      │  - Voices View                      │    Tracker     │
│              │  - Settings View                    │  - System      │
│              │                                     │    Health      │
└──────────────┴─────────────────────────────────────┴────────────────┘
```

## 📦 Component Structure

```
Dashboard/
├── DashboardLayout.tsx      # Main layout coordinator
├── LeftSidebar.tsx             # Navigation & user profile
├── CenterPanel.tsx             # View router
├── RightSidebar.tsx            # Contextual details
│
├── views/
│   ├── DashboardView.tsx       # Active jobs & review queue
│   ├── JobDetailView.tsx       # Pipeline detail with tabs
│   ├── VideosView.tsx          # Video library (placeholder)
│   ├── ChannelsView.tsx        # Channel management (placeholder)
│   ├── VoicesView.tsx          # Voice profiles (placeholder)
│   └── SettingsView.tsx        # Settings (placeholder)
│
└── components/
    ├── JobCard.tsx             # Job status card
    ├── PipelineStepper.tsx     # Horizontal progress bar
    ├── NewLocalizationModal.tsx # Job creation wizard
    ├── ReviewTab.tsx           # Video review interface
    ├── TranscriptTab.tsx       # Transcript editing
    ├── MetadataTab.tsx         # Metadata localization
    └── DistributionTab.tsx     # Publishing targets
```

## 🚀 Usage

### Basic Integration

Replace your existing dashboard with Dashboard:

```tsx
import DashboardLayout from "@/components/Dashboard/DashboardLayout";

export default function DashboardPage() {
  return <DashboardLayout />;
}
```

### Key Features

#### 1. **Active Pipeline View**
- Real-time job cards with progress indicators
- Animated status transitions
- Quick actions (pause, cancel, view details)

#### 2. **Horizontal Pipeline Stepper**
Shows 8 stages:
- Upload → Transcribe → Translate → Dub → Lip-Sync → Assemble → Review → Publish

#### 3. **Multi-Tab Workspace**
When drilling into a job:
- **Overview**: Stage-by-stage progress per language
- **Review**: Side-by-side video comparison with approval checklist
- **Transcript**: Source and translated text editing
- **Metadata**: Localized titles, descriptions, tags
- **Distribution**: Channel assignment per language

#### 4. **Right Sidebar Context**
Adapts to selection:
- **Job selected**: Activity log, cost tracker, time estimate
- **No selection**: System health (API quotas, storage, workers)

#### 5. **New Localization Wizard**
5-step flow:
1. Source (YouTube URL or upload)
2. Languages (multi-select)
3. Voices (per-language assignment)
4. Distribution (channel targets)
5. Confirm (review and launch)

## 🎨 Visual Design

### Color Palette
- **Primary Accent**: Olleey Yellow (#FFC107)
- **Background (Dark)**: #0A0A0A, #0F0F0F, #1A1A1A
- **Background (Light)**: #FFFFFF, #F9FAFB
- **Success**: Green (#10B981)
- **Warning**: Yellow (#FFC107)
- **Error**: Red (#EF4444)

### Typography
- **Font**: Montserrat (already in use)
- **Weights**: Bold (headings/stats), Regular (body), Mono (technical)

### Motion
- **Framer Motion**: Subtle transitions (0.2s duration)
- **Progress animations**: Smooth width changes
- **Hover effects**: Scale 1.02, Tap scale 0.98
- **Pulse animations**: For active stages

## 🔧 Customization

### Adding New Views

1. Create view component in `views/`:
```tsx
export function MyCustomView({ theme }: { theme: string }) {
  // Your view implementation
}
```

2. Add to `ViewType` in `DashboardLayout.tsx`:
```tsx
export type ViewType = "dashboard" | "videos" | "my-view";
```

3. Add nav item to `LeftSidebar.tsx`:
```tsx
const navItems = [
  // ...existing items
  { id: "my-view", label: "My View", icon: MyIcon }
];
```

4. Add case to `CenterPanel.tsx`:
```tsx
case "my-view":
  return <MyCustomView theme={theme} />;
```

### Theming

The dashboard respects the global theme:
- Dark mode (default): Spotify-inspired dark UI
- Light mode: Clean, minimal light UI

Toggle via `useTheme()` hook.

## 📊 State Management

- **Navigation**: Local state in `DashboardLayout`
- **Jobs Data**: `useDashboardJobs` hook
- **Selection**: `SelectedItem` interface for drill-down
- **Sidebar**: `rightSidebarOpen` boolean

## 🔐 Permissions & Safety

Following Cowork's pattern:
- **Inline confirmations** before destructive actions
- **Clear permission visibility** for connected channels
- **Sandboxed operations** with explicit user consent

## 🚧 Future Enhancements

### Phase 1 (Completed ✅)
- [x] Three-zone layout
- [x] Active pipeline cards
- [x] Job detail with tabs
- [x] Pipeline stepper
- [x] New localization wizard

### Phase 2 (Coming Soon)
- [ ] Real-time supabase
- [ ] Batch approval interface
- [ ] Inline commenting system
- [ ] Advanced filtering
- [ ] Template management
- [ ] Cost estimation per job

### Phase 3
- [ ] Video library integration
- [ ] Channel health monitoring
- [ ] Voice cloning UI
- [ ] A/B testing interface
- [ ] Analytics dashboard

## 📝 Notes

### What NOT to Copy from Cowork
- ❌ Plain text input as primary interface (Olleey is structured workflow software)
- ❌ File/folder thinking (abstract to "videos" and "languages")
- ❌ Terminal-style output (use modern SaaS dashboard patterns)

### Inspiration Sources
- **Anthropic Cowork**: Permission model, progressive disclosure, real-time progress
- **Linear**: Clean UI, keyboard shortcuts, fast interactions
- **Vercel**: Deployment pipeline visualization
- **Spotify**: Dark mode aesthetic, generous whitespace

## 🎓 Best Practices

1. **Always show what's happening** - Never hide system state
2. **Progressive disclosure** - Start simple, allow drill-down
3. **Contextual help** - Tooltips and inline guidance
4. **Keyboard shortcuts** - Power user efficiency
5. **Error recovery** - Clear actions when things fail
6. **Cost transparency** - Always show processing costs

## 🤝 Contributing

When adding features:
1. Follow the three-zone layout pattern
2. Use Framer Motion for transitions
3. Respect the Olleey Yellow accent color
4. Implement both light and dark themes
5. Add loading and error states
6. Document your components

---

Built with ❤️ following Anthropic's Cowork principles
