import { RoomActivity } from "../types/activity";

type WebSocketMessage = {
  type: "activity" | "recent_activities" | "timer_update" | "test";
  payload: RoomActivity;
};

class WebSocketService {
  private static instance: WebSocketService;
  private socket: WebSocket | null = null;
  private subscribers: Map<string, Set<(data: any) => void>> = new Map();

  private constructor() {}

  static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }

  connect(roomId: string) {
    if (this.socket) return;

    const WS_URL = "ws://localhost:3000";

    console.log("Connecting to:", `${WS_URL}/rooms/${roomId}`);
    this.socket = new WebSocket(`${WS_URL}/rooms/${roomId}`);

    this.socket.onopen = () => {
      console.log("Connected to WebSocket");
    };

    this.socket.onmessage = (event) => {
      console.log("Raw message received:", event.data);
      const message: WebSocketMessage = JSON.parse(event.data);
      console.log("Parsed message:", message);
      this.notifySubscribers(message.type, message);
    };

    this.socket.onclose = () => {
      console.log("Disconnected from WebSocket");
      setTimeout(() => this.connect(roomId), 1000);
    };

    this.socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };
  }

  subscribe(type: string, callback: (data: any) => void) {
    console.log("Subscribing to:", type);
    if (!this.subscribers.has(type)) {
      this.subscribers.set(type, new Set());
    }
    this.subscribers.get(type)?.add(callback);
    console.log("Current subscribers:", this.subscribers);
  }

  unsubscribe(type: string, callback: (data: any) => void) {
    this.subscribers.get(type)?.delete(callback);
  }

  private notifySubscribers(type: string, data: any) {
    console.log("Notifying subscribers for type:", type, "with data:", data);
    this.subscribers.get(type)?.forEach((callback) => callback(data));
  }

  send(message: WebSocketMessage) {
    console.log("Sending to server:", message);
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    }
  }

  disconnect() {
    this.socket?.close();
    this.socket = null;
  }
}

export const wsService = WebSocketService.getInstance();
