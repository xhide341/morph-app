import dotenv from "dotenv";
import path from "path";
import { createClient } from "redis";

// Load the correct .env file based on NODE_ENV
dotenv.config({
  path: path.resolve(
    process.cwd(),
    "..", // Go up one level to the root
    process.env.NODE_ENV === "production" ? ".env.production" : ".env",
  ),
});

export const redis = createClient({
  url: process.env.REDIS_URL,
});

redis.on("error", (err) => console.log("Redis Client Error", err));
redis.on("connect", () => console.log("Redis connected"));

export const connectRedis = async () => {
  await redis.connect();
};
