import express from "express";
import cors from "cors";
import quotesRouter from "./routes/quotes";
import roomRouter from "./routes/room";
import { connectRedis } from "./config/redis";
import { createServer } from "http";
import { SocketIOService } from "./services/socket-io-service";

const app = express();
const port = parseInt(process.env.PORT || "10000", 10);
const server = createServer(app);

// Initialize Socket.IO
SocketIOService.getInstance(server);

// redis connection
connectRedis().catch(console.error);

app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? process.env.CORS_ORIGIN
        : "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
app.use("/api/quotes", quotesRouter);
app.use("/api/room", roomRouter);

app.listen(port, "0.0.0.0", () => {
  console.log(`Server running on port ${port}`);
});
