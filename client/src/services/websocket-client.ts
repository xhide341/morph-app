import { RoomActivity } from "../../../server/src/types/room";

type WebSocketMessage = {
  type:
    | "activity"
    | "connection_status"
    | "recent_activities"
    | "timer_update"
    | "test";
  payload: RoomActivity | { status: string; roomId: string };
};

class WebSocketClient {
  private static instance: WebSocketClient;
  private socket: WebSocket | null = null;
  private subscribers: Map<string, Set<(data: any) => void>> = new Map();
  private shouldReconnect: boolean = true;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private currentRoomId: string | null = null;
  private connectionAttemptTimestamp: number = 0;

  private constructor() {}

  static getInstance(): WebSocketClient {
    if (!WebSocketClient.instance) {
      WebSocketClient.instance = new WebSocketClient();
    }
    return WebSocketClient.instance;
  }

  connect(roomId: string) {
    this.currentRoomId = roomId;
    console.log("[WebSocket Client] Starting connection to room:", roomId);

    // Add timestamp tracking to prevent rapid reconnections during development
    const now = Date.now();
    if (now - this.connectionAttemptTimestamp < 2000) {
      console.log("[WebSocket Client] Throttling connection attempts");
      return;
    }
    this.connectionAttemptTimestamp = now;

    if (this.socket?.readyState === WebSocket.CONNECTING) {
      console.log(
        "[WebSocket Client] Connection already in progress for:",
        roomId,
      );
      return;
    }

    if (
      this.socket?.readyState === WebSocket.OPEN &&
      this.currentRoomId === roomId
    ) {
      console.log("[WebSocket Client] Already connected to room:", roomId);
      return;
    }

    if (this.socket) {
      console.log("[WebSocket Client] Closing existing connection");
      this.disconnect();
    }

    this.shouldReconnect = true;
    this.reconnectAttempts = 0;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const host =
      window.location.hostname + (location.port ? `:${location.port}` : "");
    const url = `${protocol}//${host}/ws/${roomId}`;

    console.log("[WebSocket Client] Connecting to:", url);
    console.log(
      "[WebSocket Client] Browser location:",
      window.location.toString(),
    );
    console.log("[WebSocket Client] Protocol, Host:", { protocol, host });

    this.socket = new WebSocket(url);
    console.log(
      "[WebSocket Client] WebSocket object created, readyState:",
      this.socket.readyState,
    );

    this.socket.onopen = () => {
      console.log("[WebSocket Client] Connected to room:", roomId);
      this.send({
        type: "connection_status",
        payload: { status: "connected", roomId },
      });
      this.reconnectAttempts = 0;
    };

    this.socket.onmessage = (event) => {
      const message: WebSocketMessage = JSON.parse(event.data);
      console.log("[WebSocket Client] Received:", message);
      this.notifySubscribers(message.type, message);
    };

    this.socket.onclose = () => {
      console.log("[WebSocket Client] Disconnected");
      if (
        this.shouldReconnect &&
        this.reconnectAttempts < this.maxReconnectAttempts
      ) {
        this.reconnectAttempts++;
        const delay = Math.min(
          1000 * Math.pow(2, this.reconnectAttempts),
          10000,
        );
        console.log(
          `[WebSocket Client] Reconnecting attempt ${this.reconnectAttempts} in ${delay}ms`,
        );
        setTimeout(() => this.connect(roomId), delay);
      }
    };

    this.socket.onerror = (error) => {
      console.error("[WebSocket Client] WebSocket error:", error);
    };
  }

  subscribe(type: string, callback: (data: any) => void) {
    if (!this.subscribers.has(type)) {
      this.subscribers.set(type, new Set());
    }

    console.log("[WebSocket Client] Subscribing to:", type);
  }

  unsubscribe(type: string, callback: (data: any) => void) {
    this.subscribers.get(type)?.delete(callback);
  }

  private notifySubscribers(type: string, data: any) {
    console.log(
      "[WebSocket Client] Notifying subscribers for type:",
      type,
      "with data:",
      data,
    );
    this.subscribers.get(type)?.forEach((callback) => callback(data));
  }

  send(message: WebSocketMessage) {
    console.log("[WebSocket Client] Sending to server:", message);
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    }
  }

  // explicitly disconnect from websocket
  disconnect() {
    this.shouldReconnect = false;
    this.currentRoomId = null;
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.subscribers.clear();
  }

  getSocket() {
    return this.socket;
  }

  isConnected() {
    return this.socket?.readyState === WebSocket.OPEN;
  }

  isConnecting() {
    return this.socket?.readyState === WebSocket.CONNECTING;
  }
}

export const ws = WebSocketClient.getInstance();
