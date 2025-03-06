import { useState, useEffect } from "react";
import axios from "axios";

interface Quote {
  q: string;
  a: string;
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
        const data = response.data[0] as Quote;
        setQuote(data.q);
        setAuthor(data.a);
      } catch (error) {
        console.error("Error fetching quote", error);
      }
    };

    fetchQuote();
  }, []);

  return { quote, author };
};
