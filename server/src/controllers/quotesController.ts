import { Request, Response } from "express";
import axios from "axios";

interface Quote {
  quote: string;
  author: string;
}

// Server-side cache
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
const cache = {
  data: null as Quote | null,
  lastFetched: 0,
};

export const getToday = async (req: Request, res: Response) => {
  try {
    // Check if we have a valid cached quote
    const isCacheValid =
      cache.data && Date.now() - cache.lastFetched < CACHE_DURATION;

    if (isCacheValid) {
      res.json(cache.data);
      return;
    }

    // Fetch new quote if cache is invalid
    const { data } = await axios.get("https://qapi.vercel.app/api/random");
    cache.data = data;
    cache.lastFetched = Date.now();

    res.json(cache.data);
  } catch (error) {
    console.error("ZenQuotes Error:", error);
    // Return cached quote as fallback if available
    if (cache.data) {
      res.json(cache.data);
      return;
    }
    res.status(500).json({ error: "Error fetching daily quote" });
  }
};
