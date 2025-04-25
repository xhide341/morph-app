import { Socket, io } from "socket.io-client";

const WS_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

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
      this.socket = io(WS_URL, {
        query: { roomId, userName },
        autoConnect: false,
      });

      this.socket.on("connect", () => {
        if (this.currentRoom && this.currentUser) {
          this.socket?.emit("join_room", {
            roomId: this.currentRoom,
            userName: this.currentUser,
          });
        }
      });
      this.currentRoom = roomId;
      this.currentUser = userName;
    } else if (this.currentRoom !== roomId || this.currentUser !== userName) {
      this.currentRoom = roomId;
      this.currentUser = userName;
      // Only emit join if already connected
      if (this.socket.connected) {
        this.socket.emit("join_room", { roomId, userName });
      }
    }

    this.socket.connect();
    return this.socket;
  }

  on(event: string, callback: (data: any) => void) {
    this.socket?.on(event, callback);
  }

  off(event: string, callback: (data: any) => void) {
    this.socket?.off(event, callback);
  }

  emit(event: string, data: any) {
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
