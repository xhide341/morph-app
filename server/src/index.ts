import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";

import { connectRedis } from "./config/redis";
import quotesRouter from "./routes/quotes";
import roomRouter from "./routes/room";
import { redisService } from "./services/redis-service";
import { SocketIOService } from "./services/socket-io-service";

// Log environment details
console.log("Environment:", process.env.NODE_ENV);
console.log("Port:", process.env.PORT);
console.log("CORS Origin:", process.env.CORS_ORIGIN);

const app = express();
const port = parseInt(process.env.PORT || "10000", 10);
const server = createServer(app);

// socket.io instance
SocketIOService.getInstance(server);

// redis connection
const startRedis = async () => {
  await connectRedis();
  await redisService.cleanupExpiredRooms();
};
startRedis().catch(console.error);

app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? process.env.CORS_ORIGIN
        : "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);
app.use(express.json());
app.use("/api/quotes", quotesRouter);
app.use("/api/room", roomRouter);

server.listen(port, "0.0.0.0", () => {
  console.log(`Server running on port ${port}`);
});
