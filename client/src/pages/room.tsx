import { useEffect, useState } from "react";
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
  const [isConnected, setIsConnected] = useState(socketService.isConnected());

  useEffect(() => {
    if (!roomId || !userName) {
      return;
    }

    socketService.connect(roomId, userName);

    return () => {
      socketService.disconnect();
    };
  }, [roomId, userName]);

  // connect react to socket connection state
  useEffect(() => {
    if (!roomId || !userName) {
      return;
    }

    function onConnect() {
      setIsConnected(true);
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    socketService.on("connect", onConnect);
    socketService.on("disconnect", onDisconnect);

    return () => {
      socketService.off("connect", onConnect);
      socketService.off("disconnect", onDisconnect);
    };
  }, [roomId, userName]);

  // handle activity subscription
  useEffect(() => {
    if (!isConnected || !roomId || !userName) {
      return;
    }

    const loadInitialData = async () => {
      try {
        const [activities, users] = await Promise.all([
          fetchActivities(),
          fetchRoomUsers(),
        ]);

        if (activities) {
          setActivities(activities);
        }
        if (users) {
          setRoomUsers(users);
        }
      } catch (error) {
        console.error("[Room] Error loading initial data:", error);
      }
    };

    // Activity subscription
    const handleActivity = (activity: RoomActivity) => {
      setActivities((prev) => {
        const exists = prev.some((a) => a.id === activity.id);
        if (exists) {
          return prev;
        }
        return [activity, ...prev];
      });

      if (activity.type === "join") {
        setRoomUsers((prevUsers) => {
          const exists = prevUsers.some(
            (u) => u.userName === activity.userName,
          );
          if (!exists) {
            return [
              ...prevUsers,
              { userName: activity.userName, joinedAt: activity.timeStamp },
            ];
          }
          return prevUsers;
        });
      }

      if (activity.type === "leave") {
        setRoomUsers((prevUsers) =>
          prevUsers.filter((u) => u.userName !== activity.userName),
        );
      }
    };

    socketService.on("activity", handleActivity);

    loadInitialData();

    return () => {
      socketService.off("activity", handleActivity);
    };
  }, [roomId, userName, isConnected]);

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

  // sort all activities by timeStamp in ascending order so join/leave events follow correctly
  const sortedActivities = [...activities].sort(
    (a, b) => new Date(a.timeStamp).getTime() - new Date(b.timeStamp).getTime(),
  );

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
        {roomId && <ActivityLog activities={sortedActivities} />}
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
