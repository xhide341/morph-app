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
  const [isSync, setIsSync] = useState(false);
  const { quote, author } = useQuote();

  const handleTimerChange = (
    minutes: number,
    mode: TimerMode,
    isSync: boolean = false,
  ) => {
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
    const newTime = `${String(minutes).padStart(2, "0")}:00`;
    setTimerMode(mode);
    if (mode === "work") {
      setLastWorkTime(newTime);
    } else {
      setLastBreakTime(newTime);
    }
    setTime(newTime);
    setIsRunning(false);

    if (!isSync) {
      addActivity({
        type: "change_timer",
        userName: "John Doe",
        roomId: roomId || "",
        timeRemaining: newTime,
        timerMode: mode,
      });
    }
  };

  const handleStart = (isSync: boolean = false) => {
    if (timerInterval) return;

    const startTime = Date.now();
    const [min, sec] = time.split(":").map(Number);
    const totalSeconds = min * 60 + sec;

    const newInterval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const remaining = Math.max(0, totalSeconds - elapsed);

      const newMinutes = Math.floor(remaining / 60);
      const newSeconds = remaining % 60;

      setTime(
        `${String(newMinutes).padStart(2, "0")}:${String(newSeconds).padStart(2, "0")}`,
      );

      if (remaining <= 0) {
        if (timerInterval) {
          clearInterval(timerInterval);
        }
        setTimerInterval(null);
        setIsRunning(false);
      }
    }, 100);

    setIsRunning(true);
    setTimerInterval(newInterval);

    if (!isSync) {
      addActivity({
        type: "start_timer",
        userName: "John Doe",
        roomId: roomId || "",
        timeRemaining: time,
        timerMode: timerMode,
      });
    }
  };

  const handlePause = (isSync: boolean = false) => {
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
    setIsRunning(false);

    if (!isSync) {
      addActivity({
        type: "pause_timer",
        userName: "John Doe",
        roomId: roomId || "",
        timeRemaining: time,
        timerMode: timerMode,
      });
    }
  };

  const handleReset = () => {
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);

      if (!isSync) {
        addActivity({
          type: "reset_timer",
          userName: "John Doe",
          roomId: roomId || "",
          timeRemaining: time,
          timerMode: timerMode,
        });
      }
    }
    setTime(timerMode === "work" ? lastWorkTime : lastBreakTime);
    setIsRunning(false);
  };

  useEffect(() => {
    if (!roomId || !latestActivity) return;

    const handleTimerSync = (activity: RoomActivity) => {
      const [currentMin, currentSec] = time.split(":").map(Number);
      const [activityMin, activitySec] = (activity.timeRemaining || "00:00")
        .split(":")
        .map(Number);
      const currentTotalSeconds = currentMin * 60 + currentSec;
      const activityTotalSeconds = activityMin * 60 + activitySec;

      const needsSync =
        !isRunning ||
        Math.abs(currentTotalSeconds - activityTotalSeconds) > 2 ||
        timerMode !== activity.timerMode;

      // Always process timer changes
      if (activity.type === "change_timer") {
        const minutes = parseInt(activity.timeRemaining?.split(":")[0] || "25");
        handleTimerChange(minutes, activity.timerMode || "work", true);
        return;
      }

      // Rest of sync logic for other activities
      if (
        !needsSync &&
        activity.type !== "pause_timer" &&
        activity.type !== "reset_timer"
      )
        return;

      setIsSync(true);
      if (activity.type === "pause_timer") {
        setTime(activity.timeRemaining || time);
        handlePause(true);
      }
      if (activity.type === "start_timer") {
        setTime(activity.timeRemaining || time);
        setTimerMode(activity.timerMode || "work");
        handleStart(true);
      }
      if (activity.type === "reset_timer") {
        setTime(activity.timeRemaining || time);
        handleReset();
      }
      setIsSync(false);
    };

    handleTimerSync(latestActivity);
  }, [roomId, latestActivity]);

  return (
    <div
      className={`${
        timerMode === "work" ? "bg-secondary" : "bg-secondary/80"
      } flex flex-col items-center justify-center rounded-xl p-10`}
    >
      <Navigation onTimerChange={handleTimerChange} />
      <div className="flex flex-col items-center justify-center">
        <h1 className="text-[8rem] font-bold">{time}</h1>
        <div className="flex flex-row justify-center gap-4 text-center text-2xl">
          <button
            aria-label={isRunning ? "Pause" : "Start"}
            className={`css-button-3d w-24 p-4 ${isRunning ? "pressed" : ""}`}
            onClick={isRunning ? () => handlePause() : () => handleStart()}
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
