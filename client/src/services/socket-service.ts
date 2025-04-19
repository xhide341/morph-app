import { Socket, io } from "socket.io-client";

const WS_URL = "http://localhost:3000";

export class SocketService {
  private static instance: SocketService;
  private socket: Socket | null = null;
  private currentRoom: string | null = null;
  private currentUser: string | null = null;

  private constructor() {}

  public static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  connect(roomId: string, userName: string) {
    if (!this.socket) {
      console.log("[Socket] Creating new socket connection");
      this.socket = io(WS_URL, {
        query: { roomId, userName },
        autoConnect: false,
      });

      // Add connection event listeners
      this.socket.on("connect", () => {
        console.log("[Socket] Connected to server:", this.socket?.id);
        // Emit join after connection is established
        if (this.currentRoom && this.currentUser) {
          console.log("[Socket] Emitting join_room event after connection:", {
            roomId: this.currentRoom,
            userName: this.currentUser,
          });
          this.socket?.emit("join_room", {
            roomId: this.currentRoom,
            userName: this.currentUser,
          });
        }
      });
      this.currentRoom = roomId;
      this.currentUser = userName;
    } else if (this.currentRoom !== roomId || this.currentUser !== userName) {
      console.log("[Socket] Updating socket connection:", {
        oldRoom: this.currentRoom,
        newRoom: roomId,
        oldUser: this.currentUser,
        newUser: userName,
      });
      this.currentRoom = roomId;
      this.currentUser = userName;
      // Only emit join if already connected
      if (this.socket.connected) {
        console.log("[Socket] Emitting join_room event (already connected):", {
          roomId,
          userName,
        });
        this.socket.emit("join_room", { roomId, userName });
      }
    }

    console.log("[Socket] Connecting socket");
    this.socket.connect();
    return this.socket;
  }

  on(event: string, callback: (data: any) => void) {
    console.log("[Socket] Registering event listener:", event);
    this.socket?.on(event, callback);
  }

  off(event: string, callback: (data: any) => void) {
    console.log("[Socket] Removing event listener:", event);
    this.socket?.off(event, callback);
  }

  emit(event: string, data: any) {
    console.log("[Socket] Emitting event:", { event, data });
    this.socket?.emit(event, data);
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
    this.currentRoom = null;
    this.currentUser = null;
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const socketService = SocketService.getInstance();
