import { RoomActivity } from "../types/room";

type WebSocketMessage = {
  type: "activity" | "recent_activities" | "timer_update" | "test";
  payload: RoomActivity;
};

class WebSocketService {
  private static instance: WebSocketService;
  private socket: WebSocket | null = null;
  private subscribers: Map<string, Set<(data: any) => void>> = new Map();
  private shouldReconnect: boolean = true;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private currentRoomId: string | null = null;

  private constructor() {}

  static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }

  connect(roomId: string) {
    this.currentRoomId = roomId;

    if (
      this.socket?.readyState === WebSocket.OPEN &&
      this.currentRoomId === roomId
    ) {
      console.log("[WebSocket] Already connected to room:", roomId);
      return;
    }

    if (this.socket) {
      this.disconnect();
    }

    this.shouldReconnect = true;
    this.reconnectAttempts = 0;
    const WS_URL = "ws://localhost:3000";

    console.log("[WebSocket] Connecting to:", `${WS_URL}/rooms/${roomId}`);
    this.socket = new WebSocket(`${WS_URL}/rooms/${roomId}`);

    this.socket.onopen = () => {
      console.log("[WebSocket] Connected to WebSocket for room:", roomId);
      this.reconnectAttempts = 0;
    };

    this.socket.onmessage = (event) => {
      console.log("[WebSocket] Raw message received:", event.data);
      const message: WebSocketMessage = JSON.parse(event.data);
      console.log("[WebSocket] Parsed message:", message);
      this.notifySubscribers(message.type, message);
    };

    this.socket.onclose = () => {
      console.log("[WebSocket] Disconnected from WebSocket");

      if (
        this.shouldReconnect &&
        this.reconnectAttempts < this.maxReconnectAttempts
      ) {
        this.reconnectAttempts++;
        const delay = Math.min(
          1000 * Math.pow(2, this.reconnectAttempts),
          10000
        );
        console.log(
          `Reconnecting attempt ${this.reconnectAttempts} in ${delay}ms`
        );
        setTimeout(() => this.connect(roomId), delay);
      }
    };

    this.socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };
  }

  subscribe(type: string, callback: (data: any) => void) {
    console.log("[WebSocket] Subscribing to:", type);
    if (!this.subscribers.has(type)) {
      this.subscribers.set(type, new Set());
    }
    this.subscribers.get(type)?.add(callback);
    console.log("[WebSocket] Current subscribers:", this.subscribers);
  }

  unsubscribe(type: string, callback: (data: any) => void) {
    this.subscribers.get(type)?.delete(callback);
  }

  private notifySubscribers(type: string, data: any) {
    console.log(
      "[WebSocket] Notifying subscribers for type:",
      type,
      "with data:",
      data
    );
    this.subscribers.get(type)?.forEach((callback) => callback(data));
  }

  send(message: WebSocketMessage) {
    console.log("[WebSocket] Sending to server:", message);
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    }
  }

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

export const wsService = WebSocketService.getInstance();
