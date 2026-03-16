# Installing HA Dash as a Home Assistant Add-on

## Quick Install

### 1. Add the Repository
1. Open Home Assistant → **Settings** → **Add-ons** → **Add-on Store**
2. Click the **⋮** menu (top right) → **Repositories**
3. Add: `https://github.com/zacharyawalker/ha-dash`
4. Click **Add** → **Close**

### 2. Install the Add-on
1. Find **HA Dash** in the add-on store (refresh if needed)
2. Click **Install**
3. Wait for the build to complete (~2-5 minutes)

### 3. Start & Access
1. Click **Start**
2. Toggle **Show in sidebar** to ON
3. Click **Open Web UI** or find "HA Dash" in the sidebar

## Manual / Local Build

If you want to build and run locally for development:

```bash
# Clone the repo
git clone https://github.com/zacharyawalker/ha-dash.git
cd ha-dash

# Build frontend
cd frontend && npm ci && npm run build && cd ..

# Set environment
export HA_URL="http://your-ha-ip:8123"
export HA_TOKEN="your-long-lived-access-token"
export FRONTEND_DIR="$(pwd)/frontend/dist"
export DASHBOARDS_DIR="$(pwd)/data/dashboards"

# Run backend
cd backend && python3 -c "from app import app; app.run(host='0.0.0.0', port=8099)"
```

Then open `http://localhost:8099`

## Docker (Standalone)

```bash
docker build \
  --build-arg BUILD_FROM=python:3.12-alpine \
  -t ha-dash .

docker run -d \
  -p 8099:8099 \
  -e HA_URL=http://your-ha-ip:8123 \
  -e HA_TOKEN=your-long-lived-access-token \
  -v ha-dash-data:/data/dashboards \
  ha-dash
```

## IFrame Panel (Simplest)

Add to your HA `configuration.yaml`:

```yaml
panel_iframe:
  ha_dash:
    title: "HA Dash"
    icon: mdi:view-dashboard
    url: "http://YOUR_SERVER_IP:8099"
    require_admin: true
```

Restart HA and find "HA Dash" in the sidebar.

## Configuration

The add-on has minimal configuration:

| Option | Description | Default |
|--------|-------------|---------|
| `log_level` | Logging verbosity | `info` |

Dashboard data is stored in `/data/dashboards/` (persisted across restarts).

## Architecture

- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS v4
- **Backend**: Python Flask + WebSocket relay
- **HA Integration**: Supervisor API + WebSocket API proxy
- **Widgets**: 50+ widget types with free-form drag-and-drop
