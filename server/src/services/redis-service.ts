import { redis } from "../config/redis";
import { RoomActivity, RoomUser } from "../types/room";

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
  async createRoom(roomId: string, userName: string) {
    const roomKey = `room:${roomId}`;
    return await redis.hSet(roomKey, {
      createdBy: userName,
      createdAt: Date.now().toString(),
      lastActive: Date.now().toString(),
      activeUsers: "1",
    });
  },

  // User presence management
  async userJoinRoom(roomId: string, userName: string) {
    const roomKey = `room:${roomId}`;
    const userHashKey = `room:${roomId}:users`;

    // Add to user HASH with joinedAt
    await redis.hSet(
      userHashKey,
      userName,
      JSON.stringify({
        userName,
        joinedAt: Date.now(),
      })
    );

    // Update room info HASH
    const userCount = await redis.hLen(userHashKey);
    await redis.hSet(roomKey, {
      activeUsers: String(userCount),
      lastActive: Date.now().toString(),
    });

    // Remove expiry since users are present
    await redis.persist(roomKey);
    await redis.persist(userHashKey);
    await redis.persist(`room:${roomId}:activities`);

    return {
      userCount,
      lastActive: Date.now(),
    };
  },

  async userLeaveRoom(roomId: string, userName: string) {
    const roomKey = `room:${roomId}`;
    const userHashKey = `room:${roomId}:users`;

    // Remove user from room's user set
    await redis.hDel(userHashKey, userName);

    // Update active users count
    const userCount = await redis.hLen(userHashKey);
    await redis.hSet(roomKey, {
      activeUsers: String(userCount),
      lastActive: Date.now().toString(),
    });

    // If no users left, set 10-minute expiry
    if (userCount === 0) {
      await redis.expire(roomKey, ROOM_INACTIVITY_EXPIRY);
      await redis.expire(userHashKey, ROOM_INACTIVITY_EXPIRY);
      await redis.expire(`room:${roomId}:activities`, ROOM_INACTIVITY_EXPIRY);
    }

    return {
      userCount,
      lastActive: Date.now().toString(),
    };
  },

  async getRoomUsers(roomId: string): Promise<RoomUser[]> {
    const userHashKey = `room:${roomId}:users`;
    const usersData = await redis.hGetAll(userHashKey);

    return Object.values(usersData).map((data) => JSON.parse(data));
  },

  async getRoomInfo(roomId: string) {
    const roomKey = `room:${roomId}`;
    const roomData = await redis.hGetAll(roomKey);
    return roomData;
  },
};

export default redisService;
