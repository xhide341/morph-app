interface ProgressBarProps {
  currentTime: string;
  totalTime: string;
  startTime?: number;
  isRunning?: boolean;
}

export const ProgressBar = ({
  currentTime,
  totalTime,
  startTime,
  isRunning = false,
}: ProgressBarProps) => {
  const calculateProgress = () => {
    // parse current and total times
    const [currentMinutes, currentSeconds] = currentTime.split(":").map(Number);
    const [totalMinutes, totalSeconds] = totalTime.split(":").map(Number);

    const currentTotalSeconds = currentMinutes * 60 + currentSeconds;
    const totalTotalSeconds = totalMinutes * 60 + totalSeconds;

    // calculate progress based on time remaining
    const progress = 100 - (currentTotalSeconds / totalTotalSeconds) * 100;
    return Math.min(Math.max(progress, 0), 100);
  };

  const progress = calculateProgress();
  const progressPercent = Math.round(progress);

  return (
    <div
      className="h-2 w-full rounded-full bg-gray-200"
      role="progressbar"
      aria-valuenow={progressPercent}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Timer progress: ${progressPercent}% complete`}
    >
      <div
        className="bg-primary h-full rounded-full transition-all"
        style={{
          width: `${progress}%`,
          transition: isRunning ? "width 0.1s linear" : "width 0.5s ease-out",
        }}
        aria-hidden="true"
      />
    </div>
  );
};
