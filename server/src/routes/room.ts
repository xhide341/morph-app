import { Router } from "express";
import redisService from "../services/redis-service";

const router = Router();

router.post("/create", async (req, res) => {
  try {
    const { roomId, userName } = req.body;
    const room = await redisService.createRoom(roomId, userName);
    res.json(room);
  } catch (error) {
    res.status(500).json({ error: "Failed to create room" });
  }
});

router.post("/:roomId/join", async (req, res) => {
  try {
    const { roomId } = req.params;
    const { userName } = req.body;
    const result = await redisService.userJoinRoom(roomId, userName);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to join room" });
  }
});

export default router;
