/**
 * WebSocket connection manager for HA Dash.
 *
 * Connects to the backend WebSocket relay which proxies HA state changes.
 * Handles auto-reconnect with exponential backoff.
 */

import { useEntityStore } from '../store/entityStore';
import type { HaState } from './client';

/** Messages received from the backend WebSocket relay */
interface WsConnectionMessage {
  type: 'connection';
  connected: boolean;
}

interface WsStatesMessage {
  type: 'states';
  states: HaState[];
}

interface WsStateChangedMessage {
  type: 'state_changed';
  entity_id: string;
  new_state: HaState;
  old_state: HaState | null;
}

interface WsPongMessage {
  type: 'pong';
}

type WsMessage =
  | WsConnectionMessage
  | WsStatesMessage
  | WsStateChangedMessage
  | WsPongMessage;

class WebSocketManager {
  private ws: WebSocket | null = null;
  private reconnectDelay = 1000;
  private maxReconnectDelay = 30000;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private pingTimer: ReturnType<typeof setInterval> | null = null;
  private running = false;

  /** Derive WebSocket URL from current page location */
  private getWsUrl(): string {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    // Derive base path from script src (reliable through ingress)
    const scripts = document.querySelectorAll('script[src*="index-"]');
    for (const s of scripts) {
      const src = (s as HTMLScriptElement).src;
      const assetsIdx = src.indexOf('/assets/');
      if (assetsIdx > 0) {
        const basePath = new URL(src).pathname.substring(0, assetsIdx);
        return `${protocol}//${window.location.host}${basePath}/api/ws`;
      }
    }
    // Fallback
    const base = window.location.pathname.replace(/\/+$/, '');
    return `${protocol}//${window.location.host}${base}/api/ws`;
  }

  /** Start the WebSocket connection */
  connect(): void {
    if (this.running) return;
    this.running = true;
    this._connect();
  }

  /** Stop the WebSocket connection */
  disconnect(): void {
    this.running = false;
    this.clearTimers();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    useEntityStore.getState()._setConnectionStatus('disconnected');
  }

  private _connect(): void {
    if (!this.running) return;

    const url = this.getWsUrl();
    useEntityStore.getState()._setConnectionStatus('connecting');
    useEntityStore.getState()._setError(null);

    try {
      this.ws = new WebSocket(url);
    } catch (e) {
      useEntityStore.getState()._setConnectionStatus('error');
      useEntityStore.getState()._setError(`WebSocket connection failed: ${e}`);
      this.scheduleReconnect();
      return;
    }

    this.ws.onopen = () => {
      useEntityStore.getState()._setConnectionStatus('connected');
      this.reconnectDelay = 1000; // Reset backoff
      this.startPing();
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as WsMessage;
        this.handleMessage(data);
      } catch {
        // Ignore malformed messages
      }
    };

    this.ws.onerror = () => {
      useEntityStore.getState()._setConnectionStatus('error');
    };

    this.ws.onclose = () => {
      this.stopPing();
      useEntityStore.getState()._setConnectionStatus('disconnected');
      this.scheduleReconnect();
    };
  }

  private handleMessage(data: WsMessage): void {
    const store = useEntityStore.getState();

    switch (data.type) {
      case 'connection':
        store._setHaConnected(data.connected);
        break;

      case 'states':
        store._setEntities(data.states);
        break;

      case 'state_changed':
        store._updateEntity(data.entity_id, data.new_state);
        break;

      case 'pong':
        // Connection alive
        break;
    }
  }

  private scheduleReconnect(): void {
    if (!this.running) return;

    this.reconnectTimer = setTimeout(() => {
      this._connect();
    }, this.reconnectDelay);

    this.reconnectDelay = Math.min(
      this.reconnectDelay * 2,
      this.maxReconnectDelay
    );
  }

  private startPing(): void {
    this.stopPing();
    this.pingTimer = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping' }));
      }
    }, 30000);
  }

  private stopPing(): void {
    if (this.pingTimer) {
      clearInterval(this.pingTimer);
      this.pingTimer = null;
    }
  }

  private clearTimers(): void {
    this.stopPing();
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }
}

/** Singleton WebSocket manager */
export const wsManager = new WebSocketManager();
