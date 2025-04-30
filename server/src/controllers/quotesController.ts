import axios from "axios";
import { Request, Response } from "express";

interface Quote {
  quote: string;
  author: string;
}

// Server-side cache
const CACHE_DURATION = 24 * 60 * 60 * 1000;
const cache = {
  data: null as Quote | null,
  lastFetched: 0,
};

export const getToday = async (req: Request, res: Response) => {
  try {
    const isCacheValid =
      cache.data && Date.now() - cache.lastFetched < CACHE_DURATION;

    if (isCacheValid) {
      res.json(cache.data);
      return;
    }

    const { data } = await axios.get("https://zenquotes.io/api/today");
    cache.data = data;
    cache.lastFetched = Date.now();

    res.json(cache.data);
  } catch (error) {
    console.error("ZenQuotes Error:", error);
    if (cache.data) {
      res.json(cache.data);
      return;
    }
    res.status(500).json({ error: "Error fetching daily quote" });
  }
};
