import { useState, useEffect } from "react";
import axios from "axios";

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
        const response = await axios.get(`${import.meta.env.API_URL}/quotes/today`);
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
