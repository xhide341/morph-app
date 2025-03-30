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

  private constructor() {}

  static getInstance(): WebSocketClient {
    if (!WebSocketClient.instance) {
      WebSocketClient.instance = new WebSocketClient();
    }
    return WebSocketClient.instance;
  }

  connect(roomId: string) {
    this.currentRoomId = roomId;

    if (this.socket?.readyState === WebSocket.CONNECTING) {
      console.log("[WebSocket] Connection in progress:", roomId);
      return;
    }

    if (
      this.socket?.readyState === WebSocket.OPEN &&
      this.currentRoomId === roomId
    ) {
      console.log("[WebSocket] Already connected:", roomId);
      return;
    }

    if (this.socket) {
      this.disconnect();
    }

    this.shouldReconnect = true;
    this.reconnectAttempts = 0;
    const url = `/room/${roomId}`;

    console.log("[WebSocket] Connecting to:", url);
    this.socket = new WebSocket(url);

    this.socket.onopen = () => {
      console.log("[WebSocket] Connected to room:", roomId);
      this.send({
        type: "connection_status",
        payload: { status: "connected", roomId },
      });
      this.reconnectAttempts = 0;
    };

    this.socket.onmessage = (event) => {
      const message: WebSocketMessage = JSON.parse(event.data);
      console.log("[WebSocket] Received:", message);
      this.notifySubscribers(message.type, message);
    };

    this.socket.onclose = () => {
      console.log("[WebSocket] Disconnected");
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
          `[WebSocket] Reconnecting attempt ${this.reconnectAttempts} in ${delay}ms`,
        );
        setTimeout(() => this.connect(roomId), delay);
      }
    };

    this.socket.onerror = (error) => {
      console.error("[WebSocket] WebSocket error:", error);
    };
  }

  subscribe(type: string, callback: (data: any) => void) {
    if (!this.subscribers.has(type)) {
      this.subscribers.set(type, new Set());
    }

    const typeSubscribers = this.subscribers.get(type)!;
    const callbacksAsStrings = Array.from(typeSubscribers).map((fn) =>
      fn.toString(),
    );

    if (!callbacksAsStrings.includes(callback.toString())) {
      typeSubscribers.add(callback);
      console.log("[WebSocket] Subscribing to:", type);
      console.log("[WebSocket] Current subscribers:", this.subscribers);
    } else {
      console.log(
        "[WebSocket] Duplicate subscription detected, ignoring:",
        type,
      );
    }
  }

  unsubscribe(type: string, callback: (data: any) => void) {
    this.subscribers.get(type)?.delete(callback);
  }

  private notifySubscribers(type: string, data: any) {
    console.log(
      "[WebSocket] Notifying subscribers for type:",
      type,
      "with data:",
      data,
    );
    this.subscribers.get(type)?.forEach((callback) => callback(data));
  }

  send(message: WebSocketMessage) {
    console.log("[WebSocket] Sending to server:", message);
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
}

export const ws = WebSocketClient.getInstance();
