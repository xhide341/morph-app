import express, { Request, Response } from "express";
import cors from "cors";
import quotesRouter from "./routes/quotes";
import redisTestRouter from "./routes/redis-test";
import activityRouter from "./routes/activity";
import { connectRedis } from "./config/redis";
import { createServer } from "http";
import { WebSocketServer } from "ws";

const app = express();
const port = process.env.PORT || 3000;
const server = createServer(app);
const wss = new WebSocketServer({ server });

// Connect to Redis
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
app.use("/api/redis", redisTestRouter);
app.use("/api/activity", activityRouter);

wss.on("connection", (ws) => {
  console.log("Client connected");
  ws.send("Hello from server");
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
