import { redis } from "../config/redis";
import { RoomActivity, TimerHistory } from "../types/activities";

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
    await redis.hSet(roomKey, {
      createdBy: userName,
      createdAt: Date.now(),
      lastActive: Date.now(),
      activeUsers: "1",
    });
  },

  // User presence management
  async userJoinRoom(roomId: string, userName: string) {
    const roomKey = `room:${roomId}`;
    const userSetKey = `room:${roomId}:users`;

    // Add user to room's user set
    await redis.sAdd(userSetKey, userName);

    // Update active users count and last active timestamp
    const userCount = await redis.sCard(userSetKey);
    await redis.hSet(roomKey, {
      activeUsers: String(userCount),
      lastActive: Date.now(),
    });

    // Remove expiry since users are present
    await redis.persist(roomKey);
    await redis.persist(userSetKey);
    await redis.persist(`room:${roomId}:activities`);
  },

  async userLeaveRoom(roomId: string, userName: string) {
    const roomKey = `room:${roomId}`;
    const userSetKey = `room:${roomId}:users`;

    // Remove user from room's user set
    await redis.sRem(userSetKey, userName);

    // Update active users count
    const userCount = await redis.sCard(userSetKey);
    await redis.hSet(roomKey, {
      activeUsers: String(userCount),
      lastActive: Date.now(),
    });

    // If no users left, set 10-minute expiry
    if (userCount === 0) {
      await redis.expire(roomKey, ROOM_INACTIVITY_EXPIRY);
      await redis.expire(userSetKey, ROOM_INACTIVITY_EXPIRY);
      await redis.expire(`room:${roomId}:activities`, ROOM_INACTIVITY_EXPIRY);
    }
  },

  async getRoomUsers(roomId: string): Promise<string[]> {
    const userSetKey = `room:${roomId}:users`;
    return await redis.sMembers(userSetKey);
  },

  async getRoomInfo(roomId: string) {
    const roomKey = `room:${roomId}`;
    return await redis.hGetAll(roomKey);
  },

  // User history
  async addHistory(history: TimerHistory) {
    const key = `user:${history.userName}:history`;
    const userHistory = await this.getHistory(history.userName);
    userHistory.push(history);
    await redis.set(key, JSON.stringify(userHistory));
    return history;
  },

  async getHistory(userName: string): Promise<TimerHistory[]> {
    const key = `user:${userName}:history`;
    const data = await redis.get(key);
    return data ? JSON.parse(data) : [];
  },
};

export default redisService;
