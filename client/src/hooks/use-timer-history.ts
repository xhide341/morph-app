import { useState, useEffect } from "react";
import { TimerHistory } from "../types/history";

export function useTimerHistory() {
  const [history, setHistory] = useState<TimerHistory[]>([]);

  const addToHistory = (session: TimerHistory) => {
    const newHistory = [...history, session];
    setHistory(newHistory);
    localStorage.setItem("timerHistory", JSON.stringify(newHistory));
  };

  useEffect(() => {
    const savedHistory = localStorage.getItem("timerHistory");
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory) as TimerHistory[]);
    }
  }, []);

  return { history, addToHistory };
}

export default useTimerHistory;
