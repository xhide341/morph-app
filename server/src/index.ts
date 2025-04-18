import cors from "cors";
import express from "express";
import { createServer } from "http";

import { connectRedis } from "./config/redis";
import quotesRouter from "./routes/quotes";
import roomRouter from "./routes/room";
import { redisService } from "./services/redis-service";
import { SocketIOService } from "./services/socket-io-service";

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
    credentials: false, // TODO: change to true in production
  }),
);
app.use(express.json());
app.use("/api/quotes", quotesRouter);
app.use("/api/room", roomRouter);

// this is for local development
// app.listen(port, "0.0.0.0", () => {
//   console.log(`Server running on port ${port}`);
// });

// this is for production
server.listen(port, "0.0.0.0", () => {
  console.log(`Server running on port ${port}`);
});
