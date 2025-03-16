import { useState, useEffect } from "react";
import { useQuote } from "../hooks/use-quote";
import { useParams } from "react-router-dom";
import { RoomActivity } from "../types/activity";

import { Play, Pause, RotateCcw } from "react-feather";
import { Navigation } from "./navigation";
import { ProgressBar } from "./progress-bar";

type TimerMode = "work" | "break";

export const Clock = ({
  addActivity,
  latestActivity,
}: {
  addActivity: (activity: Omit<RoomActivity, "id" | "timeStamp">) => void;
  latestActivity: RoomActivity | null;
}) => {
  const { roomId } = useParams<{ roomId: string }>();
  const [time, setTime] = useState("25:00");
  const [lastWorkTime, setLastWorkTime] = useState("25:00");
  const [lastBreakTime, setLastBreakTime] = useState("05:00");
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(
    null,
  );
  const [isRunning, setIsRunning] = useState(false);
  const [timerMode, setTimerMode] = useState<TimerMode>("work");

  const { quote, author } = useQuote();

  const handleTimerChange = (minutes: number) => {
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
    const newTime = `${String(minutes).padStart(2, "0")}:00`;
    if (timerMode === "work") {
      setLastWorkTime(newTime);
    } else {
      setLastBreakTime(newTime);
    }
    setTime(newTime);
    setIsRunning(false);
  };

  const handleStart = () => {
    if (timerInterval) return;

    const newInterval = setInterval(() => {
      setTime((prevTime) => {
        const [minutes, seconds] = prevTime.split(":").map(Number);
        if (minutes === 0 && seconds === 0) {
          clearInterval(newInterval);
          setTimerInterval(null);
          setIsRunning(false);
          return "00:00";
        }
        const totalSeconds = minutes * 60 + seconds - 1;
        const newMinutes = Math.floor(totalSeconds / 60);
        const newSeconds = totalSeconds % 60;

        return `${String(newMinutes).padStart(2, "0")}:${String(newSeconds).padStart(2, "0")}`;
      });
    }, 1000);
    setIsRunning(true);
    setTimerInterval(newInterval);

    addActivity({
      type: "start_timer",
      userName: "John Doe",
      roomId: roomId || "",
      timeRemaining: time,
      timerMode: timerMode,
    });
  };

  const handlePause = () => {
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
    setIsRunning(false);

    addActivity({
      type: "pause_timer",
      userName: "John Doe",
      roomId: roomId || "",
      timeRemaining: time,
      timerMode: timerMode,
    });
  };

  const handleReset = () => {
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
    setTime(timerMode === "work" ? lastWorkTime : lastBreakTime);
    setIsRunning(false);

    addActivity({
      type: "reset_timer",
      userName: "John Doe",
      roomId: roomId || "",
      timeRemaining: time,
      timerMode: timerMode,
    });
  };

  useEffect(() => {
    if (roomId) return;

    const handleTimerSync = (activity: RoomActivity) => {
      if (activity.type === "start_timer") {
        handleStart();
      }
      if (activity.type === "pause_timer") {
        handlePause();
      }
      if (activity.type === "reset_timer") {
        handleReset();
      }
    };

    if (latestActivity) {
      handleTimerSync(latestActivity);
    }
  }, [roomId, latestActivity]);

  return (
    <div
      className={`${
        timerMode === "work" ? "bg-secondary" : "bg-secondary/80"
      } flex flex-col items-center justify-center rounded-xl p-10`}
    >
      <Navigation
        onTimerChange={handleTimerChange}
        onTimerModeChange={setTimerMode}
      />
      <div className="flex flex-col items-center justify-center">
        <h1 className="text-[8rem] font-bold">{time}</h1>
        <div className="flex flex-row justify-center gap-4 text-center text-2xl">
          <button
            aria-label={isRunning ? "Pause" : "Start"}
            className={`css-button-3d w-24 p-4 ${isRunning ? "pressed" : ""}`}
            onClick={isRunning ? handlePause : handleStart}
          >
            {isRunning ? <Pause size={24} /> : <Play size={24} />}
          </button>
          <button
            aria-label="Reset"
            className="css-button-3d w-24 p-4"
            onClick={handleReset}
          >
            <RotateCcw size={24} />
          </button>
        </div>
        <div className="mt-12 w-full">
          <ProgressBar
            currentTime={time}
            totalTime={timerMode === "work" ? lastWorkTime : lastBreakTime}
          />
        </div>
        <div className="mt-12 flex flex-col items-center justify-center gap-1">
          <blockquote className="font-base text-sm">"{quote}"</blockquote>
          <p className="text-sm italic">{author}</p>
        </div>
      </div>
    </div>
  );
};

export default Clock;
