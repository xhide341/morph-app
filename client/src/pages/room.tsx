import { useParams } from "react-router-dom";
import { useUserInfo } from "../contexts/user-context";
import { useEffect, useState } from "react";
import { useRoom } from "../hooks/use-room";
import { RoomActivity, RoomUser } from "server/types/room";

import { Clock } from "../components/clock";
import { Header } from "../components/header";
import { ActivityLog } from "../components/activity-log";
import { UserDisplay } from "../components/user-display";
import { UserModal } from "../components/user-modal";

export const RoomPage = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const { activities, addActivity, joinRoom, leaveRoom, roomUsers } =
    useRoom(roomId);
  const { userName, setUserName, clearUserName } = useUserInfo();
  const [showModal, setShowModal] = useState(!userName);

  // add debugging for activities
  useEffect(() => {
    console.log("[RoomPage] Activities updated:", activities.length);
    console.log("[RoomPage] Current activities:", activities);
  }, [activities]);

  // get latest timer-related activity and sort by timestamp
  const latestTimerActivity = activities.length
    ? (() => {
        const timerActivities = activities.filter((activity: RoomActivity) =>
          [
            "start_timer",
            "pause_timer",
            "change_timer",
            "reset_timer",
          ].includes(activity.type),
        );
        return timerActivities.sort(
          (a, b) =>
            new Date(b.timeStamp).getTime() - new Date(a.timeStamp).getTime(),
        )[0];
      })()
    : null;

  const handleJoinRoom = async (name: string) => {
    setUserName(name);
    if (roomId) {
      await joinRoom(roomId, name);
    }
    setShowModal(false);
  };

  const handleSkip = async (name: string) => {
    if (!roomId) return;
    await joinRoom(roomId, name);
    setShowModal(false);
  };

  return (
    <div className="font-roboto relative mx-auto flex h-dvh max-h-dvh w-full max-w-2xl flex-col bg-[var(--color-background)] p-4 text-[var(--color-foreground)]">
      <UserModal
        isOpen={showModal}
        onJoin={handleJoinRoom}
        onSkip={handleSkip}
      />
      <Header />
      <div className="mx-auto flex w-full max-w-3xl flex-col">
        <Clock addActivity={addActivity} latestActivity={latestTimerActivity} />
      </div>
      <div className="mt-4">
        {roomId && <ActivityLog activities={activities} />}
      </div>
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2">
        <UserDisplay users={roomUsers} />
      </div>
    </div>
  );
};
