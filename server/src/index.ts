import express, { Request, Response } from "express";
import cors from "cors";
import quotesRouter from "./routes/quotes";
import redisTestRouter from "./routes/redis-test";
import { connectRedis } from "./config/redis";

const app = express();
const port = process.env.PORT || 3000;

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

app.get("/", (req: Request, res: Response) => {
  res.send("hello world!");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
