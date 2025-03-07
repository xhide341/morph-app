import { useState, useEffect } from "react";
import axios from "axios";

interface Quote {
  quote: string;
  author: string;
}

export const useQuote = () => {
  const [quote, setQuote] = useState<string>("");
  const [author, setAuthor] = useState<string>("");

  useEffect(() => {
    const fetchQuote = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3000/api/quotes/today",
        );
        console.log("Response from server:", response.data);
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
