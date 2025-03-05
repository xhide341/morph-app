import express, { Request, Response } from "express";
import cors from "cors";

const app = express();
const port = process.env.PORT || 3000;

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.get("/", (req: Request, res: Response) => {
  res.send("hello world!");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
