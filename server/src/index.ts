import express from "express";
import cors from "cors";
import quotesRouter from "./routes/quotes";
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
app.use("/api/room", roomRouter);

// Track WebSocket client info for broadcasting and room management
// TODO: make this a separate controller for separation of concerns
const clients = new Map<WebSocket, { roomId: string; userName: string }>();

wss.on("connection", (ws: WebSocket, req) => {
  const url = new URL(req.url || "", `ws://${req.headers.host}`);
  const roomId = url.pathname.split("/room/")[1];

  console.log("[WS Server] Connection attempt for room:", roomId);

  if (!roomId) {
    console.error("No room ID provided");
    ws.close();
    return;
  }

  // Add initial connection message
  ws.send(
    JSON.stringify({
      type: "connection_status",
      payload: { status: "connected", roomId },
    })
  );

  ws.on("message", async (message) => {
    try {
      const data = JSON.parse(message.toString());
      console.log("[WS Server] Received message:", data);

      if (data.type === "activity") {
        if (data.payload.type === "join") {
          clients.set(ws, {
            roomId,
            userName: data.payload.userName,
          });
          console.log("[WS Server] Client joined room:", roomId);
        }

        const clientsInRoom = Array.from(wss.clients).filter(
          (client) => clients.get(client)?.roomId === roomId
        );
        console.log(
          `[WS Server] Broadcasting to ${clientsInRoom.length} clients in room ${roomId}`
        );

        wss.clients.forEach((client) => {
          if (
            client.readyState === WebSocket.OPEN &&
            clients.get(client)?.roomId === roomId
          ) {
            client.send(JSON.stringify(data));
          }
        });
      }
    } catch (error) {
      console.error("[WS Server] Error processing message:", error);
    }
  });

  ws.on("close", () => {
    const clientInfo = clients.get(ws);
    console.log(
      "[WS Server] Client disconnected from room:",
      clientInfo?.roomId
    );
    clients.delete(ws);
  });
});

server.listen(port, () => {
  console.log(`Server running on port ${port} with WebSocket support`);
});
