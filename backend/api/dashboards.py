"""Blueprint for dashboard CRUD operations."""

import os
import json
import uuid
from datetime import datetime, timezone
from flask import Blueprint, request, jsonify

dashboards_bp = Blueprint("dashboards", __name__)

# /data/ is the HA add-on persistent storage directory.
# For local dev, fall back to a local directory.
DATA_DIR = os.environ.get("DASHBOARDS_DIR", "/data/dashboards")


def _ensure_dir():
    os.makedirs(DATA_DIR, exist_ok=True)


def _dashboard_path(dashboard_id):
    # Sanitize ID to prevent path traversal
    safe_id = "".join(c for c in dashboard_id if c.isalnum() or c in "-_")
    return os.path.join(DATA_DIR, f"{safe_id}.json")


def _default_dashboard():
    return {
        "id": "default",
        "name": "My Dashboard",
        "createdAt": datetime.now(timezone.utc).isoformat(),
        "updatedAt": datetime.now(timezone.utc).isoformat(),
        "widgets": [],
    }


@dashboards_bp.route("/", methods=["GET"])
def list_dashboards():
    """List all saved dashboards."""
    _ensure_dir()
    dashboards = []
    for filename in os.listdir(DATA_DIR):
        if filename.endswith(".json"):
            filepath = os.path.join(DATA_DIR, filename)
            with open(filepath, "r") as f:
                data = json.load(f)
                dashboards.append(
                    {"id": data["id"], "name": data.get("name", data["id"])}
                )
    return jsonify(dashboards)


@dashboards_bp.route("/<dashboard_id>", methods=["GET"])
def get_dashboard(dashboard_id):
    """Load a dashboard by ID."""
    _ensure_dir()
    filepath = _dashboard_path(dashboard_id)

    if not os.path.exists(filepath):
        if dashboard_id == "default":
            # Auto-create default dashboard
            dashboard = _default_dashboard()
            with open(filepath, "w") as f:
                json.dump(dashboard, f, indent=2)
            return jsonify(dashboard)
        return jsonify({"error": "Dashboard not found"}), 404

    with open(filepath, "r") as f:
        return jsonify(json.load(f))


@dashboards_bp.route("/<dashboard_id>", methods=["POST"])
def save_dashboard(dashboard_id):
    """Save or update a dashboard."""
    _ensure_dir()
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    data["id"] = dashboard_id
    data["updatedAt"] = datetime.now(timezone.utc).isoformat()
    if "createdAt" not in data:
        data["createdAt"] = data["updatedAt"]

    filepath = _dashboard_path(dashboard_id)
    with open(filepath, "w") as f:
        json.dump(data, f, indent=2)

    return jsonify(data)


@dashboards_bp.route("/<dashboard_id>", methods=["DELETE"])
def delete_dashboard(dashboard_id):
    """Delete a dashboard."""
    filepath = _dashboard_path(dashboard_id)
    if os.path.exists(filepath):
        os.remove(filepath)
        return jsonify({"status": "deleted"})
    return jsonify({"error": "Dashboard not found"}), 404
