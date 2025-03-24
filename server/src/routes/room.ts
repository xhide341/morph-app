import { Router } from "express";
import redisService from "../services/redis-service";
import { RoomActivity } from "../types/room";

const roomRouter = Router();

// create a new room
roomRouter.post("/create", async (req, res) => {
  try {
    const { roomId, userName } = req.body;
    const room = await redisService.createRoom(roomId, userName);
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
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to store activity" });
    }
  });

export default roomRouter;
