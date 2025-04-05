interface ProgressBarProps {
  totalTime: string;
  startTime?: number;
  isRunning: boolean;
}

export const ProgressBar = ({ totalTime, startTime, isRunning }: ProgressBarProps) => {
  const calculateProgress = () => {
    if (isRunning && startTime) {
      const [totalMinutes, totalSeconds] = totalTime.split(":").map(Number);
      const totalTotalSeconds = totalMinutes * 60 + totalSeconds;

      const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
      const progress = (elapsedSeconds / totalTotalSeconds) * 100;

      return Math.min(Math.max(progress, 0), 100);
    }
    return 0; // when not running, show empty progress
  };

  const progress = calculateProgress();

  return (
    <div className="h-2 w-full rounded-full bg-gray-200">
      <div
        className="bg-primary h-full rounded-full transition-all"
        style={{
          width: `${progress}%`,
          transition: isRunning ? "width 0.1s linear" : "width 0.5s ease-out",
        }}
      />
    </div>
  );
};
