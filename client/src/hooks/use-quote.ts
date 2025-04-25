import axios from "axios";
import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

interface Quote {
  quote: string;
  author: string;
}

// using proxy configuration for cleaner api calls
export const useQuote = () => {
  const [quote, setQuote] = useState<string>("");
  const [author, setAuthor] = useState<string>("");

  useEffect(() => {
    const fetchQuote = async () => {
      try {
        // using proxy configuration instead of full url
        const response = await axios.get(`${API_URL}/api/quotes/today`);
        const data = response.data as Quote;
        setQuote(data.quote);
        setAuthor(data.author);
      } catch (error) {
        console.error("Error fetching quote", error);
      }
    };

    fetchQuote();
  }, []);

  return { quote, author };
};
