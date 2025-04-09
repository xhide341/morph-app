import { createClient } from "redis";
import dotenv from "dotenv";

dotenv.config();

export const redis = createClient({
  url: process.env.REDIS_URL,
});

redis.on("error", (err) => console.log("Redis Client Error", err));
redis.on("connect", () => console.log("Redis connected"));

export const connectRedis = async () => {
  await redis.connect();
};

const testRedis = async () => {
  try {
    await redis.set("foo", "bar");
    const result = await redis.get("foo");
    console.log("Test result:", result); // >>> bar
  } catch (error) {
    console.error("Redis test failed:", error);
  }
};
