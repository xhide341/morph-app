import { redis } from "../config/redis";
import { Router } from "express";

const router = Router();

router.get("/test", async (req, res) => {
  try {
    // Backend talks to Redis directly
    await redis.set("key", "value");
    const data = await redis.get("key");

    // Sends response to frontend
    res.json({ data });
  } catch (error) {
    res.status(500).json({ error });
  }
});

export default router;
