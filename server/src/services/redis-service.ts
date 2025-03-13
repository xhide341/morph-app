import { redis } from "../config/redis";
import { RoomActivity, TimerHistory } from "../types/activities";

const redisService = {
  // Add activity to Redis
  async addActivity(sessionId: string, activity: RoomActivity) {
    const key = `room:${sessionId}:activities`;
    const activities = await this.getActivities(key);
    activities.push(activity);
    await redis.set(key, JSON.stringify(activities));
    return activity;
  },

  // Get activities from Redis
  async getActivities(sessionId: string): Promise<RoomActivity[]> {
    const key = `room:${sessionId}:activities`;
    const data = await redis.get(key);
    return data ? JSON.parse(data) : [];
  },

  // Add user history to Redis
  async addHistory(history: TimerHistory) {
    const key = `user:${history.userName}:history`;
    const userHistory = await this.getHistory(key);
    userHistory.push(history);
    await redis.set(key, JSON.stringify(userHistory));
    return history;
  },

  // Get user history from Redis
  async getHistory(userName: string): Promise<TimerHistory[]> {
    const key = `user:${userName}:history`;
    const data = await redis.get(key);
    return data ? JSON.parse(data) : [];
  },
};

export default redisService;
