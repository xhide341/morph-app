import { Server } from "http";
import { Server as SocketIOServer } from "socket.io";

import { RoomActivity } from "../types/room";
import { redisService } from "./redis-service";

export class SocketIOService {
  private static instance: SocketIOService;
  private io: SocketIOServer;
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

  private async retryOperation<T>(
    operation: () => Promise<T>,
    maxAttempts: number = 3,
    initialDelay: number = 1000,
  ): Promise<T> {
    let lastError: Error | null = null;
    let delay = initialDelay;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        console.error(`[SocketIO] Attempt ${attempt} failed:`, error);

        if (attempt === maxAttempts) break;

        // exponential backoff
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 2;
      }
    }

    throw lastError;
  }

  private initialize() {
    this.io.on("connection", (socket) => {
      socket.on("join_room", async (data) => {
        const { roomId, userName } = data;
        console.log("[SocketIO] User joining room:", {
          roomId,
          userName,
          socketId: socket.id,
        });
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
          let storedActivity: RoomActivity | null = null;
          await this.retryOperation(async () => {
            const activityResult = await redisService.storeActivity(
              roomId,
              join,
            );
            if (!activityResult) {
              throw new Error("Failed to store activity in Redis");
            }
            storedActivity = activityResult;
            console.log("[SocketIO] Join activity stored:", {
              roomId,
              userName,
              activityId: storedActivity.id,
            });

            const joined = await redisService.joinRoom(roomId, userName);
            if (!joined) {
              storedActivity = null;
              throw new Error("Failed to join room in Redis");
            }
            console.log("[SocketIO] User joined room in Redis:", {
              roomId,
              userName,
              userCount: joined.userCount,
            });
          });

          if (storedActivity) {
            // broadcast to everyone including sender
            this.io.to(roomId).emit("activity", storedActivity);
            console.log("[SocketIO] Join activity broadcasted:", {
              roomId,
              userName,
            });
          }
        } catch (error) {
          console.error("[SocketIO] Error handling join after retries:", error);
          socket.emit("error", { message: "Failed to join room" });
        }
      });

      socket.on("activity", async (activity: RoomActivity) => {
        if (!activity || !activity.roomId) return;

        try {
          let storedActivity: RoomActivity | null = null;
          await this.retryOperation(async () => {
            const activityResult = await redisService.storeActivity(
              activity.roomId,
              activity,
            );
            if (!activityResult) {
              throw new Error("Failed to store activity in Redis");
            }
            storedActivity = activityResult;
          });

          if (storedActivity) {
            socket.broadcast
              .to(activity.roomId)
              .emit("activity", storedActivity);
          }
        } catch (error) {
          console.error(
            "[SocketIO] Error storing activity after retries:",
            error,
          );
          socket.emit("error", {
            message: "Failed to store activity",
          });
        }
      });

      socket.on("disconnect", async () => {
        const userInfo = this.activeUsers.get(socket.id);
        if (userInfo) {
          const { roomId, userName } = userInfo;
          console.log("[SocketIO] User disconnecting:", {
            roomId,
            userName,
            socketId: socket.id,
          });
          const leaveActivity: RoomActivity = {
            type: "leave",
            userName,
            roomId,
            id: crypto.randomUUID(),
            timeStamp: new Date().toISOString(),
          };

          try {
            let storedActivity: RoomActivity | null = null;
            console.log("[SocketIO] User leaving room:", {
              roomId,
              userName,
              socketId: socket.id,
            });
            await this.retryOperation(async () => {
              const activityResult = await redisService.storeActivity(
                roomId,
                leaveActivity,
              );
              if (!activityResult) {
                throw new Error("Failed to store activity in Redis");
              }
              storedActivity = activityResult;

              const left = await redisService.userLeaveRoom(roomId, userName);
              if (!left) {
                storedActivity = null;
                throw new Error("Failed to leave room in Redis");
              }
              console.log("[SocketIO] User left room in Redis:", {
                roomId,
                userName,
                userCount: left.userCount,
              });
            });

            if (storedActivity) {
              this.io.to(roomId).emit("activity", storedActivity);
              console.log("[SocketIO] Leave activity broadcasted:", {
                roomId,
                userName,
              });
            }
          } catch (error) {
            console.error(
              "[SocketIO] Error handling disconnect after retries:",
              error,
            );
          }

          this.activeUsers.delete(socket.id);
        }
      });
    });
  }
}
