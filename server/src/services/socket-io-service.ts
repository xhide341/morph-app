import { Server as SocketIOServer } from "socket.io";
import { Server } from "http";

export class SocketIOService {
  private static instance: SocketIOService;
  private io: SocketIOServer;

  private constructor(server: Server) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true,
      },
    });

    this.initialize();
  }

  public static getInstance(server?: Server): SocketIOService {
    if (!SocketIOService.instance && server) {
      SocketIOService.instance = new SocketIOService(server);
    }
    return SocketIOService.instance;
  }

  private initialize() {
    this.io.on("connection", (socket) => {
      console.log("[SocketIO] New client connected:", socket.id);

      socket.on("join_room", (data) => {
        const { roomId, userName } = data;
        socket.join(roomId);
        console.log(
          `[SocketIO] User ${userName || "Anonymous"} joined room ${roomId}`
        );

        // Notify others in the room
        socket.to(roomId).emit("activity", {
          type: "join",
          userName,
          roomId,
          id: crypto.randomUUID(),
          timeStamp: new Date().toISOString(),
        });
      });

      socket.on("activity", (data) => {
        const { roomId } = data;
        console.log(`[SocketIO] Activity in room ${roomId}:`, data.type);

        // Broadcast to others in the room (excluding sender)
        socket.to(roomId).emit("activity", data);
      });

      socket.on("disconnect", () => {
        console.log("[SocketIO] Client disconnected:", socket.id);
      });
    });
  }
}
