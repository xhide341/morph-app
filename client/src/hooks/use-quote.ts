import axios from "axios";
import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

interface Quote {
  q: string;
  a: string;
  h: string;
}

export const useQuote = () => {
  const [quote, setQuote] = useState<string>("");
  const [author, setAuthor] = useState<string>("");
  const [html, setHtml] = useState<string>("");

  useEffect(() => {
    const fetchQuote = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/quotes/today`);
        const data = response.data[0] as Quote;
        setQuote(data.q);
        setAuthor(data.a);
        setHtml(data.h);
      } catch (error) {
        console.error("error fetching quote", error);
      }
    };

    fetchQuote();
  }, []);

  return { quote, author, html };
};
