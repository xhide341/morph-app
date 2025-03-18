import { useState, useEffect } from "react";
import { RoomActivity } from "server/types/room";
import { wsService } from "server/services/websocket-service";

export const useActivityTracker = (roomId: string) => {
  const [activities, setActivities] = useState<RoomActivity[]>([]);

  const fetchActivities = async (roomId: string) => {
    try {
      const response = await fetch(`/api/activity/room/${roomId}`);
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching activities:", error);
      return [];
    }
  };

  useEffect(() => {
    if (!roomId) return;

    wsService.connect(roomId);
    wsService.subscribe("activity", (data) => {
      const newActivity = data.payload as RoomActivity;
      setActivities((prev) => [...prev, newActivity]);
    });

    fetchActivities(roomId).then(setActivities);

    return () => wsService.disconnect();
  }, [roomId]);

  const addActivity = async (
    activity: Omit<RoomActivity, "id" | "timeStamp">,
  ) => {
    const newActivity: RoomActivity = {
      ...activity,
      id: crypto.randomUUID(),
      timeStamp: new Date().toISOString(),
    };

    setActivities((prev) => [...prev, newActivity]);

    try {
      wsService.send({
        type: "activity",
        payload: newActivity,
      });

      const response = await fetch(`/api/activity/room/${roomId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newActivity),
      });

      if (!response.ok) {
        throw new Error("Failed to add activity");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return { activities, addActivity };
};
