import { useParams } from "react-router-dom";
import { useUserInfo } from "../contexts/user-context";
import { useEffect } from "react";
import { useRoom } from "../hooks/use-room";
import { RoomActivity } from "server/types/room";

import { Clock } from "../components/clock";
import { Header } from "../components/header";
import { ThemeToggle } from "../components/theme-toggle";
import { ActivityLog } from "../components/activity-log";

export const RoomPage = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const { userName } = useUserInfo();
  const { activities, addActivity } = useRoom(roomId);

  // get latest timer-related activity
  const latestTimerActivity = activities.length
    ? activities
        .filter((activity: RoomActivity) =>
          [
            "start_timer",
            "pause_timer",
            "change_timer",
            "reset_timer",
          ].includes(activity.type),
        )
        .pop()
    : null;

  useEffect(() => {
    console.log("[Room] Latest timer activity:", latestTimerActivity);
  }, [latestTimerActivity]);

  return (
    <div className="font-roboto mx-auto flex h-dvh w-full max-w-2xl flex-col bg-[var(--color-background)] p-4 text-[var(--color-foreground)]">
      <Header />
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="mx-auto flex w-full max-w-3xl flex-col">
        <Clock
          addActivity={addActivity}
          latestActivity={latestTimerActivity || null}
        />
      </div>
      {roomId && <ActivityLog activities={activities} />}
    </div>
  );
};
