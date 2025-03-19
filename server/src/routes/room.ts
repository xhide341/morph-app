import { Router } from "express";
import redisService from "../services/redis-service";

const roomRouter = Router();

roomRouter.post("/create", async (req, res) => {
  try {
    const { roomId, userName } = req.body;
    const room = await redisService.createRoom(roomId, userName);
    res.json(room);
  } catch (error) {
    res.status(500).json({ error: "Failed to create room" });
  }
});

roomRouter.post("/:roomId/join", async (req, res) => {
  try {
    const { roomId } = req.params;
    const { userName } = req.body;
    const result = await redisService.userJoinRoom(roomId, userName);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to join room" });
  }
});

roomRouter.post("/:roomId/leave", async (req, res) => {
  try {
    const { roomId } = req.params;
    const { userName } = req.body;
    const result = await redisService.userLeaveRoom(roomId, userName);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to leave room" });
  }
});

roomRouter.get("/:roomId/info", async (req, res) => {
  try {
    const { roomId } = req.params;
    const result = await redisService.getRoomInfo(roomId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to get room info" });
  }
});

roomRouter.get("/:roomId/users", async (req, res) => {
  try {
    const { roomId } = req.params;
    const result = await redisService.getRoomUsers(roomId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to get room users" });
  }
});

export default roomRouter;
