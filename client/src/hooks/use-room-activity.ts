import { useState, useEffect } from "react";
import { RoomActivity } from "../types/activity";
import { wsService } from "../services/websocket_service";

export const useRoomActivity = (roomId: string) => {
  const [activities, setActivities] = useState<RoomActivity[]>([]);

  const addActivity = async (
    activity: Omit<RoomActivity, "id" | "timeStamp">,
  ) => {
    const newActivity: RoomActivity = {
      ...activity,
      id: crypto.randomUUID(),
      timeStamp: new Date().toISOString(),
    };

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

    setActivities([...activities, newActivity]);
  };

  useEffect(() => {
    wsService.connect(roomId);
    wsService.subscribe("activity", (data) => {
      const newActivity = data.payload as RoomActivity;
      setActivities((prev) => [...prev, newActivity]);
    });

    const fetchActivities = async () => {
      try {
        const response = await fetch(`/api/activity/room/${roomId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch activities");
        }
        const data = await response.json();
        setActivities(data);
      } catch (error) {
        console.error("Error fetching activities:", error);
        setActivities([]);
      }
    };

    fetchActivities();
  }, [roomId]);

  return { activities, addActivity };
};
