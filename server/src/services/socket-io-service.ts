import { Server as SocketIOServer } from "socket.io";
import { Server } from "http";
import { redisService } from "./redis-service";
import { RoomActivity } from "../types/room";

export class SocketIOService {
  private static instance: SocketIOService;
  private io: SocketIOServer;
  // track active users with their socket ids
  private activeUsers: Map<string, { roomId: string; userName: string }> =
    new Map();

  private constructor(server: Server) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin:
          process.env.NODE_ENV === "production"
            ? process.env.CORS_ORIGIN
            : "http://localhost:5173",
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
      socket.on("join_room", async (data) => {
        const { roomId, userName } = data;

        this.activeUsers.set(socket.id, { roomId, userName });
        socket.join(roomId);

        const join: RoomActivity = {
          type: "join",
          userName,
          roomId,
          id: crypto.randomUUID(),
          timeStamp: new Date().toISOString(),
        };

        try {
          // store join activity in redis
          const storedActivity = await redisService.storeActivity(roomId, join);

          if (storedActivity) {
            // broadcast to EVERYONE in the room INCLUDING the sender
            // for join events, we want everyone to know
            this.io.to(roomId).emit("activity", storedActivity);
          }

          await redisService.userJoinRoom(roomId, userName);
        } catch (error) {
          console.error("[SocketIO] error storing join activity:", error);
        }
      });

      socket.on("activity", async (activity: RoomActivity) => {
        if (!activity || !activity.roomId) {
          console.error("[SocketIO] invalid activity data:", activity);
          return;
        }

        try {
          // store all activities in redis
          const storedActivity = await redisService.storeActivity(
            activity.roomId,
            activity
          );

          if (!storedActivity) {
            console.error("[SocketIO] failed to store activity");
            return;
          }

          // broadcast to everyone EXCEPT the sender
          socket.to(activity.roomId).emit("activity", storedActivity);
        } catch (error) {
          console.error("[SocketIO] error storing activity:", error);
        }
      });

      socket.on("disconnect", async () => {
        // automatically remove user from room when disconnected
        // websocket-level automatic disconnection
        // this triggers when users close the browser or tab (websocket disconnects)
        const userInfo = this.activeUsers.get(socket.id);
        if (userInfo) {
          const { roomId, userName } = userInfo;
          // add "leave" activity
          const leaveActivity: RoomActivity = {
            type: "leave",
            userName,
            roomId,
            id: crypto.randomUUID(),
            timeStamp: new Date().toISOString(),
          };

          try {
            // store first, then emit the stored activity
            const storedActivity = await redisService.storeActivity(
              roomId,
              leaveActivity
            );
            if (storedActivity) {
              // emit the complete stored activity
              this.io.to(roomId).emit("activity", storedActivity);
            }
            await redisService.userLeaveRoom(roomId, userName);
          } catch (error) {
            console.error("[SocketIO] Error handling disconnect:", error);
          }

          this.activeUsers.delete(socket.id);
        }
      });
    });
  }
}
