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
    if (!roomId || !userName) return;

    let isInitialMount = true;
    // add join activity when component mounts
    addActivity({
      type: "join",
      userName,
      roomId,
      timeRemaining: "25:00",
      timerMode: "work",
    });

    // cleanup - add leave activity when component unmounts
    return () => {
      if (isInitialMount) {
        isInitialMount = false;
        return;
      }
      addActivity({
        type: "leave",
        userName,
        roomId,
        timeRemaining: "25:00",
        timerMode: "work",
      });
    };
  }, [roomId, userName, addActivity]);

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
