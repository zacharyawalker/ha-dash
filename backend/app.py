"""HA Dash - Flask backend serving the React frontend and proxying HA API calls."""

import os
import logging
from flask import Flask, send_from_directory, request
from api.ha_proxy import ha_proxy_bp
from api.dashboards import dashboards_bp
from api.ws_relay import init_websocket
from api.licensing import licensing_bp, init_license_from_config

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(name)s] %(levelname)s: %(message)s",
)

FRONTEND_DIR = os.environ.get("FRONTEND_DIR", "/srv/frontend/dist")

app = Flask(__name__, static_folder=FRONTEND_DIR, static_url_path="")

app.register_blueprint(ha_proxy_bp, url_prefix="/api/ha")
app.register_blueprint(dashboards_bp, url_prefix="/api/dashboards")
app.register_blueprint(licensing_bp, url_prefix="/api/license")

# Initialize WebSocket relay
sock = init_websocket(app)


@app.before_request
def strip_ingress_prefix():
    """Strip the HA ingress path prefix from incoming requests."""
    ingress_path = request.headers.get("X-Ingress-Path", "")
    if ingress_path and request.path.startswith(ingress_path):
        request.environ["PATH_INFO"] = request.path[len(ingress_path):] or "/"


@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_frontend(path):
    """Serve the React SPA. Falls back to index.html for client-side routing."""
    if path and os.path.exists(os.path.join(FRONTEND_DIR, path)):
        return send_from_directory(FRONTEND_DIR, path)
    return send_from_directory(FRONTEND_DIR, "index.html")


# Initialize license on startup
init_license_from_config()

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8099))
    app.run(host="0.0.0.0", port=port, debug=True)
