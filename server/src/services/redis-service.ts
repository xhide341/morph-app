import { redis } from "../config/redis";
import { RoomActivity, RoomInfo, RoomUser } from "../types/room";

const ROOM_INACTIVITY_EXPIRY = 10 * 60; // 10 minutes in seconds

export const redisService = {
  // Room activities
  async storeActivity(roomId: string, activity: RoomActivity) {
    const key = `room:${roomId}:activities`;

    const result = await redis
      .multi()
      .rPush(key, JSON.stringify(activity))
      .lTrim(key, 0, 49)
      .exec();
    if (!result) return;

    // update room's last active timestamp
    await redis.hSet(`room:${roomId}`, "lastActive", Date.now());
    console.log("[Redis] Activity stored:", activity.type);

    return activity;
  },

  async getActivities(roomId: string): Promise<RoomActivity[]> {
    const key = `room:${roomId}:activities`;
    const activities = await redis.lRange(key, 0, -1);
    if (!activities) return [];
    return activities.map((activity) => JSON.parse(activity));
  },

  // ------------------------------------------------------------

  // Room management
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
      createdBy: null,
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
        createdBy: null,
        createdAt: timestamp,
        lastActive: timestamp,
        activeUsers: 0,
      };
    } catch (error) {
      console.error("[Redis] Error creating room:", error);
      return null;
    }
  },

  // User presence management
  async userJoinRoom(roomId: string, userName: string) {
    const roomKey = `room:${roomId}`;
    const userHashKey = `room:${roomId}:users`;

    try {
      const result = await redis
        .multi()
        .hSet(
          userHashKey,
          userName,
          JSON.stringify({ userName, joinedAt: Date.now() })
        )
        .hLen(userHashKey)
        .exec();

      if (!result) return null;

      const userCount = result[1];

      await redis.hSet(roomKey, {
        activeUsers: String(userCount),
        lastActive: Date.now(),
      });
      // remove expiry
      await redis.persist(roomKey);
      await redis.persist(userHashKey);
      await redis.persist(`room:${roomId}:activities`);

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

    try {
      const removed = await redis.hDel(userHashKey, userName);
      if (!removed) return null;

      // update active users count
      const userCount = await redis.hLen(userHashKey);
      await redis.hSet(roomKey, {
        activeUsers: userCount,
        lastActive: Date.now(),
      });

      // if no users, set 10-minute expiry
      if (userCount === 0) {
        const result = await redis
          .multi()
          .expire(roomKey, ROOM_INACTIVITY_EXPIRY)
          .expire(`room:${roomId}:activities`, ROOM_INACTIVITY_EXPIRY)
          .exec();
        console.log("[Redis] Room expired:", result);
      }

      return {
        userCount: Number(userCount),
        lastActive: String(Date.now()),
      };
    } catch (error) {
      console.error(error);
      return;
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
};
