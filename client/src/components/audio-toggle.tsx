import { useState } from "react";

import { setVolume } from "../utils/audio";

interface AudioToggleProps {
  className?: string;
  initialMuted?: boolean;
  onToggle?: (isMuted: boolean) => void;
  size?: number;
}

export default function AudioToggle({
  className,
  initialMuted = false,
  onToggle,
  size = 16,
}: AudioToggleProps) {
  const [isMuted, setIsMuted] = useState(initialMuted);

  const handleToggle = () => {
    const newMutedState = !isMuted;
    setVolume(newMutedState ? 0 : 0.1);
    setIsMuted(newMutedState);
    onToggle?.(newMutedState);
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={`bg-primary text-background hover:bg-primary/90 data-[focus]:outline-foreground flex cursor-pointer items-center justify-center gap-1 rounded-md px-4 py-2 text-sm focus:outline-none data-[focus]:outline-1 ${className || ""}`}
      aria-label={isMuted ? "Unmute" : "Mute"}
    >
      <div className="relative">
        {isMuted ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
          >
            <path
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M16 9a5 5 0 0 1 .95 2.293m2.414-5.657a9 9 0 0 1 1.889 9.96M2 2l20 20M7 7l-.587.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298V11M9.828 4.172A.686.686 0 0 1 11 4.657v.686"
            />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
          >
            <path
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298zM16 9a5 5 0 0 1 0 6m3.364 3.364a9 9 0 0 0 0-12.728"
            />
          </svg>
        )}
      </div>
    </button>
  );
}
