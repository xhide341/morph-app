import { redis } from "../config/redis";
import { RoomActivity, RoomInfo, RoomUser } from "../types/room";

const ROOM_INACTIVITY_EXPIRY = 10 * 60;

export const redisService = {
  async storeActivity(roomId: string, activity: RoomActivity) {
    const key = `room:${roomId}:activities`;
    const roomKey = `room:${roomId}`;
    const timestamp = new Date(activity.timeStamp).getTime();
    const member = JSON.stringify(activity);
    const now = Date.now();

    const results = await redis
      .multi()
      .zAdd(key, { score: timestamp, value: member })
      .zRemRangeByRank(key, 0, -51)
      .hSet(roomKey, "lastActive", now)
      .exec();

    for (const result of results) {
      if (Array.isArray(result) && result[0] !== null) {
        console.error("[Redis] Failed to store activity:", activity.type);
        return null;
      }
    }

    console.log("[Redis] Activity stored:", activity.type);
    return activity;
  },

  async getActivities(roomId: string): Promise<RoomActivity[]> {
    const key = `room:${roomId}:activities`;
    const activities = await redis.zRange(key, 0, -1);
    if (!activities) return [];
    return activities.map((activity) => JSON.parse(activity));
  },

  // ------------------------------------------------------------

  async getRoomInfo(roomId: string): Promise<RoomInfo | null> {
    const roomKey = `room:${roomId}`;
    const data = await redis.hGetAll(roomKey);

    console.log("[Redis] Room data:", JSON.stringify(data, null, 2));
    // important: return null if empty object (no room found)
    // if (Object.keys(data).length === 0) {
    //   return null;
    // }

    return {
      roomId: roomId,
      createdAt: data.createdAt,
      lastActive: data.lastActive,
      activeUsers: Number(data.activeUsers),
    };
  },

  async createRoom(roomId: string): Promise<RoomInfo | null> {
    const roomKey = `room:${roomId}`;
    const timestamp = Date.now().toString();

    try {
      const exists = await redis.exists(roomKey);
      if (exists) {
        console.log("[Redis] Room already exists:", roomId);
        return null;
      }

      // Atomic operation to create room
      const result = await redis
        .multi()
        .hSet(roomKey, {
          roomId,
          createdAt: timestamp,
          lastActive: timestamp,
          activeUsers: "0",
        })
        .expire(roomKey, ROOM_INACTIVITY_EXPIRY)
        .exec();

      if (!result) {
        console.error("[Redis] Failed to create room:", roomId);
        return null;
      }

      console.log("[Redis] Room created:", roomId);
      return {
        roomId,
        createdAt: timestamp,
        lastActive: timestamp,
        activeUsers: 0,
      };
    } catch (error) {
      console.error("[Redis] Error creating room:", error);
      return null;
    }
  },

  async joinRoom(roomId: string, userName: string) {
    const roomKey = `room:${roomId}`;
    const userHashKey = `room:${roomId}:users`;
    const activitiesKey = `room:${roomId}:activities`;
    const urlKey = `room:${roomId}:url`;

    try {
      const joinResults = await redis
        .multi()
        .hSet(
          userHashKey,
          userName,
          JSON.stringify({ userName, joinedAt: Date.now() }),
        )
        .hLen(userHashKey)
        .exec();

      for (const result of joinResults) {
        if (Array.isArray(result) && result[0] !== null) {
          console.error("[Redis] Failed to add user:", userName);
          return null;
        }
      }

      const userCount = joinResults[1];

      const updateResult = await redis
        .multi()
        .hSet(roomKey, {
          activeUsers: String(userCount),
          lastActive: Date.now(),
        })
        .persist(roomKey)
        .persist(userHashKey)
        .persist(activitiesKey)
        .persist(urlKey)
        .exec();

      for (const result of updateResult) {
        if (Array.isArray(result) && result[0] !== null) {
          console.error("[Redis] Failed to update room:", roomId);
          return null;
        }
      }

      return {
        userCount: Number(userCount),
        lastActive: Date.now(),
      };
    } catch (error) {
      console.error(error);
      return;
    }
  },

  async userLeaveRoom(roomId: string, userName: string) {
    const roomKey = `room:${roomId}`;
    const userHashKey = `room:${roomId}:users`;
    const activitiesKey = `room:${roomId}:activities`;
    const urlKey = `room:${roomId}:url`;

    try {
      const removed = await redis.hDel(userHashKey, userName);
      if (!removed) {
        console.warn(
          `[Redis] userLeaveRoom: User ${userName} not found in ${userHashKey}.`,
        );
        return null;
      }

      const userCount = await redis.hLen(userHashKey);
      const now = Date.now(); // Get timestamp once

      if (userCount === 0) {
        console.log(
          `[Redis] Room ${roomId} empty. Updating metadata and setting expiry.`,
        );
        const results = await redis
          .multi()
          .expire(roomKey, ROOM_INACTIVITY_EXPIRY)
          .expire(activitiesKey, ROOM_INACTIVITY_EXPIRY)
          .expire(userHashKey, ROOM_INACTIVITY_EXPIRY)
          .expire(urlKey, ROOM_INACTIVITY_EXPIRY)
          .exec();

        for (const result of results) {
          if (Array.isArray(result) && result[0] !== null) {
            console.error("[Redis] Failed to update room:", roomId);
            return null;
          }
        }
        console.log(
          `[Redis] Expiry set successfully for empty room ${roomId}.`,
        );
      }

      const setResult = await redis.hSet(roomKey, {
        activeUsers: String(userCount),
        lastActive: now,
      });
      if (typeof setResult)
        return {
          userCount: Number(userCount),
          lastActive: now,
        };
    } catch (error) {
      console.error(
        `[Redis] Error during userLeaveRoom for ${roomId}, user ${userName}:`,
        error,
      );
      return null;
    }
  },

  async getRoomUsers(roomId: string): Promise<RoomUser[]> {
    console.log(`[Redis] Starting getRoomUsers for ${roomId}`);
    const userHashKey = `room:${roomId}:users`;
    try {
      console.log(`[Redis] Executing hGetAll for ${userHashKey}`);
      const usersData = await redis.hGetAll(userHashKey);
      if (!usersData) {
        console.error("[Redis] Room data is empty");
        return [];
      }

      const users = Object.values(usersData).map((data) => JSON.parse(data));
      console.log("[Redis] Fetched users:", users);
      return users;
    } catch (error) {
      console.error("[Redis] Error in getRoomUsers:", error);
      return [];
    }
  },

  async storeShareableUrl(roomId: string, url: string) {
    const urlKey = `room:${roomId}:url`;
    try {
      await redis.set(urlKey, url);
      // use the same expiry as room
      if ((await redis.ttl(`room:${roomId}`)) > 0) {
        await redis.expire(urlKey, ROOM_INACTIVITY_EXPIRY);
      }
      return url;
    } catch (error) {
      console.error("[Redis] Error storing URL:", error);
      return null;
    }
  },

  async getShareableUrl(roomId: string) {
    const urlKey = `room:${roomId}:url`;
    try {
      return await redis.get(urlKey);
    } catch (error) {
      console.error("[Redis] Error getting URL:", error);
      return null;
    }
  },

  async cleanupExpiredRooms() {
    try {
      const keys = await redis.keys("room:*");
      console.log(`[Redis] Found ${keys.length} rooms to check`);

      for (const key of keys) {
        const ttl = await redis.ttl(key);
        const isMainRoom = !key.includes(":");
        if (ttl === -1 && isMainRoom) {
          const roomId = key.split(":")[1];
          await redis.del([`room:${roomId}*`]);
        }
      }
    } catch (error) {
      console.error("[Redis] Error during cleanup:", error);
    }
  },
};
