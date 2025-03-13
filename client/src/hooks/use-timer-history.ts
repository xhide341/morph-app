import { useState, useEffect } from "react";
import { TimerHistory } from "../types/history";

export const useTimerHistory = () => {
  const [history, setHistory] = useState<TimerHistory[]>([]);

  const addToHistory = async (session: Omit<TimerHistory, "id" | "date">) => {
    const newSession: TimerHistory = {
      ...session,
      id: crypto.randomUUID(), // Note: This ID will be replaced by MongoDB's _id
      date: new Date().toISOString(),
    };

    // TODO: Add API call to save to MongoDB
    // const response = await fetch('/api/timer-history', {
    //   method: 'POST',
    //   body: JSON.stringify(newSession)
    // });

    setHistory([...history, newSession]);
  };

  const getPomodoroStats = () => {
    return {
      total: history.filter((h) => h.type === "pomodoro").length,
      completed: history.filter((h) => h.type === "pomodoro" && h.completed)
        .length,
      completed25: history.filter(
        (h) => h.type === "pomodoro" && h.completed && h.pomodoroType === "25",
      ).length,
      completed55: history.filter(
        (h) => h.type === "pomodoro" && h.completed && h.pomodoroType === "55",
      ).length,
    };
  };

  useEffect(() => {
    // TODO: Add API call to fetch history from MongoDB
    // const fetchHistory = async () => {
    //   const response = await fetch('/api/timer-history');
    //   const data = await response.json();
    //   setHistory(data);
    // };
    // fetchHistory();
  }, []);

  return { history, addToHistory, getPomodoroStats };
};
