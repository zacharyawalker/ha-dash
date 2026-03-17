"""WebSocket relay: connects to HA WebSocket API, relays state changes to frontend clients."""

import json
import logging
import os
import threading
import time
from typing import Optional

import websocket as ws_client
from flask import Flask
from flask_sock import Sock

logger = logging.getLogger(__name__)

# HA WebSocket URL
# Inside add-on: ws://supervisor/core/websocket
# Local dev: derived from HA_URL env var
SUPERVISOR_TOKEN = os.environ.get("SUPERVISOR_TOKEN", "")
HA_TOKEN = os.environ.get("HA_TOKEN", "")
HA_URL = os.environ.get("HA_URL", "http://supervisor/core")


def _get_ws_url() -> str:
    """Derive the HA WebSocket URL from HA_URL."""
    url = HA_URL.rstrip("/")
    # Inside add-on: http://supervisor/core → ws://supervisor/core/websocket
    if "supervisor" in url:
        ws_url = url.replace("http://", "ws://").replace("https://", "wss://")
        return ws_url + "/websocket"
    # External HA: use /api/websocket
    if url.startswith("https://"):
        return url.replace("https://", "wss://") + "/api/websocket"
    elif url.startswith("http://"):
        return url.replace("http://", "ws://") + "/api/websocket"
    return "ws://supervisor/core/websocket"


def _get_token() -> str:
    return SUPERVISOR_TOKEN or HA_TOKEN


class HAWebSocketRelay:
    """Manages a single connection to HA WebSocket API and relays events to frontend clients."""

    def __init__(self) -> None:
        self._clients: list = []
        self._clients_lock = threading.Lock()
        self._ha_ws: Optional[ws_client.WebSocketApp] = None
        self._ha_thread: Optional[threading.Thread] = None
        self._states: dict[str, dict] = {}
        self._states_lock = threading.Lock()
        self._connected = False
        self._msg_id = 0
        self._subscribe_id: Optional[int] = None
        self._reconnect_delay = 1.0
        self._max_reconnect_delay = 30.0
        self._running = True

    @property
    def connected(self) -> bool:
        return self._connected

    def _next_id(self) -> int:
        self._msg_id += 1
        return self._msg_id

    def get_all_states(self) -> dict[str, dict]:
        """Return a copy of all cached entity states."""
        with self._states_lock:
            return dict(self._states)

    def start(self) -> None:
        """Start the HA WebSocket connection in a background thread."""
        self._running = True
        self._ha_thread = threading.Thread(target=self._connect_loop, daemon=True)
        self._ha_thread.start()
        logger.info("HA WebSocket relay started")

    def stop(self) -> None:
        """Stop the relay."""
        self._running = False
        if self._ha_ws:
            self._ha_ws.close()

    def _connect_loop(self) -> None:
        """Reconnect loop with exponential backoff."""
        while self._running:
            try:
                self._connect()
            except Exception as e:
                logger.error("HA WebSocket connection error: %s", e)

            if not self._running:
                break

            logger.info(
                "Reconnecting to HA WebSocket in %.1fs...", self._reconnect_delay
            )
            time.sleep(self._reconnect_delay)
            self._reconnect_delay = min(
                self._reconnect_delay * 2, self._max_reconnect_delay
            )

    def _connect(self) -> None:
        """Connect to HA WebSocket API."""
        ws_url = _get_ws_url()
        logger.info("Connecting to HA WebSocket: %s", ws_url)

        self._ha_ws = ws_client.WebSocketApp(
            ws_url,
            on_open=self._on_ha_open,
            on_message=self._on_ha_message,
            on_error=self._on_ha_error,
            on_close=self._on_ha_close,
        )
        self._ha_ws.run_forever(ping_interval=30, ping_timeout=10)

    def _on_ha_open(self, ws: ws_client.WebSocketApp) -> None:
        logger.info("HA WebSocket connection opened, waiting for auth_required...")

    def _on_ha_message(self, ws: ws_client.WebSocketApp, message: str) -> None:
        try:
            data = json.loads(message)
        except json.JSONDecodeError:
            logger.warning("Invalid JSON from HA WebSocket: %s", message[:200])
            return

        msg_type = data.get("type")

        if msg_type == "auth_required":
            # Send authentication
            token = _get_token()
            ws.send(json.dumps({"type": "auth", "access_token": token}))

        elif msg_type == "auth_ok":
            logger.info("HA WebSocket authenticated successfully")
            self._connected = True
            self._reconnect_delay = 1.0  # Reset backoff on success

            # Fetch all current states
            fetch_id = self._next_id()
            ws.send(json.dumps({"id": fetch_id, "type": "get_states"}))

            # Subscribe to state_changed events
            self._subscribe_id = self._next_id()
            ws.send(
                json.dumps(
                    {
                        "id": self._subscribe_id,
                        "type": "subscribe_events",
                        "event_type": "state_changed",
                    }
                )
            )

            # Notify clients of connection
            self._broadcast({"type": "connection", "connected": True})

        elif msg_type == "auth_invalid":
            logger.error("HA WebSocket auth failed: %s", data.get("message"))
            self._connected = False
            ws.close()

        elif msg_type == "result":
            # Handle get_states response
            if data.get("success") and isinstance(data.get("result"), list):
                with self._states_lock:
                    for state in data["result"]:
                        entity_id = state.get("entity_id")
                        if entity_id:
                            self._states[entity_id] = state
                logger.info(
                    "Loaded %d entity states from HA", len(data["result"])
                )
                # Send full state dump to all clients
                self._broadcast(
                    {
                        "type": "states",
                        "states": data["result"],
                    }
                )

        elif msg_type == "event":
            event = data.get("event", {})
            if event.get("event_type") == "state_changed":
                event_data = event.get("data", {})
                new_state = event_data.get("new_state")
                if new_state:
                    entity_id = new_state.get("entity_id")
                    if entity_id:
                        with self._states_lock:
                            self._states[entity_id] = new_state
                        # Relay state change to all frontend clients
                        self._broadcast(
                            {
                                "type": "state_changed",
                                "entity_id": entity_id,
                                "new_state": new_state,
                                "old_state": event_data.get("old_state"),
                            }
                        )

    def _on_ha_error(self, ws: ws_client.WebSocketApp, error: Exception) -> None:
        logger.error("HA WebSocket error: %s", error)

    def _on_ha_close(
        self,
        ws: ws_client.WebSocketApp,
        close_status_code: Optional[int],
        close_msg: Optional[str],
    ) -> None:
        logger.info(
            "HA WebSocket closed (code=%s, msg=%s)", close_status_code, close_msg
        )
        self._connected = False
        self._broadcast({"type": "connection", "connected": False})

    def add_client(self, ws) -> None:
        """Register a frontend WebSocket client."""
        with self._clients_lock:
            self._clients.append(ws)
        logger.info("Frontend client connected (total: %d)", len(self._clients))

        # Send current connection status
        try:
            ws.send(json.dumps({"type": "connection", "connected": self._connected}))
        except Exception:
            pass

        # Send all cached states to the new client
        with self._states_lock:
            states = list(self._states.values())
        if states:
            try:
                ws.send(json.dumps({"type": "states", "states": states}))
            except Exception:
                pass

    def remove_client(self, ws) -> None:
        """Unregister a frontend WebSocket client."""
        with self._clients_lock:
            if ws in self._clients:
                self._clients.remove(ws)
        logger.info("Frontend client disconnected (total: %d)", len(self._clients))

    def _broadcast(self, message: dict) -> None:
        """Send a message to all connected frontend clients."""
        payload = json.dumps(message)
        with self._clients_lock:
            dead_clients = []
            for client in self._clients:
                try:
                    client.send(payload)
                except Exception:
                    dead_clients.append(client)
            for client in dead_clients:
                self._clients.remove(client)


# Singleton relay instance
relay = HAWebSocketRelay()


def init_websocket(app: Flask) -> Sock:
    """Initialize WebSocket support and start the HA relay."""
    sock = Sock(app)

    @sock.route("/api/ws")
    def ws_handler(ws):
        """Handle frontend WebSocket connections."""
        relay.add_client(ws)
        try:
            while True:
                # Keep the connection alive — read messages from client
                message = ws.receive(timeout=60)
                if message is None:
                    break
                # Handle client messages (future: selective subscriptions)
                try:
                    data = json.loads(message)
                    if data.get("type") == "ping":
                        ws.send(json.dumps({"type": "pong"}))
                    elif data.get("type") == "get_states":
                        states = relay.get_all_states()
                        ws.send(
                            json.dumps(
                                {"type": "states", "states": list(states.values())}
                            )
                        )
                except json.JSONDecodeError:
                    pass
        except Exception as e:
            logger.debug("Frontend WebSocket handler ended: %s", e)
        finally:
            relay.remove_client(ws)

    @app.route("/api/ws/status")
    def ws_status():
        """Health check for WebSocket relay."""
        from flask import jsonify

        return jsonify(
            {
                "connected": relay.connected,
                "entity_count": len(relay.get_all_states()),
                "client_count": len(relay._clients),
            }
        )

    # Start the HA WebSocket relay
    relay.start()

    return sock
