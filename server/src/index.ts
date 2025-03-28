import express from "express";
import cors from "cors";
import quotesRouter from "./routes/quotes";
import roomRouter from "./routes/room";
import { connectRedis } from "./config/redis";
import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { redisService } from "./services/redis-service";
import { WebSocketServerService } from "./services/websocket-server-service";

const app = express();
const port = process.env.PORT || 3000;
const server = createServer(app);

// wss server imported
WebSocketServerService.getInstance(server);

// redis connection
connectRedis().catch(console.error);

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
app.use("/api/quotes", quotesRouter);
app.use("/api/room", roomRouter);

server.listen(port, () => {
  console.log(`Server running on port ${port} with WebSocket support`);
});
