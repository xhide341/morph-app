import { redis } from "../config/redis";
import { RoomActivity, RoomInfo, RoomUser } from "../types/room";

const ROOM_INACTIVITY_EXPIRY = 10 * 60; // 10 minutes in seconds

const redisService = {
  // Room activities
  async addActivity(roomId: string, activity: RoomActivity) {
    const key = `room:${roomId}:activities`;
    const activities = await this.getActivities(roomId);
    activities.push(activity);

    // Store activities (no need for expiry here, it's handled by userLeaveRoom)
    await redis.set(key, JSON.stringify(activities));

    // Update room's last active timestamp
    await redis.hSet(`room:${roomId}`, "lastActive", Date.now());

    return activity;
  },

  async getActivities(roomId: string): Promise<RoomActivity[]> {
    const key = `room:${roomId}:activities`;
    const activities = await redis.get(key);
    return activities ? JSON.parse(activities) : [];
  },

  // Room management
  async getRoomInfo(roomId: string): Promise<RoomInfo | null> {
    const roomKey = `room:${roomId}`;
    const data = await redis.hGetAll(roomKey);
    if (!data) return null;

    return {
      createdBy: data.createdBy,
      createdAt: data.createdAt,
      lastActive: data.lastActive,
      activeUsers: Number(data.activeUsers),
    };
  },

  async createRoom(roomId: string, userName: string): Promise<RoomInfo | null> {
    const roomKey = `room:${roomId}`;
    const userHashKey = `room:${roomId}:users`;
    const timestamp = Date.now().toString();

    try {
      const result = await redis
        .multi()
        .hSet(roomKey, {
          createdBy: userName,
          createdAt: timestamp,
          lastActive: timestamp,
          activeUsers: "1",
        })
        .hSet(
          userHashKey,
          userName,
          JSON.stringify({
            userName,
            joinedAt: timestamp,
          })
        )
        .exec();

      if (!result) return null;

      return {
        createdBy: userName,
        createdAt: timestamp,
        lastActive: timestamp,
        activeUsers: 1,
      };
    } catch (error) {
      console.error(error);
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
        console.log("Room expired:", result);
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
    const userHashKey = `room:${roomId}:users`;
    try {
      const usersData = await redis.hGetAll(userHashKey);
      if (!usersData) return [];
      return Object.values(usersData).map((data) => JSON.parse(data));
    } catch (error) {
      console.error(error);
      return [];
    }
  },
};

export default redisService;
