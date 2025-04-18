import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { ActivityLog } from "../components/activity-log";
import { Clock } from "../components/clock";
import { Header } from "../components/header";
import { UserDisplay } from "../components/user-display";
import { UserModal } from "../components/user-modal";
import { useUserInfo } from "../contexts/user-context";
import { useActivity } from "../hooks/use-activity";
import { useRoom } from "../hooks/use-room";
import { socketService } from "../services/socket-service";
import { RoomActivity, RoomUser } from "../types/room";

export const RoomPage = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const { userName, setUserName } = useUserInfo();
  const { roomUsers, setRoomUsers, fetchRoomUsers, joinRoom } = useRoom(roomId);
  const { activities, setActivities, fetchActivities } = useActivity(roomId);
  const [showModal, setShowModal] = useState(!userName);

  // handle connection
  useEffect(() => {
    if (!roomId) return;

    socketService.connect(roomId, userName);

    return () => {
      socketService.disconnect();
    };
  }, [roomId, userName]);

  // handle activity subscriptions
  useEffect(() => {
    if (!socketService.isConnected()) return;

    const handleActivity = (activity: RoomActivity) => {
      setActivities((prev) => {
        const exists = prev.some((a) => a.id === activity.id);
        if (exists) return prev;
        return [activity, ...prev];
      });
    };

    socketService.on("activity", handleActivity);

    return () => {
      socketService.off("activity", handleActivity);
    };
  }, [roomId, userName]);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [activities, users] = await Promise.all([
          fetchActivities(),
          fetchRoomUsers(),
        ]);

        if (activities) setActivities(activities);
        console.log("activities: ", activities);
        if (users) setRoomUsers(users);
        console.log("users: ", users);
      } catch (error) {
        console.error("Error loading initial data:", error);
      }
    };

    loadInitialData();
  }, [roomId, userName]);

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
        const timerActivities = activities
          .filter((activity: RoomActivity) =>
            [
              "start_timer",
              "pause_timer",
              "change_timer",
              "reset_timer",
            ].includes(activity.type),
          )
          .sort(
            (a, b) =>
              new Date(b.timeStamp).getTime() - new Date(a.timeStamp).getTime(),
          );
        return timerActivities[0];
      })()
    : null;

  const handleNewActivity = (
    activity: Omit<RoomActivity, "id" | "timeStamp">,
  ) => {
    if (!socketService.isConnected()) {
      console.warn("socket not connected, activity not emitted");
      return;
    }

    const newActivity = {
      ...activity,
      id: crypto.randomUUID(),
      timeStamp: new Date().toISOString(),
    };

    setActivities((prev) => {
      const exists = prev.some((a) => a.id === newActivity.id);
      if (exists) return prev;
      return [...prev, newActivity];
    });

    socketService.emit("activity", newActivity);
  };

  return (
    <div
      className="relative mx-auto flex h-dvh max-h-dvh w-full max-w-2xl flex-col bg-[var(--color-background)] p-4 text-[var(--color-foreground)]"
      role="main"
      aria-label={`Room: ${roomId || "Loading"}`}
    >
      <UserModal
        isOpen={showModal}
        onJoin={handleJoinRoom}
        onSkip={handleSkip}
      />
      <Header />
      <div
        className="mx-auto flex w-full max-w-3xl flex-col"
        role="region"
        aria-label="Timer section"
      >
        <Clock
          latestActivity={latestTimerActivity}
          onActivityCreated={handleNewActivity}
        />
      </div>
      <div className="mt-6" role="region" aria-label="Activity log">
        {roomId && <ActivityLog activities={activities} />}
      </div>
      <div
        className="fixed bottom-4 left-1/2 -translate-x-1/2"
        role="region"
        aria-label="Active users"
      >
        {roomId && <UserDisplay users={roomUsers} roomId={roomId} />}
      </div>
    </div>
  );
};
