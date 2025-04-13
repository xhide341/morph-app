import express from "express";
import cors from "cors";
import quotesRouter from "./routes/quotes";
import roomRouter from "./routes/room";
import { connectRedis } from "./config/redis";
import { createServer } from "http";
import { SocketIOService } from "./services/socket-io-service";
import path from "path";

const app = express();
const port = parseInt(process.env.PORT || "10000", 10);
const server = createServer(app);

// socket.io instance
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

const __dirname = path.resolve(); // node doesn't have __dirname by default in ESM
// Serve static frontend
app.use(express.static(path.join(__dirname, "../client/dist")));
// Catch-all route to serve index.html for frontend routing (like /room/abc123)
app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "../client/dist/index.html"));
});

// this is for local development
// app.listen(port, "0.0.0.0", () => {
//   console.log(`Server running on port ${port}`);
// });

// this is for production
server.listen(port, "0.0.0.0", () => {
  console.log(`Server running on port ${port}`);
});
