"""Blueprint that proxies requests to the Home Assistant API via Supervisor."""

import os
import requests
from flask import Blueprint, request, jsonify

ha_proxy_bp = Blueprint("ha_proxy", __name__)

# Inside an HA add-on, SUPERVISOR_TOKEN is injected automatically.
# For local dev, fall back to HA_TOKEN env var.
SUPERVISOR_TOKEN = os.environ.get("SUPERVISOR_TOKEN", "")
HA_TOKEN = os.environ.get("HA_TOKEN", "")
HA_URL = os.environ.get("HA_URL", "http://supervisor/core")


def _get_headers():
    token = SUPERVISOR_TOKEN or HA_TOKEN
    return {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    }


def _api_url(path):
    return f"{HA_URL}/api{path}"


@ha_proxy_bp.route("/states", methods=["GET"])
def get_states():
    """Get all entity states."""
    try:
        resp = requests.get(_api_url("/states"), headers=_get_headers(), timeout=10)
        return jsonify(resp.json()), resp.status_code
    except requests.RequestException as e:
        return jsonify({"error": str(e)}), 502


@ha_proxy_bp.route("/states/<entity_id>", methods=["GET"])
def get_state(entity_id):
    """Get a single entity's state."""
    try:
        resp = requests.get(
            _api_url(f"/states/{entity_id}"), headers=_get_headers(), timeout=10
        )
        return jsonify(resp.json()), resp.status_code
    except requests.RequestException as e:
        return jsonify({"error": str(e)}), 502


@ha_proxy_bp.route("/services/<domain>/<service>", methods=["POST"])
def call_service(domain, service):
    """Call a Home Assistant service."""
    try:
        resp = requests.post(
            _api_url(f"/services/{domain}/{service}"),
            headers=_get_headers(),
            json=request.get_json(silent=True) or {},
            timeout=10,
        )
        return jsonify(resp.json()), resp.status_code
    except requests.RequestException as e:
        return jsonify({"error": str(e)}), 502
