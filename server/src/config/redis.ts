import { createClient } from "redis";
import dotenv from "dotenv";

dotenv.config();

export const redis = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});

redis.on("error", (err) => console.log("Redis Client Error", err));
redis.on("connect", () => console.log("Connected to Redis"));

// Connect to Redis when this file is imported
export const connectRedis = async () => {
  await redis.connect();
};
