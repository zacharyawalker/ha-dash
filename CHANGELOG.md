# Changelog

All notable changes to HA Dash will be documented in this file.

## [0.1.0] — 2026-03-12

### Added
- **WebSocket-first architecture** — real-time entity state via HA WebSocket API relay
- **Connection status indicator** — green/yellow/red badge showing HA connection health
- **Light toggle widget** — on/off control with animated state feedback
- **Sensor display widget** — shows entity value with unit of measurement
- **Climate/thermostat widget** — temperature setpoints, HVAC modes, fan control, humidity
- **Scene button widget** — one-tap scene activation with animated confirmation
- **Add widget flow** — type picker → entity search → widget placed on canvas
- **Widget config panel** — declarative, data-driven side panel for editing widget settings
  - Supported field types: text, number, entity, select, toggle, color
  - Conditional field visibility (`showWhen`)
- **Entity picker** — searchable dropdown with domain filtering (65+ lights, sensors, climate, scenes)
- **Edit/View mode toggle** — edit mode for layout, view mode for interaction
- **Drag & resize widgets** — free-form positioning via react-rnd
- **Delete widget** — two-step confirmation in config panel
- **Dashboard persistence** — JSON file storage via REST API
- **Docker deployment** — s6-overlay v3, HA add-on compatible with ingress support

### Fixed
- Widget add fails on non-HTTPS contexts (crypto.randomUUID fallback)
- Config panel disappears on mouse release (event phase mismatch)
- Widget drag broken by event propagation (removed stopPropagation approach)
