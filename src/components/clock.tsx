import { useState } from "react";

export const Clock = () => {
  const [time, setTime] = useState("25:00");
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(
    null,
  );

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

    setTimerInterval(newInterval);
  };

  const handleStop = () => {
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
  };

  const handleReset = () => {
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
    setTime("25:00");
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
        <div className="flex flex-row gap-2 text-xl">
          <button
            className="rounded-md bg-blue-500 p-2 text-white hover:scale-105 hover:cursor-pointer"
            onClick={handleStart}
          >
            Start
          </button>
          <button
            className="rounded-md bg-red-500 p-2 text-white hover:scale-105 hover:cursor-pointer"
            onClick={handleStop}
          >
            Stop
          </button>
          <button
            className="rounded-md bg-green-500 p-2 text-white hover:scale-105 hover:cursor-pointer"
            onClick={handleReset}
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};

export default Clock;
