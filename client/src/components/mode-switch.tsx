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
    <div className="flex flex-col gap-2">
      <div className="flex flex-row items-center justify-center gap-2">
        {isSwitchingTimer || isTakingBreak ? (
          <button
            className="css-button-3d w-12 p-2"
            onClick={() => {
              playSound("reset");
              setIsSwitchingTimer(false);
              setIsTakingBreak(false);
            }}
          >
            <ArrowLeft size={20} />
          </button>
        ) : null}
        {/* Switch Timer and Take a Break */}
        <div className={`${!isSwitchingTimer && !isTakingBreak ? "flex" : "hidden"} w-full`}>
          <button
            className="css-button-3d text-primary w-32 p-2 text-sm"
            onClick={() => {
              playSound("pause");
              setIsSwitchingTimer(true);
            }}
          >
            Switch Timer
          </button>
          <div className="bg-primary mx-2 h-full w-[2px] rounded-full"></div>
          <button
            className="css-button-3d text-primary w-32 p-2 text-sm"
            onClick={() => {
              playSound("pause");
              setIsSwitchingTimer(false);
              setIsTakingBreak(true);
            }}
          >
            Take a Break
          </button>
        </div>

        {/* Switching Timer */}
        <div
          className={`${
            isSwitchingTimer ? "flex" : "hidden"
          } h-full w-full flex-row items-center justify-center gap-2`}
        >
          <button
            className="css-button-3d w-20 p-2"
            onClick={() => {
              playSound("start");
              onTimerChange(25, "work");
              setIsSwitchingTimer(false);
            }}
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
          >
            55:00
          </button>
        </div>

        {/* Take a Break */}
        <div
          className={`${
            isTakingBreak ? "flex" : "hidden"
          } h-full w-full flex-row items-center justify-center gap-2`}
        >
          <button
            className="css-button-3d w-20 p-2"
            onClick={() => {
              playSound("start");
              onTimerChange(5, "break");
              setIsTakingBreak(false);
            }}
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
          >
            15:00
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModeSwitch;
