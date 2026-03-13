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


@ha_proxy_bp.route("/history/<entity_id>", methods=["GET"])
def get_history(entity_id):
    """Get entity history from HA.
    Query params: hours (default 24)
    """
    hours = request.args.get("hours", "24")
    try:
        from datetime import datetime, timedelta, timezone

        end_time = datetime.now(timezone.utc)
        start_time = end_time - timedelta(hours=int(hours))
        params = {
            "filter_entity_id": entity_id,
            "minimal_response": "",
            "significant_changes_only": "",
            "no_attributes": "",
        }

        url = _api_url(f"/history/period/{start_time.isoformat()}")
        resp = requests.get(url, headers=_get_headers(), params=params, timeout=30)
        data = resp.json()
        # HA returns [[states]] — unwrap the outer array
        if data and isinstance(data, list) and len(data) > 0:
            return jsonify(data[0]), resp.status_code
        return jsonify([]), 200
    except requests.RequestException as e:
        return jsonify({"error": str(e)}), 502
