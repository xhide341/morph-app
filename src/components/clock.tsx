import { useState } from "react";
import { Play, Pause, RotateCcw } from "react-feather";

export const Clock = () => {
  const [time, setTime] = useState("25:00");
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(
    null,
  );
  const [isRunning, setIsRunning] = useState(false);

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
    <div className="flex flex-col items-center justify-center">
      <div className="flex flex-col items-center justify-center">
        <h1 className="text-[8rem] font-bold">{time}</h1>
        <div className="flex flex-row gap-2 text-center text-2xl">
          <button
            aria-label={isRunning ? "Pause" : "Start"}
            className={`flex w-[8rem] items-center gap-2 rounded-md px-4 py-2 text-white transition-all duration-200 ease-in-out hover:cursor-pointer ${
              isRunning
                ? "scale-95 transform bg-green-600 shadow-inner"
                : "bg-blue-600 hover:scale-[0.98] active:scale-95"
            }`}
            onClick={isRunning ? handlePause : handleStart}
          >
            {isRunning ? <Pause size={24} /> : <Play size={24} />}
            {isRunning ? "Pause" : "Start"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Clock;
