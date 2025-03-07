import { useState } from "react";
import { Play, Pause, RotateCcw } from "react-feather";
import { useQuote } from "../hooks/useQuote";
import { Navigation } from "./navigation";

export const Clock = () => {
  const [time, setTime] = useState("25:00");
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(
    null,
  );
  const [isRunning, setIsRunning] = useState(false);

  const { quote, author } = useQuote();

  const handleStart = () => {
    if (timerInterval) {
      return;
    }

    const newInterval = setInterval(() => {
      setTime((prevTime) => {
        // Split the time into minutes and seconds
        const [minutes, seconds] = prevTime.split(":");
        if (minutes === "00" && seconds === "00") {
          clearInterval(newInterval);
          return "25:00";
        }

        const newSeconds = parseInt(seconds) - 1;
        const newMinutes =
          newSeconds < 0 ? parseInt(minutes) - 1 : parseInt(minutes);

        return `${String(newMinutes).padStart(2, "0")}:${newSeconds < 0 ? "59" : String(newSeconds).padStart(2, "0")}`;
      });
    }, 1000);

    setIsRunning(true);

    setTimerInterval(newInterval);
  };

  const handlePause = () => {
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
    setIsRunning(false);
  };

  const handleReset = () => {
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
    setTime("25:00");
    setIsRunning(false);
  };

  return (
    <div className="bg-secondary flex flex-col items-center justify-center rounded-xl p-10">
      <Navigation />
      <div className="flex flex-col items-center justify-center">
        <h1 className="text-[8rem] font-bold">{time}</h1>
        <div className="flex flex-row justify-center gap-4 text-center text-2xl">
          <button
            aria-label={isRunning ? "Pause" : "Start"}
            className={`css-button-3d w-24 p-4 ${isRunning ? "pressed" : ""}`}
            onClick={isRunning ? handlePause : handleStart}
          >
            {isRunning ? <Pause size={24} /> : <Play size={24} />}
            {/* {isRunning ? "Pause" : "Start"} */}
          </button>
          <button
            aria-label="Reset"
            className="css-button-3d w-24 p-4"
            onClick={handleReset}
          >
            <RotateCcw size={24} />
          </button>
        </div>
        <div className="mt-6 flex flex-col items-center justify-center">
          <blockquote className="font-base text-sm">"{quote}"</blockquote>
          <p className="self-end text-sm font-semibold italic">{author}</p>
        </div>
      </div>
    </div>
  );
};

export default Clock;
