import { Router } from "express";
import redisService from "../services/redis-service";
import { RoomActivity } from "../types/room";

const router = Router();

// Add activity to Redis
router.post("/room/:roomId", async (req, res) => {
  try {
    const { roomId } = req.params;
    const activity: RoomActivity = {
      ...req.body,
      id: crypto.randomUUID(),
      timeStamp: new Date().toISOString(),
    };

    const result = await redisService.storeActivity(roomId, activity);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to add activity" });
  }
});

// Get activities from Redis
router.get("/room/:roomId", async (req, res) => {
  try {
    const { roomId } = req.params;
    const activities = await redisService.getActivities(roomId);
    res.json(activities);
  } catch (error) {
    res.status(500).json({ error: "Failed to get activities" });
  }
});

// Add user history to Redis
// router.post("/history/:userName", async (req, res) => {
//   try {
//     const history: TimerHistory = {
//       ...req.body,
//       id: crypto.randomUUID(),
//       date: new Date().toISOString(),
//     };

//     const result = await redisService.addHistory(history);
//     res.status(201).json(result);
//   } catch (error) {
//     res.status(500).json({ error: "Failed to add history" });
//   }
// });

// // Get user history from Redis
// router.get("/history/:userName", async (req, res) => {
//   try {
//     const { userName } = req.params;
//     const history = await redisService.getHistory(userName);
//     res.json(history);
//   } catch (error) {
//     res.status(500).json({ error: "Failed to get history" });
//   }
// });

router.get("/:roomId", async (req, res) => {
  try {
    const { roomId } = req.params;
    const activities = await redisService.getActivities(roomId);
    res.json(activities || []);
  } catch (error) {
    console.error("Error fetching activities:", error);
    res.status(500).json([]);
  }
});

export default router;
