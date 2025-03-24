import { useParams } from "react-router-dom";
import { useUserInfo } from "../contexts/user-context";
import { useEffect } from "react";
import { useRoom } from "../hooks/use-room";

import { Clock } from "../components/clock";
import { Header } from "../components/header";
import { ThemeToggle } from "../components/theme-toggle";
import { ActivityLog } from "../components/activity-log";

export const RoomPage = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const { userName } = useUserInfo();
  const { activities, addActivity } = useRoom(roomId);
  const latestActivity = activities[activities.length - 1];

  useEffect(() => {
    console.log("[Room] Activities updated:", activities);
  }, [activities]);

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
