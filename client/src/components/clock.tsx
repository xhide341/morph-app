import { useState, useEffect } from "react";
import { useQuote } from "../hooks/use-quote";
import { useParams, useNavigate } from "react-router-dom";
import { RoomActivity } from "server/types/room";
import { useUserInfo } from "../contexts/user-context";

import { Play, Pause, RotateCcw } from "react-feather";
import { Navigation } from "./navigation";
import { ProgressBar } from "./progress-bar";

type TimerMode = "work" | "break";

// TODO: Fix progress bar length relying on quote length

export const Clock = ({
  latestActivity,
  onActivityCreated,
}: {
  latestActivity: RoomActivity | null;
  onActivityCreated: (activity: Omit<RoomActivity, "id" | "timeStamp">) => void;
}) => {
  const { roomId } = useParams<{ roomId: string }>();
  const { userName } = useUserInfo();
  const navigate = useNavigate();
  const { quote, author } = useQuote();
  // centralized timer state management
  const [timerState, setTimerState] = useState({
    time: "25:00",
    mode: "work" as TimerMode,
    isRunning: false,
    startTime: 0,
    totalSeconds: 25 * 60,
  });
  // store last used times for work/break modes
  const [lastWorkTime, setLastWorkTime] = useState("25:00");
  const [lastBreakTime, setLastBreakTime] = useState("05:00");
  // interval reference for cleanup
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);
  // flag to prevent activity broadcast during sync
  const [isSync, setIsSync] = useState(false);

  if (!roomId) {
    navigate("/session");
    return null;
  }

  const handleTimerChange = (minutes: number, mode: TimerMode, isSync: boolean = false) => {
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }

    const newTime = `${String(minutes).padStart(2, "0")}:00`;
    setTimerState((prev) => ({
      ...prev,
      time: newTime,
      mode,
      isRunning: false,
      totalSeconds: minutes * 60,
    }));

    if (mode === "work") {
      setLastWorkTime(newTime);
    } else {
      setLastBreakTime(newTime);
    }

    if (!isSync) {
      onActivityCreated({
        type: "change_timer",
        userName,
        roomId,
        timeRemaining: newTime,
        timerMode: mode,
      });
    }
  };

  const handleStart = (isSync: boolean = false) => {
    if (timerInterval) return;

    if (isSync && latestActivity) {
      // Calculate precise elapsed time since activity was created
      const activityTime = new Date(latestActivity.timeStamp).getTime();
      const [min, sec] = (latestActivity.timeRemaining || "00:00").split(":").map(Number);
      const originalSeconds = min * 60 + sec;
      const elapsedMs = Date.now() - activityTime;
      const elapsedSeconds = Math.floor(elapsedMs / 1000);
      const remainingSeconds = Math.max(0, originalSeconds - elapsedSeconds);

      setTimerState((prev) => ({
        ...prev,
        time: latestActivity.timeRemaining || prev.time,
        mode: latestActivity.timerMode || prev.mode,
        isRunning: remainingSeconds > 0,
        startTime: activityTime,
        totalSeconds: originalSeconds,
      }));
    } else {
      // Normal start for initiating client
      const startTime = Date.now();
      const [min, sec] = timerState.time.split(":").map(Number);
      const totalSeconds = min * 60 + sec;

      if (totalSeconds <= 0) {
        const resetTime = timerState.mode === "work" ? lastWorkTime : lastBreakTime;
        const [min, sec] = resetTime.split(":").map(Number);
        const resetSeconds = min * 60 + sec;

        setTimerState((prev) => ({
          ...prev,
          time: resetTime,
          mode: latestActivity?.timerMode || prev.mode,
          totalSeconds: resetSeconds,
          isRunning: false,
        }));
        return;
      }

      setTimerState((prev) => ({
        ...prev,
        isRunning: true,
        startTime,
        totalSeconds,
      }));
    }

    if (!isSync) {
      onActivityCreated({
        type: "start_timer",
        userName,
        roomId,
        timeRemaining: timerState.time,
        timerMode: timerState.mode,
      });
    }
  };

  const handlePause = (isSync: boolean = false) => {
    if (timerInterval && timerState.isRunning) {
      clearInterval(timerInterval);
      setTimerInterval(null);
      setTimerState((prev) => ({ ...prev, isRunning: false }));

      if (!isSync) {
        onActivityCreated({
          type: "pause_timer",
          userName,
          roomId,
          timeRemaining: timerState.time,
          timerMode: timerState.mode,
        });
      }
    }
  };

  const handleReset = (isSync: boolean = false) => {
    if (timerInterval && timerState.isRunning) {
      clearInterval(timerInterval);
      setTimerInterval(null);

      const resetTime = timerState.mode === "work" ? lastWorkTime : lastBreakTime;
      setTimerState((prev) => ({
        ...prev,
        time: resetTime,
        isRunning: false,
      }));

      if (!isSync) {
        onActivityCreated({
          type: "reset_timer",
          userName,
          roomId,
          timeRemaining: resetTime,
          timerMode: timerState.mode,
        });
      }
    }
  };

  // sync effect
  useEffect(() => {
    if (!roomId || !latestActivity) return;

    console.log("[Clock] Syncing with activity:", latestActivity);

    switch (latestActivity.type) {
      case "start_timer":
        setTimerState((prev) => ({
          ...prev,
          time: latestActivity.timeRemaining || prev.time,
          mode: latestActivity.timerMode || prev.mode,
        }));
        handleStart(true);
        break;

      case "pause_timer":
        setTimerState((prev) => ({
          ...prev,
          time: latestActivity.timeRemaining || prev.time,
        }));
        handlePause(true);
        break;

      case "change_timer":
        const minutes = parseInt(latestActivity.timeRemaining?.split(":")[0] || "25");
        handleTimerChange(minutes, latestActivity.timerMode || "work", true);
        break;

      case "reset_timer":
        handleReset(true);
        break;
    }
  }, [latestActivity, roomId]);

  // timer effect
  useEffect(() => {
    if (!timerState.isRunning) return;

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - timerState.startTime) / 1000);
      const remaining = Math.max(0, timerState.totalSeconds - elapsed);

      const newMinutes = Math.floor(remaining / 60);
      const newSeconds = remaining % 60;
      const newTime = `${String(newMinutes).padStart(2, "0")}:${String(newSeconds).padStart(2, "0")}`;

      setTimerState((prev) => ({ ...prev, time: newTime }));

      if (remaining <= 0) {
        clearInterval(interval);
        setTimerInterval(null);
        setTimerState((prev) => ({ ...prev, isRunning: false }));

        if (!isSync) {
          onActivityCreated({
            type: "complete_timer",
            userName,
            roomId,
            timeRemaining: "00:00",
            timerMode: timerState.mode,
          });
        }
      }
    }, 100);

    setTimerInterval(interval);
    return () => clearInterval(interval);
  }, [timerState.isRunning, timerState.startTime, timerState.totalSeconds]);

  return (
    <div
      className={`${
        timerState.mode === "work" ? "bg-secondary" : "bg-secondary/80"
      } flex flex-col items-center justify-center rounded-xl p-10`}
    >
      <Navigation onTimerChange={handleTimerChange} />
      <div className="flex flex-col items-center justify-center">
        <h1 className="font-roboto font-bold not-visited:text-[8rem]">{timerState.time}</h1>
        <div className="flex flex-row justify-center gap-4 text-center text-2xl">
          <button
            aria-label={timerState.isRunning ? "Pause" : "Start"}
            className={`css-button-3d w-24 p-4 ${timerState.isRunning ? "pressed" : ""}`}
            onClick={timerState.isRunning ? () => handlePause(false) : () => handleStart(false)}
          >
            {timerState.isRunning ? <Pause size={24} /> : <Play size={24} />}
          </button>
          <button
            aria-label="Reset"
            className="css-button-3d w-24 p-4"
            onClick={() => handleReset(false)}
          >
            <RotateCcw size={24} />
          </button>
        </div>
        <div className="mt-12 w-full">
          <ProgressBar
            totalTime={timerState.mode === "work" ? lastWorkTime : lastBreakTime}
            startTime={timerState.isRunning ? timerState.startTime : undefined}
            isRunning={timerState.isRunning}
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
