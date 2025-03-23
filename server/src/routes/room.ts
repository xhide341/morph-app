import { Router } from "express";
import redisService from "../services/redis-service";
import { RoomActivity } from "../types/room";

const roomRouter = Router();

// create a new room
roomRouter.post("/create", async (req, res) => {
  try {
    const { roomId, userName } = req.body;
    const room = await redisService.createRoom(roomId, userName);
    if (!room) {
      res.status(404).json({ error: "Room not found" });
    }
    res.json(room);
  } catch (error) {
    res.status(500).json({ error: "Failed to create room" });
  }
});

// get room info
roomRouter.get("/:roomId/info", async (req, res) => {
  try {
    const { roomId } = req.params;
    const result = await redisService.getRoomInfo(roomId);
    if (!result) {
      res.status(404).json({ error: "Room not found" });
    }
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to get room info" });
  }
});

// users resource
roomRouter
  .route("/:roomId/users")
  .get(async (req, res) => {
    try {
      const { roomId } = req.params;
      const result = await redisService.getRoomUsers(roomId);
      if (!result) {
        res.status(404).json({ error: "Room not found" });
      }
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to get room info" });
    }
  })
  .post(async (req, res) => {
    try {
      const { roomId } = req.params;
      const { userName } = req.body;
      const result = await redisService.userJoinRoom(roomId, userName);
      if (!result) {
        res.status(404).json({ error: "Room not found" });
      }
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to join room" });
    }
  })
  .delete(async (req, res) => {
    try {
      const { roomId } = req.params;
      const { userName } = req.body;
      const result = await redisService.userLeaveRoom(roomId, userName);
      if (!result) {
        res.status(404).json({ error: "User not found" });
      }
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to leave room" });
    }
  });

// activities resource
roomRouter
  .route("/:roomId/activities")
  .get(async (req, res) => {
    try {
      const { roomId } = req.params;
      const activities = await redisService.getActivities(roomId);
      if (!activities) {
        res.status(404).json({ error: "No activities found" });
      }
      res.json(activities);
    } catch (error) {
      res.status(500).json({ error: "Failed to get activities" });
    }
  })
  .post(async (req, res) => {
    try {
      const { roomId } = req.params;
      const activity = { ...req.body, id: crypto.randomUUID() };
      const result = await redisService.storeActivity(roomId, activity);
      if (!result) {
        res.status(404).json({ error: "Room not found" });
      }
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to store activity" });
    }
  });

export default roomRouter;
