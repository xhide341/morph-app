import { Clock } from "../components/clock";
import { ThemeToggle } from "../components/theme-toggle";
import { useParams } from "react-router-dom";
import { Header } from "../components/header";
import { ActivityLog } from "../components/activity-log";
import { useRoomActivity } from "../hooks/use-room-activity";

export const RoomPage = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const { activities, addActivity } = useRoomActivity(roomId || "");
  const latestActivity = activities[activities.length - 1];

  return (
    <div className="font-roboto mx-auto flex h-dvh w-full max-w-2xl flex-col bg-[var(--color-background)] p-4 text-[var(--color-foreground)]">
      <Header />
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="mx-auto flex w-full max-w-3xl flex-col">
        <Clock addActivity={addActivity} latestActivity={latestActivity} />
      </div>
      {roomId && <ActivityLog activities={activities} />}
    </div>
  );
};
