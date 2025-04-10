import { useState, useEffect } from "react";
import axios from "axios";

interface Quote {
  quote: string;
  author: string;
}

const BACKEND_URL = import.meta.env.REACT_APP_BACKEND_URL;

// using proxy configuration for cleaner api calls
export const useQuote = () => {
  const [quote, setQuote] = useState<string>("");
  const [author, setAuthor] = useState<string>("");

  useEffect(() => {
    const fetchQuote = async () => {
      try {
        // using proxy configuration instead of full url
        const response = await axios.get(`${BACKEND_URL}/api/quotes/today`);
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
