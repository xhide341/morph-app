import { WebSocketServer, WebSocket } from "ws";
import { Server } from "http";

// track websocket client info for broadcasting and room management
const clients = new Map<WebSocket, { roomId: string }>();

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

      console.log(
        "[WS Server] Total active connections:",
        this.wss.clients.size
      );
      console.log("[WS Server] Connection attempt:", { roomId });

      if (!roomId) {
        console.error("[WS Server] No room ID provided");
        ws.close();
        return;
      }

      // store client info immediately on connection
      clients.set(ws, { roomId });

      // log room-specific connections
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
            // broadcast to all clients in the room
            this.broadcastToRoom(roomId, data);
          }
        } catch (error) {
          console.error("[WS Server] Error processing message:", error);
        }
      });

      ws.on("close", () => {
        // remove connection
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
