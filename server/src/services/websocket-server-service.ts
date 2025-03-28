import { WebSocketServer, WebSocket } from "ws";
import { Server } from "http";
import { redisService } from "./redis-service";

// Track WebSocket client info for broadcasting and room management
const clients = new Map<WebSocket, { roomId: string; userName?: string }>();

export class WebSocketServerService {
  private static instance: WebSocketServerService;
  private wss: WebSocketServer;

  private constructor(server: Server) {
    this.wss = new WebSocketServer({ server });
    this.initialize();
  }

  static getInstance(server: Server): WebSocketServerService {
    if (!WebSocketServerService.instance) {
      WebSocketServerService.instance = new WebSocketServerService(server);
    }
    return WebSocketServerService.instance;
  }

  private initialize() {
    this.wss.on("connection", (ws: WebSocket, req) => {
      const url = new URL(req.url || "", `ws://${req.headers.host}`);
      const roomId = url.pathname.split("/room/")[1];
      const userName = url.searchParams.get("userName") || undefined;

      console.log(
        "[WS Server] Total active connections:",
        this.wss.clients.size
      );
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
      console.log(
        `[WS Server] Clients in room ${roomId}:`,
        clientsInRoom.length
      );

      ws.on("message", async (message) => {
        try {
          const data = JSON.parse(message.toString());
          console.log("[WS Server] Received message:", data);

          if (data.type === "activity") {
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
            this.broadcastToRoom(roomId, data);
          }
        } catch (error) {
          console.error("[WS Server] Error processing message:", error);
        }
      });

      ws.on("close", async () => {
        const clientInfo = clients.get(ws);
        if (clientInfo?.userName) {
          // Check if user exists in other connections
          const userExistsInOtherConnections = Array.from(
            clients.entries()
          ).some(
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

            // Add leave activity
            const activity = {
              type: "activity",
              payload: {
                type: "leave",
                userName: clientInfo.userName,
                roomId: clientInfo.roomId,
                timeStamp: new Date().toISOString(),
              },
            };

            this.broadcastToRoom(clientInfo.roomId, activity);
          }
        }

        // Remove this specific connection
        clients.delete(ws);
        console.log(
          "[WS Server] Client disconnected. Remaining connections:",
          this.wss.clients.size
        );
      });
    });
  }

  private broadcastToRoom(roomId: string, data: any) {
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

  getWSS() {
    return this.wss;
  }
}
