import express, { Request, Response } from "express";
import cors from "cors";
import quotesRouter from "./routes/quotes";
import activityRouter from "./routes/activity";
import roomRouter from "./routes/room";
import { connectRedis } from "./config/redis";
import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";

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
app.use("/api/activity", activityRouter);
app.use("/api/room", roomRouter);

// Track clients and their rooms
const clients = new Map<WebSocket, string>();

wss.on("connection", (ws: WebSocket) => {
  // Handle incoming messages
  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message.toString());
      const roomId = data.roomId; // Get roomId from message

      // Store client's room
      clients.set(ws, roomId);

      // Only send to clients in the same room
      wss.clients.forEach((client) => {
        if (
          client.readyState === ws.OPEN &&
          client !== ws &&
          clients.get(client) === roomId
        ) {
          client.send(JSON.stringify(data));
        }
      });
    } catch (error) {
      console.error("Error processing message:", error);
    }
  });

  // Handle client disconnection
  ws.on("close", () => {
    clients.delete(ws);
  });

  // Handle errors
  ws.on("error", (error) => {
    console.error("WebSocket error:", error);
  });
});

server.listen(port, () => {
  console.log(`Server running on port ${port} with WebSocket support`);
});
