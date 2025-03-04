import { useState } from "react";

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
      <nav className="flex flex-row gap-4">
        <ul className="flex flex-row gap-4">
          <li>
            <a href="/">Pomodoro</a>
          </li>
          <li>
            <a href="/">Short Break</a>
          </li>
          <li>
            <a href="/">Long Break</a>
          </li>
        </ul>
      </nav>
      <div className="flex flex-col items-center justify-center">
        <h1 className="text-[8rem] font-bold">{time}</h1>
        <div className="flex flex-row gap-2 text-center text-3xl">
          <button
            aria-label={isRunning ? "Pause" : "Start"}
            className={`rounded-md px-4 py-2 text-white hover:scale-105 hover:cursor-pointer ${
              isRunning ? "bg-red-500" : "bg-blue-500"
            }`}
            onClick={isRunning ? handlePause : handleStart}
          >
            {isRunning ? "Pause" : "Start"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Clock;
