import { Router } from "express";
import redisService from "../services/redis-service";
import { RoomActivity, TimerHistory } from "../types/activities";

const router = Router();

// Add activity to Redis
router.post("/room/:sessionId", async (req, res) => {
  try {
    const { sessionId } = req.params;
    const activity: RoomActivity = {
      ...req.body,
      id: crypto.randomUUID(),
      timeStamp: new Date().toISOString(),
    };

    const result = await redisService.addActivity(sessionId, activity);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to add activity" });
  }
});

// Get activities from Redis
router.get("/room/:sessionId", async (req, res) => {
  try {
    const { sessionId } = req.params;
    const activities = await redisService.getActivities(sessionId);
    res.json(activities);
  } catch (error) {
    res.status(500).json({ error: "Failed to get activities" });
  }
});

// Add user history to Redis
router.post("/history/:userName", async (req, res) => {
  try {
    const history: TimerHistory = {
      ...req.body,
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
    };

    const result = await redisService.addHistory(history);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to add history" });
  }
});

// Get user history from Redis
router.get("/history/:userName", async (req, res) => {
  try {
    const { userName } = req.params;
    const history = await redisService.getHistory(userName);
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: "Failed to get history" });
  }
});

export default router;
