import { useState, useEffect, useCallback } from "react";
import { RoomActivity } from "server/types/room";
import { wsService } from "server/services/websocket-service";

export const useActivityTracker = (roomId?: string) => {
  const [activities, setActivities] = useState<RoomActivity[]>([]);

  useEffect(() => {
    if (!roomId) return;

    let handleActivity: ((data: any) => void) | null = null;

    const initActivities = async () => {
      // setup activity handler
      handleActivity = (data: any) => {
        console.log("WebSocket received:", data);
        const newActivity = data.payload as RoomActivity;
        setActivities((prev) => {
          return [...prev, newActivity];
        });
      };

      // subscribe to activities
      console.log("Subscribing to activities...");
      wsService.subscribe("activity", handleActivity);
    };

    initActivities();

    return () => {
      if (handleActivity) {
        console.log("Unsubscribing from activities...");
        wsService.unsubscribe("activity", handleActivity);
      }
    };
  }, [roomId]);

  const addActivity = useCallback(
    (activity: Omit<RoomActivity, "timeStamp" | "id">) => {
      console.log("Adding activity:", activity);

      // 1. ensure connection
      if (
        !wsService.getSocket() ||
        wsService.getSocket()?.readyState !== WebSocket.OPEN
      ) {
        console.log("Reconnecting WebSocket...");
        wsService.connect(roomId!);
      }

      // 2. create new activity
      const newActivity = {
        ...activity,
        id: crypto.randomUUID(),
        timeStamp: new Date().toISOString(),
      };

      // 3. optimistically update local state
      setActivities((prev) => [...prev, newActivity]);

      // 4. send through websocket
      console.log("Sending through WebSocket:", newActivity);
      wsService.send({
        type: "activity",
        payload: newActivity,
      });
    },
    [roomId],
  );

  return { activities, addActivity };
};
