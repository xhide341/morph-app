import { useEffect, useRef, useState } from "react";
import { Pause, Play, RotateCcw } from "react-feather";
import { useNavigate, useParams } from "react-router-dom";
import { RoomActivity } from "server/types/room";

import { useUserInfo } from "../contexts/user-context";
import { useQuote } from "../hooks/use-quote";
import { playSound } from "../utils/audio";
import ModeSwitch from "./mode-switch";
import { ProgressBar } from "./progress-bar";

type TimerMode = "work" | "break";

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
    elapsedSeconds: 0,
  });
  // store last used times for work/break modes
  const [lastWorkTime, setLastWorkTime] = useState("25:00");
  const [lastBreakTime, setLastBreakTime] = useState("05:00");
  // interval reference for cleanup
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(
    null,
  );
  // flag to prevent activity broadcast during sync
  const [isSync, setIsSync] = useState(false);
  // ref for live region announcements (aria attributes)
  const liveRegionRef = useRef<HTMLDivElement>(null);

  if (!roomId) {
    navigate("/session");
    return null;
  }

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

    // update last used times for work/break modes
    if (mode === "work") {
      setLastWorkTime(newTime);
    } else {
      setLastBreakTime(newTime);
    }

    setTimerState((prev) => ({
      ...prev,
      time: newTime,
      mode,
      isRunning: false,
      totalSeconds: minutes * 60,
    }));

    // announce timer change to screen readers
    if (liveRegionRef.current) {
      liveRegionRef.current.textContent = `Timer set to ${minutes} minutes in ${mode} mode`;
    }

    if (!isSync) {
      onActivityCreated({
        type: "change_timer",
        userName,
        roomId,
        timeRemaining: newTime,
        timerMode: mode,
        lastWorkTime: mode === "work" ? newTime : lastWorkTime,
        lastBreakTime: mode === "break" ? newTime : lastBreakTime,
      });
    }
  };

  const handleStart = (isSync: boolean = false) => {
    if (timerInterval) return;

    if (!isSync) {
      playSound("start");
    }

    if (isSync && latestActivity) {
      const activityTime = new Date(latestActivity.timeStamp).getTime();
      const [min, sec] = (latestActivity.timeRemaining || "00:00")
        .split(":")
        .map(Number);
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
        elapsedSeconds,
      }));
    } else {
      const startTime = Date.now();
      const [min, sec] = timerState.time.split(":").map(Number);
      const totalSeconds = min * 60 + sec;

      if (totalSeconds <= 0) {
        const resetTime =
          timerState.mode === "work" ? lastWorkTime : lastBreakTime;
        const [min, sec] = resetTime.split(":").map(Number);
        const resetSeconds = min * 60 + sec;

        setTimerState((prev) => ({
          ...prev,
          time: resetTime,
          mode: latestActivity?.timerMode || prev.mode,
          totalSeconds: resetSeconds,
          isRunning: false,
          elapsedSeconds: 0,
        }));
        return;
      }

      setTimerState((prev) => ({
        ...prev,
        isRunning: true,
        startTime,
        totalSeconds,
        elapsedSeconds: prev.elapsedSeconds,
      }));
    }

    // announce timer start to screen readers
    if (liveRegionRef.current) {
      liveRegionRef.current.textContent = `Timer started in ${timerState.mode} mode`;
    }

    if (!isSync) {
      onActivityCreated({
        type: "start_timer",
        userName,
        roomId,
        timeRemaining: timerState.time,
        timerMode: timerState.mode,
        lastWorkTime,
        lastBreakTime,
      });
    }
  };

  const handlePause = (isSync: boolean = false) => {
    if (timerInterval && timerState.isRunning) {
      clearInterval(timerInterval);
      setTimerInterval(null);

      const currentElapsed = Math.floor(
        (Date.now() - timerState.startTime) / 1000,
      );
      setTimerState((prev) => ({
        ...prev,
        isRunning: false,
        elapsedSeconds: prev.elapsedSeconds + currentElapsed,
      }));

      // announce timer pause to screen readers
      if (liveRegionRef.current) {
        liveRegionRef.current.textContent = `Timer paused at ${timerState.time}`;
      }

      if (!isSync) {
        playSound("pause");
        onActivityCreated({
          type: "pause_timer",
          userName,
          roomId,
          timeRemaining: timerState.time,
          timerMode: timerState.mode,
          lastWorkTime,
          lastBreakTime,
        });
      }
    }
  };

  const handleReset = (isSync: boolean = false) => {
    if (timerInterval && timerState.isRunning) {
      clearInterval(timerInterval);
      setTimerInterval(null);

      const resetTime =
        timerState.mode === "work" ? lastWorkTime : lastBreakTime;
      setTimerState((prev) => ({
        ...prev,
        time: resetTime,
        isRunning: false,
      }));

      // announce timer reset to screen readers
      if (liveRegionRef.current) {
        liveRegionRef.current.textContent = `Timer reset to ${resetTime}`;
      }

      if (!isSync) {
        playSound("pause");

        onActivityCreated({
          type: "reset_timer",
          userName,
          roomId,
          timeRemaining: resetTime,
          timerMode: timerState.mode,
          lastWorkTime,
          lastBreakTime,
        });
      }
    }
  };

  // sync for user actions
  useEffect(() => {
    if (!roomId || !latestActivity) return;

    if (latestActivity.lastWorkTime) {
      setLastWorkTime(latestActivity.lastWorkTime);
    }
    if (latestActivity.lastBreakTime) {
      setLastBreakTime(latestActivity.lastBreakTime);
    }

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
        const minutes = parseInt(
          latestActivity.timeRemaining?.split(":")[0] || "25",
        );
        handleTimerChange(minutes, latestActivity.timerMode || "work", true);
        break;

      case "reset_timer":
        handleReset(true);
        break;
    }
  }, [latestActivity, roomId]);

  // sync for timer
  useEffect(() => {
    if (!timerState.isRunning) return;

    const interval = setInterval(() => {
      const currentElapsed = Math.floor(
        (Date.now() - timerState.startTime) / 1000,
      );
      const totalElapsed = timerState.elapsedSeconds + currentElapsed;
      const remaining = Math.max(0, timerState.totalSeconds - totalElapsed);

      const newMinutes = Math.floor(remaining / 60);
      const newSeconds = remaining % 60;
      const newTime = `${String(newMinutes).padStart(2, "0")}:${String(newSeconds).padStart(2, "0")}`;

      setTimerState((prev) => ({ ...prev, time: newTime }));

      if (remaining <= 0) {
        clearInterval(interval);
        setTimerInterval(null);
        setTimerState((prev) => ({
          ...prev,
          isRunning: false,
          elapsedSeconds: 0,
        }));

        playSound("complete");

        // announce timer completion to screen readers
        if (liveRegionRef.current) {
          liveRegionRef.current.textContent = `${timerState.mode === "work" ? "Work" : "Break"} timer completed`;
        }

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
  }, [
    timerState.isRunning,
    timerState.startTime,
    timerState.totalSeconds,
    timerState.elapsedSeconds,
  ]);

  // timer for document title
  useEffect(() => {
    const mode = timerState.mode === "work" ? "Work" : "Break";
    const status = timerState.isRunning ? "timer" : "paused";
    document.title = `${timerState.time} - ${mode} ${status}`;

    return () => {
      document.title = "morph | pomodoro app";
    };
  }, [timerState.time, timerState.mode, timerState.isRunning]);

  return (
    <div
      className={`${
        timerState.mode === "work" ? "bg-secondary" : "bg-secondary/80"
      } flex flex-col items-center justify-center rounded-xl p-10`}
      role="region"
      aria-label={`${timerState.mode === "work" ? "Work" : "Break"} timer`}
    >
      {/* Live region for screen reader announcements */}
      <div
        ref={liveRegionRef}
        className="sr-only"
        aria-live="polite"
        aria-atomic="true"
      ></div>

      <ModeSwitch onTimerChange={handleTimerChange} />
      <div className="flex flex-col items-center justify-center">
        <h1
          className="font-roboto text-pretty text-[4rem] font-bold md:text-[6rem] lg:text-[8rem]"
          aria-label={`${timerState.time} remaining`}
        >
          {timerState.time}
        </h1>
        <div
          className="flex flex-row justify-center gap-4 text-center text-2xl"
          role="group"
          aria-label="Timer controls"
        >
          <button
            aria-label={timerState.isRunning ? "Pause timer" : "Start timer"}
            className={`css-button-3d w-24 p-4 ${timerState.isRunning ? "pressed" : ""}`}
            onClick={
              timerState.isRunning
                ? () => handlePause(false)
                : () => handleStart(false)
            }
            aria-pressed={timerState.isRunning}
          >
            {timerState.isRunning ? (
              <Pause size={24} className="fill-background" aria-hidden="true" />
            ) : (
              <Play size={24} className="fill-background" aria-hidden="true" />
            )}
          </button>
          <button
            aria-label="Reset timer"
            className="css-button-3d w-24 p-4"
            onClick={() => handleReset(false)}
          >
            <RotateCcw size={24} aria-hidden="true" />
          </button>
        </div>
        <div className="mt-12 w-full max-w-md">
          <ProgressBar
            currentTime={timerState.time}
            totalTime={
              timerState.mode === "work" ? lastWorkTime : lastBreakTime
            }
            isRunning={timerState.isRunning}
          />
        </div>
        <div
          className="mt-12 flex flex-col items-center justify-center gap-3"
          role="complementary"
          aria-label="Daily quote"
        >
          <blockquote className="relative">
            <p className="w-full max-w-full text-center font-sans text-sm font-light leading-relaxed sm:max-w-md sm:px-2 md:px-4 lg:px-6">
              {quote}
            </p>
          </blockquote>
          <p className="font-base text-black-500 text-xs italic tracking-wide">
            — {author}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Clock;
