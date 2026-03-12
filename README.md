# HA Dash 🏠

A free-form, drag-and-drop dashboard for Home Assistant. Built with React 19 + TypeScript, served as an HA add-on via Flask.

![Version](https://img.shields.io/badge/version-0.1.0-blue)
![Phase](https://img.shields.io/badge/phase-1%20MVP-green)

## Features

- **Free-form layout** — drag and resize widgets anywhere on the canvas
- **Real-time updates** — WebSocket connection to HA for instant state changes
- **Widget types** — Light Toggle, Sensor Display, Climate/Thermostat, Scene Button
- **Config panel** — declarative, data-driven widget configuration
- **Entity picker** — searchable dropdown with domain filtering
- **Edit/View modes** — edit mode for layout, view mode for interaction
- **Dark theme** — consistent design tokens via CSS custom properties
- **Error boundaries** — per-widget error isolation

## Architecture

```
┌─────────────┐     WebSocket     ┌──────────────┐     WebSocket     ┌─────────┐
│   Browser    │ ◄──────────────► │ Flask Backend │ ◄──────────────► │   HA    │
│  (React 19)  │                  │  (WS Relay)   │                  │  Core   │
└─────────────┘     REST API      └──────────────┘                   └─────────┘
```

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Zustand
- **Backend**: Flask 3.x, flask-sock, websocket-client
- **Deployment**: Docker with s6-overlay v3, HA add-on with ingress

## Quick Start (Development)

### Prerequisites
- Node.js 22+
- Python 3.12+
- A Home Assistant instance with a long-lived access token

### Setup

```bash
git clone https://github.com/zacharyawalker/ha-dash.git
cd ha-dash

# Frontend
cd frontend
npm install
npm run build
cd ..

# Backend
cd backend
pip install -r requirements.txt
cd ..

# Configure environment
cp .env.example .env
# Edit .env with your HA_URL and HA_TOKEN
```

### Run

```bash
# Set environment
export HA_URL="http://your-ha-instance:8123"
export HA_TOKEN="your-long-lived-token"
export FRONTEND_DIR="$(pwd)/frontend/dist"
export DASHBOARDS_DIR="$(pwd)/data/dashboards"
mkdir -p data/dashboards

# Start
cd backend
python3 -c "from app import app; app.run(host='0.0.0.0', port=8099, debug=False)"
```

Open `http://localhost:8099` in your browser.

### Development (with hot reload)

```bash
# Terminal 1: Backend
cd backend && python3 -c "from app import app; app.run(host='0.0.0.0', port=8099)"

# Terminal 2: Frontend dev server (proxies API to backend)
cd frontend && npm run dev
```

## HA Add-on Installation

1. Add this repository to your HA add-on store
2. Install "HA Dash"
3. Start the add-on
4. Access via the sidebar (ingress)

The add-on automatically uses the Supervisor token — no manual token configuration needed.

## Project Structure

```
ha-dash/
├── backend/
│   ├── app.py              # Flask app, routes, ingress handling
│   └── api/
│       └── ws_relay.py     # HA WebSocket relay singleton
├── frontend/
│   └── src/
│       ├── api/            # REST client, WebSocket manager
│       ├── components/     # React components
│       │   └── widgets/    # Widget implementations + registry
│       ├── hooks/          # Custom hooks (useHaEntities)
│       ├── store/          # Zustand stores (dashboard, entity)
│       ├── types/          # TypeScript types
│       └── test/           # Vitest tests
├── config.yaml             # HA add-on configuration
├── Dockerfile              # Production build
└── rootfs/                 # s6-overlay service definitions
```

## Adding a Widget Type

1. Create `frontend/src/components/widgets/MyWidget.tsx` implementing `WidgetProps`
2. Add a `WidgetDefinition` entry in `WidgetRegistry.ts` with `configFields`
3. That's it — the config panel renders automatically

## Tech Stack

| Layer | Technology |
|-------|-----------|
| UI Framework | React 19 + TypeScript (strict) |
| Build | Vite 7 |
| Styling | Tailwind CSS v4 + CSS custom properties |
| State | Zustand 5 |
| Drag & Resize | react-rnd |
| Animations | Framer Motion |
| Icons | MDI (@mdi/js + @mdi/react) |
| Backend | Flask 3.x + flask-sock |
| Testing | Vitest + Testing Library |
| CI | GitHub Actions |

## License

MIT
