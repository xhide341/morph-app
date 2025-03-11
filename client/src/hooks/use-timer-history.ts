import { useState, useEffect } from "react";
import { TimerHistory } from "../types/history";

export const useTimerHistory = () => {
  const [history, setHistory] = useState<TimerHistory[]>([]);

  const addToHistory = (session: Omit<TimerHistory, "id" | "date">) => {
    const newSession: TimerHistory = {
      ...session,
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
    };

    const newHistory = [...history, newSession];
    setHistory(newHistory);
    localStorage.setItem("timerHistory", JSON.stringify(newHistory));
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
    const savedHistory = localStorage.getItem("timerHistory");
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory) as TimerHistory[]);
    }
  }, []);

  return { history, addToHistory, getPomodoroStats };
};
