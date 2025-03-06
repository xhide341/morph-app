import { Router } from "express";
import { getToday } from "../controllers/quotesController";

const quotesRouter = Router();

quotesRouter.get("/today", getToday);

export default quotesRouter;
