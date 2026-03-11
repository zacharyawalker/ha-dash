# HA Dash - Architecture & Technical Overview

## What Is HA Dash?

HA Dash is a **Home Assistant add-on** that provides a visual, drag-and-drop dashboard builder. Unlike Home Assistant's built-in dashboards (which use grid/card-based layouts), HA Dash gives users a **free-form canvas** where widgets can be placed anywhere, at any size, with no grid constraints.

The long-term goal is a rich GUI dashboard builder with animations, transitions, icon libraries, and graphic libraries that surpasses standard HA dashboards in visual quality and flexibility.

## Current Status: Phase 1 (Proof of Concept)

Phase 1 delivers a working end-to-end prototype:
- Free-form canvas with drag-and-drop widget placement
- Edit/View mode toggle
- Two widget types: Light Toggle, Sensor Display
- Dashboard save/load (persisted as JSON)
- Live connection to Home Assistant entities via REST API proxy
- Deployable as a Home Assistant add-on via Docker

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                  Home Assistant                      │
│                                                     │
│  ┌───────────────────────────────────────────────┐  │
│  │            HA Dash Add-on (Docker)            │  │
│  │                                               │  │
│  │  ┌─────────────┐    ┌──────────────────────┐  │  │
│  │  │   Flask      │    │  React SPA           │  │  │
│  │  │   Backend    │◄───│  (static files)      │  │  │
│  │  │   :8099      │    │                      │  │  │
│  │  └──────┬───────┘    └──────────────────────┘  │  │
│  │         │                                      │  │
│  │         │ SUPERVISOR_TOKEN                     │  │
│  │         ▼                                      │  │
│  │  ┌─────────────┐                               │  │
│  │  │  HA REST API │                               │  │
│  │  │  /api/states │                               │  │
│  │  │  /api/services│                              │  │
│  │  └─────────────┘                               │  │
│  └───────────────────────────────────────────────┘  │
│                                                     │
│  Ingress proxy: /api/hassio_ingress/<token>/        │
└─────────────────────────────────────────────────────┘
```

**How it works:**
1. Home Assistant loads the add-on in an **ingress iframe** (accessed from the sidebar)
2. The Flask backend serves the built React SPA as static files
3. The React app makes API calls to Flask (relative paths like `./api/...`)
4. Flask proxies those calls to the Home Assistant REST API using the `SUPERVISOR_TOKEN` (auto-injected by HA into add-on containers)
5. Dashboard layouts are saved as JSON files in `/data/dashboards/` (HA persistent storage)

---

## Tech Stack

### Frontend

| Technology | Version | Purpose |
|---|---|---|
| **React** | 19 | UI framework |
| **TypeScript** | 5.9 | Type safety |
| **Vite** | 7.3 | Build tool, dev server, HMR |
| **Tailwind CSS** | 4.2 | Utility-first styling |
| **Zustand** | 5.0 | Lightweight state management |
| **react-rnd** | 10.5 | Free-form drag and resize for widgets |
| **Framer Motion** | 12.x | Animations and transitions |
| **@mdi/react + @mdi/js** | 7.4 / 1.6 | Material Design Icons (7000+ icons) |

**Why these choices:**
- **react-rnd** enables the core free-form canvas — widgets can be placed and resized anywhere without grid constraints
- **Framer Motion** provides the animation layer for future rich visual transitions
- **Zustand** was chosen over Redux for simplicity — single store, no boilerplate, works well with React 19
- **MDI** gives access to 7000+ icons including all Home Assistant entity icons
- **Tailwind CSS v4** for rapid UI development with zero-config setup via Vite plugin

### Backend

| Technology | Purpose |
|---|---|
| **Flask 3.x** | HTTP server, API routing, static file serving |
| **Requests** | Proxying HTTP calls to HA REST API |

**Why Flask:** Lightweight, minimal dependencies, easy to deploy in a constrained Docker environment. The backend's role is intentionally thin — it proxies HA API calls (adding the auth token) and handles dashboard CRUD.

### Infrastructure

| Technology | Purpose |
|---|---|
| **Docker** (multi-stage) | Containerized deployment as HA add-on |
| **s6-overlay v3** | Process supervisor (required by HA base images) |
| **HA Ingress** | Secure proxied access from HA sidebar |

---

## Project Structure

```
ha-dash/
├── config.yaml              # HA add-on metadata (name, version, ports, permissions)
├── build.yaml               # Docker base image per architecture (amd64, aarch64, armv7)
├── Dockerfile               # Multi-stage: Node builds frontend → HA base runs everything
├── CHANGELOG.md
│
├── backend/
│   ├── app.py               # Flask entry point, serves SPA, strips ingress prefix
│   ├── requirements.txt     # Python dependencies
│   └── api/
│       ├── __init__.py
│       ├── ha_proxy.py       # Proxies HA REST API (states, services) with auth
│       └── dashboards.py     # Dashboard CRUD (list, get, save, delete as JSON files)
│
├── frontend/
│   ├── package.json
│   ├── vite.config.ts        # Dev proxy to Flask, relative base path for ingress
│   ├── index.html
│   └── src/
│       ├── main.tsx          # React DOM mount
│       ├── App.tsx           # Root component: loads dashboard, renders Toolbar + Canvas
│       ├── index.css         # Tailwind imports, dark theme base
│       │
│       ├── api/
│       │   └── client.ts     # Typed fetch wrapper for HA proxy + dashboard endpoints
│       │
│       ├── store/
│       │   └── dashboardStore.ts  # Zustand store: mode, widgets, selection, save/load
│       │
│       ├── hooks/
│       │   └── useHaEntities.ts   # Polling hooks for HA entity state (5s interval)
│       │
│       ├── components/
│       │   ├── Toolbar.tsx        # Top bar: Add Widget menu, Save, Edit/View toggle
│       │   ├── Canvas.tsx         # Widget viewport with relative positioning
│       │   ├── WidgetWrapper.tsx  # Wraps widgets with react-rnd (edit) or absolute pos (view)
│       │   └── widgets/
│       │       ├── WidgetRegistry.ts   # Maps type strings → components + default configs
│       │       ├── LightToggle.tsx     # Light on/off toggle with visual state feedback
│       │       └── SensorDisplay.tsx   # Sensor value display with unit + device-class icon
│       │
│       └── types/
│           ├── dashboard.ts   # Dashboard, Widget, WidgetConfig interfaces
│           └── widget.ts      # WidgetProps, WidgetDefinition interfaces
│
└── rootfs/                   # Overlay filesystem copied into Docker image
    └── etc/s6-overlay/s6-rc.d/
        ├── ha-dash/
        │   ├── type           # "longrun"
        │   ├── run            # Startup script: Flask on ingress port
        │   └── dependencies.d/
        │       └── base       # Depends on base services
        └── user/contents.d/
            └── ha-dash        # Registers service with s6
```

---

## Key Concepts

### Home Assistant Add-on Architecture

HA add-ons are Docker containers managed by the HA Supervisor. Key files:
- **`config.yaml`** — Declares the add-on's name, version, ports, permissions, and ingress settings
- **`build.yaml`** — Specifies base Docker images per CPU architecture
- **`Dockerfile`** — Builds the container
- **`rootfs/`** — Files overlaid onto the container filesystem (service definitions, scripts)

The add-on runs inside HA's Docker environment and gets automatic access to:
- `SUPERVISOR_TOKEN` — bearer token for HA API access (no user-generated tokens needed)
- `/data/` — persistent storage that survives container rebuilds
- Ingress — HA proxies requests to the add-on, handling authentication

### Ingress & Path Handling

HA Ingress serves the add-on UI through a proxied iframe at `/api/hassio_ingress/<token>/`. This means:
- All frontend asset paths must be **relative** (Vite `base: "./"`)
- The Flask backend must **strip the ingress prefix** from incoming request paths before routing
- API calls from the frontend use relative paths (`./api/...`) which the browser resolves correctly within the iframe context

### s6-overlay v3

HA base images use s6-overlay as the init/process supervisor. Services are defined in `/etc/s6-overlay/s6-rc.d/`:
- `type` file contains `longrun` (persistent service)
- `run` script starts the process (Flask in our case)
- `dependencies.d/base` ensures base services start first
- `user/contents.d/ha-dash` registers the service to start automatically

**Critical:** `config.yaml` must include `init: false` to prevent Docker's `--init` flag from conflicting with s6-overlay (which needs to be PID 1).

### Free-Form Canvas

The canvas uses **absolute positioning** for widgets. Each widget has `x`, `y`, `width`, `height` properties stored in the dashboard JSON. In edit mode, `react-rnd` wraps each widget to enable drag and resize. In view mode, widgets are positioned with plain CSS `position: absolute`.

### State Polling

Entity states are fetched from HA via REST API polling every 5 seconds. The `useHaEntities` hook fetches all states and individual widget hooks (`useHaEntity`) find their entity from that shared list. After toggling a light, an immediate refetch is triggered for responsive feedback.

---

## Data Model

### Dashboard (JSON stored in `/data/dashboards/`)

```json
{
  "id": "default",
  "name": "My Dashboard",
  "createdAt": "2026-03-10T12:00:00Z",
  "updatedAt": "2026-03-11T08:30:00Z",
  "widgets": [
    {
      "id": "uuid-1234",
      "type": "light-toggle",
      "x": 100,
      "y": 50,
      "width": 140,
      "height": 140,
      "config": {
        "entityId": "light.kitchen_sink_light",
        "label": "Kitchen Sink"
      }
    }
  ]
}
```

### Widget Types

| Type | Component | Purpose | Default Size |
|---|---|---|---|
| `light-toggle` | `LightToggle.tsx` | Toggle a light entity on/off | 140x140 |
| `sensor-display` | `SensorDisplay.tsx` | Display a sensor's current value | 160x140 |

New widget types are added by:
1. Creating a component in `frontend/src/components/widgets/`
2. Registering it in `WidgetRegistry.ts`

---

## API Endpoints

### HA Proxy (`/api/ha/`)

| Method | Path | Description |
|---|---|---|
| GET | `/api/ha/states` | Get all HA entity states |
| GET | `/api/ha/states/:entity_id` | Get a single entity's state |
| POST | `/api/ha/services/:domain/:service` | Call an HA service (e.g., `light/toggle`) |

### Dashboard CRUD (`/api/dashboards/`)

| Method | Path | Description |
|---|---|---|
| GET | `/api/dashboards/` | List all dashboards |
| GET | `/api/dashboards/:id` | Load a dashboard (auto-creates "default") |
| POST | `/api/dashboards/:id` | Save/update a dashboard |
| DELETE | `/api/dashboards/:id` | Delete a dashboard |

---

## Development Setup

### Prerequisites
- Node.js 20+
- Python 3.9+
- A Home Assistant instance (for API access)

### Local Development

1. **Create `.env`** in the project root:
   ```
   HA_URL=https://your-ha-instance.com
   HA_TOKEN=your_long_lived_access_token
   ```

2. **Install dependencies:**
   ```bash
   cd frontend && npm install
   pip install -r backend/requirements.txt
   ```

3. **Start the backend** (reads `.env` for HA connection):
   ```bash
   cd backend
   source ../.env && export HA_URL HA_TOKEN
   flask run --port 8099
   ```

4. **Start the frontend dev server** (proxies API to Flask):
   ```bash
   cd frontend
   npm run dev
   ```

5. Open `http://localhost:5173/`

### Deploying to Home Assistant

1. Copy the entire `ha-dash/` directory to your HA add-ons folder (e.g., via Samba share or SSH to `/addons/ha-dash/`)
2. In HA: Settings → Add-ons → Reload → Install "HA Dash"
3. Start the add-on — it appears in the sidebar as "HA Dash"

No `.env` or tokens are needed in production — the add-on uses `SUPERVISOR_TOKEN` automatically.

---

## Phase 2 Roadmap (Planned)

- **Multi-dashboard support** — create/switch between multiple dashboards (gated by user tiers)
- **Responsive layouts** — explicit breakpoint-based layouts so dashboards adapt to different screen sizes
- **Additional widget types** — climate controls, media players, cameras, custom cards
- **Rich visual components** — advanced animations, custom themes, graphic libraries
- **User authentication & tiers** — feature gating based on user roles
- **WebSocket integration** — replace REST polling with HA WebSocket API for real-time state updates

---

## Known Issues & Considerations

- **Entity polling**: Each `useHaEntity` call creates its own polling loop fetching ALL states. This works for the POC but should be refactored into a single shared polling context or replaced with WebSocket subscriptions.
- **Edit mode blocks interaction**: Widget click handlers (like light toggle) are disabled in edit mode. Users must switch to View mode to interact with widgets.
- **Hardcoded dark theme**: The UI currently uses a fixed dark color scheme. Theming support is planned.
- **No undo/redo**: Widget placement changes are immediate. An undo stack would improve the editing experience.
