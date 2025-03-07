import { useState } from "react";
import { ArrowLeft } from "react-feather";

export const Navigation = () => {
  const [isSwitching, setIsSwitching] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-row items-center justify-center gap-2">
        {isSwitching && (
          <button
            className="css-button-3d w-12 p-2"
            onClick={() => setIsSwitching(false)}
          >
            <ArrowLeft size={20} />
          </button>
        )}
        <div className={`${!isSwitching ? "flex" : "hidden"} w-full`}>
          <button
            className="css-button-3d text-primary w-32 p-2 text-sm"
            onClick={() => setIsSwitching(true)}
          >
            Switch Timer
          </button>
          <div className="bg-primary mx-2 h-full w-[2px] rounded-full"></div>
          <button
            className="css-button-3d text-primary w-32 p-2 text-sm"
            onClick={() => setIsSwitching(false)}
          >
            Take a Break
          </button>
        </div>

        <div
          className={`${
            isSwitching ? "flex" : "hidden"
          } flex h-full w-full flex-row items-center justify-center gap-2`}
        >
          <button className="css-button-3d w-20 p-2">55:00</button>
          <button className="css-button-3d w-20 p-2">25:00</button>
          <div className="bg-primary mx-2 h-full w-[2px] rounded-full"></div>
          <button className="css-button-3d w-20 p-2">5:00</button>
          <button className="css-button-3d w-20 p-2">15:00</button>
        </div>
      </div>
    </div>
  );
};

export default Navigation;
