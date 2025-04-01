import { io, Socket } from "socket.io-client";

export class SocketService {
  private static instance: SocketService;
  private socket: Socket | null = null;
  private listeners: Map<string, Set<Function>> = new Map();
  private currentRoom: string | null = null;
  private userName: string | null = null;

  private constructor() {}

  public static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  connect(roomId: string, userName?: string) {
    if (this.socket && this.currentRoom === roomId) {
      console.log("[SocketService] Already connected to room:", roomId);
      return;
    }

    this.currentRoom = roomId;
    this.userName = userName || null;

    if (this.socket) {
      console.log("[SocketService] Disconnecting from previous room");
      this.socket.disconnect();
    }

    console.log("[SocketService] Connecting to Socket.IO server");
    this.socket = io("/", {
      transports: ["websocket"],
      autoConnect: true,
    });

    this.socket.on("connect", () => {
      console.log("[SocketService] Connected to Socket.IO server");
      this.socket?.emit("join_room", { roomId, userName });
    });

    this.socket.on("activity", (data) => {
      console.log("[SocketService] Received activity:", data.type);
      const listeners = this.listeners.get("activity");
      listeners?.forEach((listener) => listener(data));
    });

    this.socket.on("disconnect", (reason) => {
      console.log("[SocketService] Disconnected:", reason);
    });

    this.socket.on("connect_error", (error) => {
      console.error("[SocketService] Connection error:", error);
    });
  }

  subscribe(event: string, callback: Function) {
    console.log("[SocketService] Subscribing to:", event);
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)?.add(callback);
    return () => this.unsubscribe(event, callback);
  }

  unsubscribe(event: string, callback: Function) {
    console.log("[SocketService] Unsubscribing from:", event);
    this.listeners.get(event)?.delete(callback);
  }

  emit(event: string, data: any) {
    console.log("[SocketService] Emitting event:", event, data);
    this.socket?.emit(event, data);
  }

  disconnect() {
    console.log("[SocketService] Disconnecting");
    this.socket?.disconnect();
    this.socket = null;
    this.currentRoom = null;
  }
}

// Export singleton instance
export const socketService = SocketService.getInstance();
