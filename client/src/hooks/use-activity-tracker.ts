import { useState, useEffect, useCallback } from "react";
import { RoomActivity } from "server/types/room";
import { wsService } from "server/services/websocket-service";

// the only source of truth in the local state
export const useActivityTracker = (roomId?: string) => {
  const [activities, setActivities] = useState<RoomActivity[]>([]);

  useEffect(() => {
    if (!roomId) return;

    let handleActivity: ((data: any) => void) | null = null;

    const initActivities = async () => {
      // setup activity handler
      handleActivity = (data: any) => {
        console.log("[Activity] Received from WebSocket:", data.payload);
        const newActivity = data.payload as RoomActivity;
        console.log(
          `[Activity][${newActivity.type}] Received from WebSocket:`,
          newActivity.userName,
        );

        // add to local state but skip duplicates (that comes from websocket)
        setActivities((prev) => {
          if (prev.some((activity) => activity.id === newActivity.id)) {
            console.log("[Activity] Skipping duplicate:", newActivity.id);
            return prev; // skip duplicates
          }
          console.log(
            `[Activity][${newActivity.type}] Adding to state:`,
            newActivity.userName,
          );
          return [...prev, newActivity];
        });
      };

      // subscribe to activities
      console.log("[useActivityTracker] Subscribing to activities...");
      wsService.subscribe("activity", handleActivity);
    };

    initActivities();

    return () => {
      if (handleActivity) {
        console.log("[useActivityTracker] Unsubscribing from activities...");
        wsService.unsubscribe("activity", handleActivity);
      }
    };
  }, [roomId]);

  const addActivity = useCallback(
    (activity: Omit<RoomActivity, "timeStamp" | "id">) => {
      console.log("[Activity] Adding activity:", activity);

      // 1. ensure connection
      if (
        !wsService.getSocket() ||
        wsService.getSocket()?.readyState !== WebSocket.OPEN
      ) {
        console.log("[Activity] Reconnecting WebSocket...");
        wsService.connect(roomId!);
      }

      // 2. create new activity
      const newActivity = {
        ...activity,
        id: crypto.randomUUID(),
        timeStamp: new Date().toISOString(),
      };

      // 3. add to local state
      setActivities((prev) => [...prev, newActivity]);

      // 4. send through WebSocket
      console.log("[Activity] Sending to WebSocket:", newActivity);
      wsService.send({
        type: "activity",
        payload: newActivity,
      });
    },
    [roomId],
  );

  return { activities, addActivity };
};
