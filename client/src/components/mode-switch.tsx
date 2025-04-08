import { useState } from "react";
import { playSound } from "../utils/audio";

import { ArrowLeft } from "react-feather";

type TimerMode = "work" | "break";

interface ModeSwitchProps {
  onTimerChange: (minutes: number, mode: TimerMode) => void;
}

export const ModeSwitch = ({ onTimerChange }: ModeSwitchProps) => {
  const [isSwitchingTimer, setIsSwitchingTimer] = useState(false);
  const [isTakingBreak, setIsTakingBreak] = useState(false);

  return (
    <div className="flex flex-col gap-2" role="region" aria-label="Timer controls">
      <div className="flex flex-row items-center justify-center gap-2">
        {isSwitchingTimer || isTakingBreak ? (
          <button
            className="css-button-3d w-12 p-2"
            onClick={() => {
              playSound("reset");
              setIsSwitchingTimer(false);
              setIsTakingBreak(false);
            }}
            aria-label="Go back to main menu"
            title="Go back"
          >
            <ArrowLeft size={20} aria-hidden="true" />
          </button>
        ) : null}
        {/* Switch Timer and Take a Break */}
        <div
          className={`${!isSwitchingTimer && !isTakingBreak ? "flex items-center justify-center gap-6" : "hidden"} w-full`}
          role="group"
          aria-label="Timer options"
        >
          <button
            className="css-button-3d text-primary min-w-20 px-2 text-xs sm:w-32 sm:text-sm"
            onClick={() => {
              playSound("pause");
              setIsSwitchingTimer(true);
            }}
            aria-label="Switch timer duration"
            aria-expanded={isSwitchingTimer}
            aria-controls="timer-duration-options"
          >
            Switch Timer
          </button>
          <div className="bg-primary h-10 w-[2px] rounded-full opacity-50" aria-hidden="true"></div>
          <button
            className="css-button-3d text-primary min-w-20 px-2 text-xs sm:w-32 sm:text-sm"
            onClick={() => {
              playSound("pause");
              setIsSwitchingTimer(false);
              setIsTakingBreak(true);
            }}
            aria-label="Take a break"
            aria-expanded={isTakingBreak}
            aria-controls="break-duration-options"
          >
            Take a Break
          </button>
        </div>

        {/* Switching Timer */}
        <div
          id="timer-duration-options"
          className={`${
            isSwitchingTimer ? "flex" : "hidden"
          } h-full w-full flex-row items-center justify-center gap-2`}
          role="group"
          aria-label="Timer duration options"
        >
          <button
            className="css-button-3d w-20 p-2"
            onClick={() => {
              playSound("start");
              onTimerChange(25, "work");
              setIsSwitchingTimer(false);
            }}
            aria-label="Set timer to 25 minutes"
          >
            25:00
          </button>
          <button
            className="css-button-3d w-20 p-2"
            onClick={() => {
              playSound("start");
              onTimerChange(55, "work");
              setIsSwitchingTimer(false);
            }}
            aria-label="Set timer to 55 minutes"
          >
            55:00
          </button>
        </div>

        {/* Take a Break */}
        <div
          id="break-duration-options"
          className={`${
            isTakingBreak ? "flex" : "hidden"
          } h-full w-full flex-row items-center justify-center gap-2`}
          role="group"
          aria-label="Break duration options"
        >
          <button
            className="css-button-3d w-20 p-2"
            onClick={() => {
              playSound("start");
              onTimerChange(5, "break");
              setIsTakingBreak(false);
            }}
            aria-label="Take a 5 minute break"
          >
            5:00
          </button>
          <button
            className="css-button-3d w-20 p-2"
            onClick={() => {
              playSound("start");
              onTimerChange(15, "break");
              setIsTakingBreak(false);
            }}
            aria-label="Take a 15 minute break"
          >
            15:00
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModeSwitch;
