# Changelog

## [2.1.0] - 2026-03-16

### Added — Add-on Support
- HA add-on packaging with Dockerfile, s6-overlay service, build.yaml
- Ingress support (accessible via HA sidebar)
- Supervisor API integration (auto-authentication)
- Standalone Docker build (Dockerfile.standalone)
- Installation guide (INSTALL.md)
- Repository manifest (repository.yaml)
- Gunicorn + gevent for production WebSocket support

### Added — Widgets (50 total)
- Color Light — RGB control with color palette and temperature slider
- Button Row — horizontal strip of up to 6 toggleable entities
- Thermostat Mini — compact horizontal thermostat
- Progress Bar — animated horizontal bar for numeric sensors
- Glance Card — multi-entity overview (up to 8 entities)
- Entity Status — universal entity display with auto-detected icons
- Timer Widget — countdown with start/pause/cancel controls
- Conditional Card — show/hide content based on entity state
- Number Input — increment/decrement for input_number entities
- Date & Time — live clock with configurable format
- Todo List — local task tracking with animations
- Vacuum Control — start/pause/stop/dock with battery display
- Status Badge — ultra-compact pill-shaped entity display
- Sensor Grid — multi-sensor responsive grid

### Added — UX Polish
- Widget Palette sidebar (edit mode) — all widgets by category
- Quick Search (Ctrl+K) — search all HA entities, click to add
- Auto-Arrange — one-click grid layout for all widgets
- Alignment Guides — snap lines when widget edges align
- Double-click to edit — view mode → edit + select widget
- Category filter pills in Add Widget dropdown
- Page background settings (image URL + color picker)
- Pinch-to-zoom and Ctrl+scroll zoom (0.3x–2.0x)
- Responsive auto-scaling for tablets/phones
- Shift+Click multi-select with Delete
- Ctrl+A select all widgets
- Widget size label below selected widget
- Widget count badge in toolbar
- Welcome wizard for first-time users
- 10 widget templates (Kitchen, Media Room, Bathroom, Office, Garage, etc.)

## [2.0.0] - 2026-03-13

### Added
- Initial release with 21 widget types
- Free-form drag-and-drop dashboard
- Real-time HA WebSocket API integration
- Multi-page dashboards with page tabs
- Dark/light theme system
- Grid snap, undo/redo, copy/paste
- Dashboard import/export
- Widget customization (icons, colors, labels)
- History graph with SVG rendering
- Touch optimization for tablets
- Auto-hide toolbar in view mode
- Fullscreen support
- Connection status banner
- Toast notifications
- Minimap overlay
- Keyboard shortcuts
