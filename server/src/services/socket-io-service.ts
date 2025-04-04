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

      socket.on("join_room", async (data) => {
        const { roomId, userName } = data;

        if (!roomId || !userName) {
          console.error(
            "[SocketIO] Missing roomId or userName in join_room event"
          );
          return;
        }

        this.activeUsers.set(socket.id, { roomId, userName });
        socket.join(roomId);

        // // create join activity
        const joinActivity: RoomActivity = {
          type: "join",
          userName,
          roomId,
          id: crypto.randomUUID(),
          timeStamp: new Date().toISOString(),
        };

        // try {
        //   await redisService.storeActivity(roomId, joinActivity);
        // } catch (error) {
        //   console.error("[SocketIO] Error storing join activity:", error);
        // }
        // notify others in the room
        socket.to(roomId).emit("activity", joinActivity);
      });

      // _____________________________________

      socket.on("activity", async (activity: RoomActivity) => {
        if (!activity || !activity.roomId) {
          console.log("[SocketIO] Invalid activity data:", activity);
          return;
        }

        // log incoming activity type
        console.log("[SocketIO] Received activity type:", activity.type);

        // store ALL activity types
        try {
          // ensure timer-specific data is included when present
          const activityToStore: RoomActivity = {
            type: activity.type,
            userName: activity.userName,
            roomId: activity.roomId,
            id: activity.id,
            timeStamp: activity.timeStamp,
          };

          const storedActivity = await redisService.storeActivity(
            activity.roomId,
            activityToStore
          );
          console.log("[SocketIO] Stored activity:", storedActivity?.type);

          // broadcast to room
          this.io.to(activity.roomId).emit("activity", storedActivity);
        } catch (error) {
          console.error("[SocketIO] Error storing activity:", error);
        }
      });

      socket.on("disconnect", async () => {
        console.log("[SocketIO] Client disconnected:", socket.id);

        // automatically remove user from room when disconnected
        // websocket-level automatic disconnection
        // this triggers when users close the browser or tab (websocket disconnects)
        const userInfo = this.activeUsers.get(socket.id);
        if (userInfo) {
          const { roomId, userName } = userInfo;
          console.log(
            `[SocketIO] User ${userName} left room ${roomId} due to disconnect`
          );

          // add "leave" activity
          const leaveActivity: RoomActivity = {
            type: "leave",
            userName,
            roomId,
            id: crypto.randomUUID(),
            timeStamp: new Date().toISOString(),
          };

          // notify others in the room
          this.io.to(roomId).emit("activity", leaveActivity);

          // store activity in redis by calling "storeActivity"
          try {
            await redisService.storeActivity(roomId, leaveActivity);
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
