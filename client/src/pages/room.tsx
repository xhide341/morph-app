import { useParams } from "react-router-dom";
import { useUserInfo } from "../contexts/user-context";
import { useEffect, useState, useRef } from "react";
import { useRoom } from "../hooks/use-room";
import { RoomActivity, RoomUser } from "server/types/room";
import { useActivityTracker } from "../hooks/use-activity-tracker";
import { socketService } from "../services/socket-service";

import { Clock } from "../components/clock";
import { Header } from "../components/header";
import { ActivityLog } from "../components/activity-log";
import { UserDisplay } from "../components/user-display";
import { UserModal } from "../components/user-modal";

export const RoomPage = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const { userName, setUserName, clearUserName } = useUserInfo();
  const { roomUsers, joinRoom } = useRoom(roomId);
  const { activities, addActivity } = useActivityTracker(roomId);
  const [showModal, setShowModal] = useState(!userName);

  useEffect(() => {
    if (!roomId || !userName) return;

    try {
      socketService.connect(roomId, userName);
    } catch (error) {
      console.error("[RoomPage] Error joining room:", error);
    }

    return () => {
      socketService.disconnect();
    };
  }, [roomId, userName]);

  // this is passed as prop to Clock component
  // addActivity is used to update local state
  // socketservice emission happens here
  const handleNewActivity = (activity: Omit<RoomActivity, "timeStamp" | "id">) => {
    if (!roomId) return;

    const newActivity = addActivity(activity);
    if (!newActivity) return;
    console.log("[handleNewActivity] Emitting activity:", newActivity.type);

    socketService.emit("activity", newActivity);
  };

  const handleJoinRoom = async (name: string) => {
    if (!roomId) return;
    const joined = await joinRoom(roomId, name);
    if (!joined) return;
    setUserName(name);
    setShowModal(false);
  };

  const handleSkip = async () => {
    if (!roomId) return;
    const joined = await joinRoom(roomId, "user");
    if (!joined) return;
    setUserName("user");
    setShowModal(false);
  };

  // get latest timer-related activity and sort by timestamp
  const latestTimerActivity = activities.length
    ? (() => {
        const timerActivities = activities.filter((activity: RoomActivity) =>
          ["start_timer", "pause_timer", "change_timer", "reset_timer"].includes(activity.type),
        );
        return timerActivities.sort(
          (a, b) => new Date(b.timeStamp).getTime() - new Date(a.timeStamp).getTime(),
        )[0];
      })()
    : null;

  return (
    <div className="relative mx-auto flex h-dvh max-h-dvh w-full max-w-2xl flex-col bg-[var(--color-background)] p-4 text-[var(--color-foreground)]">
      <UserModal isOpen={showModal} onJoin={handleJoinRoom} onSkip={handleSkip} />
      <Header />
      <div className="mx-auto flex w-full max-w-3xl flex-col">
        <Clock latestActivity={latestTimerActivity} onActivityCreated={handleNewActivity} />
      </div>
      <div className="mt-4">{roomId && <ActivityLog activities={activities} />}</div>
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2">
        {roomId && <UserDisplay users={roomUsers} roomId={roomId} />}
      </div>
    </div>
  );
};
