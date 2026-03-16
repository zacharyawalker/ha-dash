"""
Licensing system for HA Dash Pro.

Free tier: core widgets, 1 dashboard, 3 pages per dashboard
Pro tier:  all widgets, unlimited dashboards/pages, premium features

License keys are validated against a remote licensing API.
Results are cached locally for 72 hours for offline resilience.
"""

import os
import json
import time
import hashlib
import logging
import requests
from flask import Blueprint, jsonify, request
from functools import wraps

licensing_bp = Blueprint("licensing", __name__)
logger = logging.getLogger("licensing")

# Licensing API endpoint (configurable)
LICENSE_API_URL = os.environ.get("LICENSE_API_URL", "https://license.hadash.dev/api/v1")

# Cache file for offline validation
CACHE_FILE = "/data/license_cache.json"
CACHE_TTL = 72 * 3600  # 72 hours

# ─── Tier Definitions ──────────────────────────────────────────────

FREE_WIDGETS = {
    "light-toggle", "switch-toggle", "dimmer-slider", "sensor-display",
    "binary-sensor", "climate-card", "scene-button", "weather-forecast",
    "clock-widget", "section-header", "separator-line", "markdown-block",
    "gauge-widget", "input-select", "automation-toggle", "entity-status",
    "glance-card", "progress-bar", "date-time",
}

FREE_LIMITS = {
    "max_dashboards": 1,
    "max_pages_per_dashboard": 3,
    "max_widgets_per_page": 20,
    "templates_enabled": False,
    "quick_search": False,
    "auto_arrange": False,
    "custom_themes": False,
    "import_export": False,
    "widget_palette": False,
}

PRO_LIMITS = {
    "max_dashboards": 999,
    "max_pages_per_dashboard": 999,
    "max_widgets_per_page": 999,
    "templates_enabled": True,
    "quick_search": True,
    "auto_arrange": True,
    "custom_themes": True,
    "import_export": True,
    "widget_palette": True,
}


# ─── License State ─────────────────────────────────────────────────

class LicenseState:
    """Singleton holding the current license state."""
    
    def __init__(self):
        self.tier = "free"  # "free" or "pro"
        self.license_key = ""
        self.valid = False
        self.email = ""
        self.expires_at = 0
        self.last_validated = 0
        self.error = ""
        self._load_cache()
    
    def _cache_path(self):
        return CACHE_FILE
    
    def _load_cache(self):
        """Load cached license validation from disk."""
        try:
            if os.path.exists(self._cache_path()):
                with open(self._cache_path(), "r") as f:
                    data = json.load(f)
                    self.tier = data.get("tier", "free")
                    self.license_key = data.get("license_key", "")
                    self.valid = data.get("valid", False)
                    self.email = data.get("email", "")
                    self.expires_at = data.get("expires_at", 0)
                    self.last_validated = data.get("last_validated", 0)
                    
                    # Check if cache is still fresh
                    if time.time() - self.last_validated > CACHE_TTL:
                        logger.info("License cache expired, will re-validate")
                        self.valid = False
                    elif self.valid:
                        logger.info(f"Loaded cached license: tier={self.tier}, email={self.email}")
        except Exception as e:
            logger.warning(f"Failed to load license cache: {e}")
    
    def _save_cache(self):
        """Persist license state to disk."""
        try:
            os.makedirs(os.path.dirname(self._cache_path()), exist_ok=True)
            with open(self._cache_path(), "w") as f:
                json.dump({
                    "tier": self.tier,
                    "license_key": self.license_key,
                    "valid": self.valid,
                    "email": self.email,
                    "expires_at": self.expires_at,
                    "last_validated": self.last_validated,
                }, f)
        except Exception as e:
            logger.warning(f"Failed to save license cache: {e}")
    
    def validate(self, key: str) -> dict:
        """Validate a license key against the licensing API."""
        self.license_key = key
        self.error = ""
        
        if not key or not key.strip():
            self.tier = "free"
            self.valid = False
            self._save_cache()
            return self.to_dict()
        
        # Generate a machine fingerprint (HA instance ID or hostname)
        fingerprint = hashlib.sha256(
            (os.environ.get("HOSTNAME", "unknown") + key).encode()
        ).hexdigest()[:16]
        
        try:
            resp = requests.post(
                f"{LICENSE_API_URL}/validate",
                json={
                    "license_key": key.strip(),
                    "product": "ha-dash",
                    "fingerprint": fingerprint,
                },
                timeout=10,
            )
            
            if resp.status_code == 200:
                data = resp.json()
                self.valid = data.get("valid", False)
                self.tier = "pro" if self.valid else "free"
                self.email = data.get("email", "")
                self.expires_at = data.get("expires_at", 0)
                self.last_validated = time.time()
                self.error = "" if self.valid else data.get("error", "Invalid license")
            else:
                # API error — fall back to cache if available
                if self.last_validated > 0 and self.valid:
                    logger.warning(f"License API returned {resp.status_code}, using cache")
                    self.error = "API unavailable, using cached validation"
                else:
                    self.valid = False
                    self.tier = "free"
                    self.error = f"License API error: {resp.status_code}"
                    
        except requests.RequestException as e:
            # Network error — fall back to cache
            if self.last_validated > 0 and self.valid:
                logger.warning(f"License API unreachable, using cache: {e}")
                self.error = "API unreachable, using cached validation"
            else:
                self.valid = False
                self.tier = "free"
                self.error = f"Cannot reach licensing server: {e}"
        
        self._save_cache()
        return self.to_dict()
    
    def to_dict(self) -> dict:
        return {
            "tier": self.tier,
            "valid": self.valid,
            "email": self.email,
            "expires_at": self.expires_at,
            "error": self.error,
        }
    
    def get_limits(self) -> dict:
        return PRO_LIMITS if self.tier == "pro" else FREE_LIMITS
    
    def get_allowed_widgets(self) -> set:
        if self.tier == "pro":
            return set()  # empty = all allowed
        return FREE_WIDGETS
    
    def is_pro(self) -> bool:
        return self.tier == "pro"


# Global license state
license_state = LicenseState()


# ─── API Routes ────────────────────────────────────────────────────

@licensing_bp.route("/status", methods=["GET"])
def get_license_status():
    """Get current license status and feature limits."""
    return jsonify({
        **license_state.to_dict(),
        "limits": license_state.get_limits(),
        "free_widgets": sorted(list(FREE_WIDGETS)) if not license_state.is_pro() else [],
    })


@licensing_bp.route("/activate", methods=["POST"])
def activate_license():
    """Activate a license key."""
    data = request.get_json(silent=True) or {}
    key = data.get("license_key", "")
    
    if not key:
        return jsonify({"error": "license_key is required"}), 400
    
    result = license_state.validate(key)
    return jsonify(result)


@licensing_bp.route("/deactivate", methods=["POST"])
def deactivate_license():
    """Deactivate current license (revert to free)."""
    license_state.tier = "free"
    license_state.valid = False
    license_state.license_key = ""
    license_state.email = ""
    license_state._save_cache()
    return jsonify(license_state.to_dict())


# ─── Middleware Helper ──────────────────────────────────────────────

def init_license_from_config():
    """Called at startup to validate license from add-on config."""
    key = os.environ.get("LICENSE_KEY", "")
    if key:
        logger.info("Found license key in config, validating...")
        license_state.validate(key)
    else:
        logger.info("No license key configured — running in free tier")
