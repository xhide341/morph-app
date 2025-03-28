import express from "express";
import cors from "cors";
import quotesRouter from "./routes/quotes";
import roomRouter from "./routes/room";
import { connectRedis } from "./config/redis";
import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { redisService } from "./services/redis-service";

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

// TODO: Move this to a separate file
// Track WebSocket client info for broadcasting and room management
const clients = new Map<WebSocket, { roomId: string; userName?: string }>();

wss.on("connection", (ws: WebSocket, req) => {
  const url = new URL(req.url || "", `ws://${req.headers.host}`);
  const roomId = url.pathname.split("/room/")[1];
  const userName = url.searchParams.get("userName") || undefined;

  console.log("[WS Server] Total active connections:", wss.clients.size);
  console.log("[WS Server] Connection attempt:", { roomId, userName });

  if (!roomId) {
    console.error("No room ID provided");
    ws.close();
    return;
  }

  // Store client info immediately on connection
  clients.set(ws, { roomId, userName });

  // Log room-specific connections
  const clientsInRoom = Array.from(clients.entries()).filter(
    ([_, info]) => info.roomId === roomId
  );
  console.log(`[WS Server] Clients in room ${roomId}:`, clientsInRoom.length);

  // Add initial connection message
  ws.send(
    JSON.stringify({
      type: "connection_status",
      payload: { status: "connected", roomId, userName },
    })
  );

  ws.on("message", async (message) => {
    try {
      const data = JSON.parse(message.toString());
      console.log("[WS Server] Received message:", data);

      if (data.type === "activity") {
        // Update userName if it's a join activity
        if (data.payload.type === "join") {
          const clientInfo = clients.get(ws);
          if (clientInfo) {
            clients.set(ws, {
              ...clientInfo,
              userName: data.payload.userName,
            });
            console.log(
              "[WS Server] Updated user info:",
              data.payload.userName
            );
          }
        }

        // Broadcast to all clients in the room
        const clientsInRoom = Array.from(clients.entries()).filter(
          ([_, info]) => info.roomId === roomId
        );

        console.log(
          `[WS Server] Broadcasting to ${clientsInRoom.length} clients in room ${roomId}`
        );

        clientsInRoom.forEach(([client]) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
          }
        });
      }
    } catch (error) {
      console.error("[WS Server] Error processing message:", error);
    }
  });

  ws.on("close", async () => {
    const clientInfo = clients.get(ws);
    if (clientInfo?.userName) {
      // Check if user exists in other connections
      const userExistsInOtherConnections = Array.from(clients.entries()).some(
        ([socket, info]) =>
          socket !== ws &&
          info.roomId === clientInfo.roomId &&
          info.userName === clientInfo.userName
      );

      // Log connection status
      console.log("[WS Server] Connection closing:", {
        userName: clientInfo.userName,
        roomId: clientInfo.roomId,
        hasOtherConnections: userExistsInOtherConnections,
      });

      if (!userExistsInOtherConnections) {
        await redisService.userLeaveRoom(
          clientInfo.roomId,
          clientInfo.userName
        );

        // Add leave activity through activity tracker
        const activity = {
          type: "activity",
          payload: {
            type: "leave",
            userName: clientInfo.userName,
            roomId: clientInfo.roomId,
            timeStamp: new Date().toISOString(),
          },
        };

        // Broadcast to remaining clients
        const clientsInRoom = Array.from(clients.entries()).filter(
          ([_, info]) => info.roomId === clientInfo.roomId
        );

        clientsInRoom.forEach(([client]) => {
          if (client.readyState === WebSocket.OPEN) {
            console.log(
              "[WS Server] Broadcasting leave activity:",
              activity.payload
            );
            client.send(JSON.stringify(activity));
          }
        });
      }
    }

    // Remove this specific connection
    clients.delete(ws);
    console.log(
      "[WS Server] Client disconnected. Remaining connections:",
      wss.clients.size
    );
  });
});

server.listen(port, () => {
  console.log(`Server running on port ${port} with WebSocket support`);
});
