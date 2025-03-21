import { useParams } from "react-router-dom";
import { useActivityTracker } from "../hooks/use-activity-tracker";
import { useUserInfo } from "../contexts/user-context";
import { useEffect } from "react";
import { wsService } from "server/services/websocket-service";

import { Clock } from "../components/clock";
import { Header } from "../components/header";
import { ThemeToggle } from "../components/theme-toggle";
import { ActivityLog } from "../components/activity-log";

export const RoomPage = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const { userName } = useUserInfo();
  const { activities, addActivity } = useActivityTracker(roomId || "");
  const latestActivity = activities[activities.length - 1];

  useEffect(() => {
    if (!roomId || !userName) return;

    let isActive = true;

    // Remove WebSocket connection - it's handled by useWebSocket now
    const joinTimeout = setTimeout(() => {
      if (isActive && wsService.getSocket()?.readyState === WebSocket.OPEN) {
        addActivity({
          type: "join",
          userName,
          roomId,
        });
      }
    }, 300);

    return () => {
      isActive = false;
      clearTimeout(joinTimeout);
    };
  }, [roomId, userName]);

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
