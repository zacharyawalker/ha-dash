# HA Dash — Development Roadmap

*Phased approach from POC to production-ready community release.*  
*Compiled by HA Dev 🛠️ & HA Admin 🏠 — March 2026*

---

## Current State

- Phase 1 POC skeleton is built: free-form canvas, light toggle, sensor display, dashboard save/load, Flask backend, Docker add-on
- Version alignment needed (changelog says 0.1.0, config.yaml says 0.3.1)
- REST polling for entity state (per-widget, every 5s)
- Two widget types: `light-toggle`, `sensor-display`
- Deployed as HA add-on via Docker with s6-overlay

---

## Phase 1: Foundation & Polish (v1.0)

**Goal:** Production-ready foundation with solid architecture and core UX.

### Architecture
- [ ] WebSocket migration — replace REST polling with single HA WebSocket connection
- [ ] Shared entity state — single Zustand store for all entity data, selective subscriptions
- [ ] Connection status indicator with auto-reconnect and backoff
- [ ] Proper error handling for unavailable/unknown entity states
- [ ] Fix version inconsistency (align changelog, config.yaml, package.json)

### Core UX
- [ ] Widget configuration panel — edit entity ID, label, and settings via UI (not code)
- [ ] Entity picker — browse available HA entities when configuring widgets
- [ ] Delete widget in edit mode (with confirmation)
- [ ] Climate/thermostat widget — setpoint control, mode selector (most-used HA feature after lights)
- [ ] Scene activation button — simple, high-value widget
- [ ] Dark theme polish — consistent design tokens, clean visual hierarchy

### Quality
- [ ] Unit tests for Zustand store and API client
- [ ] Integration tests against HA WebSocket API
- [ ] ESLint + TypeScript strict enforcement
- [ ] CI/CD: GitHub Actions for build, lint, test on PR

### Documentation
- [ ] README with screenshots, installation guide, development setup
- [ ] CHANGELOG alignment with actual version history

---

## Phase 2: Core Widget Library (v1.1–v1.3)

**Goal:** Cover the most common HA dashboard needs. After this phase, HA Dash handles 80% of what users put on dashboards.

### Widgets (priority order per HA Admin)
- [ ] Switch / input_boolean toggle
- [ ] Script trigger button (with loading state)
- [ ] Binary sensor status indicator (door/window, motion, leak)
- [ ] Dimmer slider (brightness control for lights)
- [ ] Automation toggle (enable/disable with last-triggered timestamp)
- [ ] Input helpers — input_select dropdown, input_number slider, input_datetime picker
- [ ] Weather forecast widget (current conditions + multi-day)
- [ ] Markdown / text block widget
- [ ] Clock / date display widget
- [ ] Group status widget ("3 of 12 windows open")

### Infrastructure
- [ ] Widget Registry v2 — dynamic registration, lazy loading per widget type
- [ ] Device class icon mapping — use HA's standardized icons per device class
- [ ] Widget sizing presets (small/medium/large defaults per type)

---

## Phase 3: Visual & UX Upgrade (v1.4–v1.6)

**Goal:** Make it beautiful. This is where HA Dash surpasses native HA dashboards.

### Theming
- [ ] CSS custom properties theme system
- [ ] Dark / light mode toggle
- [ ] Mirror HA's theme variables for consistency
- [ ] Per-dashboard theme overrides

### Interactions
- [ ] Framer Motion animations — widget add/remove transitions, state change animations
- [ ] Grid snapping (optional alignment guides, snap-to-grid toggle)
- [ ] Undo / redo for edit mode (action history stack)
- [ ] Widget copy / paste
- [ ] Multi-select widgets (bulk move, align, delete)

### Layout
- [ ] Responsive layouts — stored breakpoint variants (mobile / tablet / desktop)
- [ ] Dashboard tabs / pages (multi-view navigation)
- [ ] Widget grouping / nesting (collapsible groups)
- [ ] Touch optimization — larger hit targets, swipe gestures for mobile

### Community
- [ ] HACS integration — repository setup for easy community installation
- [ ] Community feedback channel

---

## Phase 4: Advanced Widgets (v2.0)

**Goal:** Full smart home coverage. Every major HA domain has a widget.

### Media & Cameras
- [ ] Media player — transport controls, volume, source selector, album art
- [ ] Camera feed — MJPEG/HLS proxy through backend, bandwidth optimization

### Climate & Environment
- [ ] Fan speed control (steps, oscillation toggle)
- [ ] Cover / blinds position slider with tilt control
- [ ] Air quality / humidity gauge

### Security
- [ ] Lock / garage door — secure toggle with confirmation dialog
- [ ] Person / device tracker — map pins with location data

### Data Visualization
- [ ] History sparkline graphs (HA history API integration)
- [ ] Gauge / radial meters with color-coded thresholds
- [ ] Energy flow diagram — solar production, battery, grid import/export
- [ ] Calendar agenda widget

---

## Phase 5: Power Features (v2.1–v2.5)

**Goal:** Advanced capabilities for power users and complex setups.

### Dashboard Management
- [ ] Multi-dashboard — create, switch, rename, delete dashboards
- [ ] Dashboard import / export (JSON)
- [ ] Dashboard templates (pre-built starter layouts)

### Dynamic Content
- [ ] Conditional widget visibility — show/hide based on entity state expressions
- [ ] Template text — dynamic labels with entity value interpolation
- [ ] Notification / logbook feed widget

### Customization
- [ ] Iframe embed widget (Grafana, external dashboards)
- [ ] Custom CSS per widget
- [ ] Custom background images / colors per dashboard
- [ ] Widget z-index control (layering)

### Reliability
- [ ] Offline mode — last-known state with staleness indicators
- [ ] Local storage caching for dashboard configs
- [ ] Performance optimization for 50+ widget dashboards

---

## Phase 6: Community & Ecosystem (v3.0)

**Goal:** Community-ready, extensible platform.

### Access Control
- [ ] User authentication & permission tiers
- [ ] Family-friendly permission models (parent/child/guest)
- [ ] Secure action confirmations for critical controls

### Extensibility
- [ ] Widget SDK — community-created custom widgets
- [ ] Widget marketplace / sharing
- [ ] Plugin architecture for third-party integrations

### Advanced Widgets
- [ ] Interactive floor plans — SVG overlay with entity state binding
- [ ] Vacuum / robot controls — map view, zone cleaning, status
- [ ] 3D room visualization (stretch goal)

### Scale
- [ ] Multi-client conflict resolution
- [ ] Dashboard sync across devices
- [ ] Performance profiling and optimization tools

---

## Technical Principles (All Phases)

- **TypeScript strict mode** — no `any`, proper interfaces for everything
- **React 19** — functional components, hooks, composition patterns
- **WebSocket-first** — real-time state, selective subscriptions
- **Bundle size matters** — lazy load widgets, tree-shake unused code
- **Test edge cases** — unavailable, unknown, null states; HA restarts; token expiration
- **Mobile-first** — dashboards run on tablets and phones
- **Accessibility** — keyboard navigation, screen reader support, ARIA labels

## HA-Specific Testing Strategy

- **Demo mode**: Use HA's built-in demo entities for development
- **Test helpers**: Create `input_boolean`, `input_number`, `input_select` for testing
- **Mock WebSocket**: Mock HA WS responses for unit tests
- **Real integration**: E2E tests against a real HA instance
- **State edge cases**: Test `unavailable`, `unknown`, `null`, binary sensor variants (`on`/`off` vs `True`/`False`)
- **Reconnection**: Test behavior during HA restarts and Supervisor updates

---

*This roadmap is a living document. Updated as phases complete and priorities shift.*
