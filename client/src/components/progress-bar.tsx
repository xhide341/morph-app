interface ProgressBarProps {
  currentTime: string;
  totalTime: string;
}

export const ProgressBar = ({ currentTime, totalTime }: ProgressBarProps) => {
  const calculateProgress = () => {
    const [currentMinutes, currentSeconds] = currentTime.split(":").map(Number);
    const [totalMinutes, totalSeconds] = totalTime.split(":").map(Number);

    const currentTotalSeconds = currentMinutes * 60 + currentSeconds;
    const totalTotalSeconds = totalMinutes * 60 + totalSeconds;

    // Reverse the calculation to show progress increasing
    return 100 - (currentTotalSeconds / totalTotalSeconds) * 100;
  };

  return (
    <div className="h-2 w-full rounded-full bg-gray-200">
      <div
        className="bg-primary h-full rounded-full transition-all duration-1000"
        style={{ width: `${calculateProgress()}%` }}
      />
    </div>
  );
};
