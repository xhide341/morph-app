import { useParams } from "react-router-dom";
import { useActivityTracker } from "../hooks/use-activity-tracker";
import { useUserInfo } from "../contexts/user-context";
import { useRoom } from "../hooks/use-room";
import { useEffect, useState } from "react";

import { Clock } from "../components/clock";
import { Header } from "../components/header";
import { ThemeToggle } from "../components/theme-toggle";
import { ActivityLog } from "../components/activity-log";

export const RoomPage = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const { userName } = useUserInfo();
  const { removeUserFromRoom } = useRoom();
  const { activities, addActivity } = useActivityTracker(roomId || "");
  const [forceRender, setForceRender] = useState(0);
  const latestActivity = activities[activities.length - 1];

  useEffect(() => {
    if (!roomId || !userName) return;
    console.log("Effect triggered", { roomId, userName });

    addActivity({
      type: "join",
      userName,
      roomId,
    });

    return () => {
      addActivity({
        type: "leave",
        userName,
        roomId,
      });
      removeUserFromRoom(roomId, userName);
    };
  }, [roomId, userName, forceRender]);

  return (
    <div className="font-roboto mx-auto flex h-dvh w-full max-w-2xl flex-col bg-[var(--color-background)] p-4 text-[var(--color-foreground)]">
      <Header />
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="mx-auto flex w-full max-w-3xl flex-col">
        <Clock addActivity={addActivity} latestActivity={latestActivity} />
      </div>
      <button onClick={() => setForceRender((prev) => prev + 1)}>
        Trigger Effect
      </button>
      {roomId && <ActivityLog activities={activities} />}
    </div>
  );
};
