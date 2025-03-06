import express, { Request, Response } from "express";
import cors from "cors";
import quotesRouter from "./routes/quotes";

const app = express();
const port = process.env.PORT || 3000;

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(express.json());
app.use("/api/quotes", quotesRouter);

app.get("/", (req: Request, res: Response) => {
  res.send("hello world!");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
