import { Request, Response } from "express";
import axios from "axios";

export const getToday = async (req: Request, res: Response) => {
  try {
    const response = await axios.get("https://zenquotes.io/api/today");
    console.log("API Response:", JSON.stringify(response.data, null, 2));
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Error fetching daily quote" });
  }
};
