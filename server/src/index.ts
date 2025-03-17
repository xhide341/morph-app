import express, { Request, Response } from "express";
import cors from "cors";
import quotesRouter from "./routes/quotes";
import activityRouter from "./routes/activity";
import roomRouter from "./routes/room";
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
app.use("/api/activity", activityRouter);
app.use("/api/room", roomRouter);

wss.on("connection", (ws) => {
  console.log("New client connected");

  // Send welcome message to new client
  ws.send(
    JSON.stringify({
      type: "connection",
      payload: "Connected to WebSocket server",
    })
  );

  // Handle incoming messages
  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message.toString());

      wss.clients.forEach((client) => {
        if (client.readyState === ws.OPEN && client !== ws) {
          client.send(JSON.stringify(data));
        }
      });
    } catch (error) {
      console.error("Error processing message:", error);
    }
  });

  // Handle client disconnection
  ws.on("close", () => {
    console.log("Client disconnected");
  });

  // Handle errors
  ws.on("error", (error) => {
    console.error("WebSocket error:", error);
  });
});

server.listen(port, () => {
  console.log(`Server running on port ${port} with WebSocket support`);
});
