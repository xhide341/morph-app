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
    // If we have startTime and timer is running, use elapsed time for smoother progress
    if (isRunning && startTime) {
      const [totalMinutes, totalSeconds] = totalTime.split(":").map(Number);
      const totalTotalSeconds = totalMinutes * 60 + totalSeconds;

      const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
      const progress = (elapsedSeconds / totalTotalSeconds) * 100;

      return Math.min(Math.max(progress, 0), 100);
    }

    // Otherwise use the current time display
    const [currentMinutes, currentSeconds] = currentTime.split(":").map(Number);
    const [totalMinutes, totalSeconds] = totalTime.split(":").map(Number);

    const currentTotalSeconds = currentMinutes * 60 + currentSeconds;
    const totalTotalSeconds = totalMinutes * 60 + totalSeconds;

    return 100 - (currentTotalSeconds / totalTotalSeconds) * 100;
  };

  return (
    <div className="h-2 w-full rounded-full bg-gray-200">
      <div
        className="bg-primary h-full rounded-full transition-all"
        style={{
          width: `${calculateProgress()}%`,
          transition: isRunning ? "width 0.1s linear" : "width 0.5s ease-out",
        }}
      />
    </div>
  );
};
