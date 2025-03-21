import { useState, useEffect, useCallback } from "react";
import { RoomActivity } from "server/types/room";
import { wsService } from "server/services/websocket-service";

// Add this function at the top of the file
const fetchActivities = async (roomId: string): Promise<RoomActivity[]> => {
  const response = await fetch(`/api/activity/${roomId}`);
  return response.json();
};

export const useActivityTracker = (roomId: string) => {
  const [activities, setActivities] = useState<RoomActivity[]>([]);

  useEffect(() => {
    if (!roomId) return;

    // Connect WebSocket first
    wsService.connect(roomId);

    // Single handler for activities
    const handleActivity = (data: any) => {
      const newActivity = data.payload as RoomActivity;
      setActivities((prev) => [...prev, newActivity]);
    };

    // Subscribe and fetch initial data
    wsService.subscribe("activity", handleActivity);
    fetchActivities(roomId).then(setActivities);

    return () => {
      wsService.unsubscribe("activity", handleActivity);
    };
  }, [roomId]);

  const addActivity = useCallback(
    (activity: Omit<RoomActivity, "timeStamp" | "id">) => {
      const newActivity = {
        ...activity,
        id: crypto.randomUUID(),
        timeStamp: new Date().toISOString(),
      };
      wsService.send({
        type: "activity",
        payload: newActivity,
      });
    },
    [],
  );

  return { activities, addActivity };
};
