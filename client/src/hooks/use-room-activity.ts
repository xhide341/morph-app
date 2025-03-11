import { useState, useEffect } from "react";
import { RoomActivity } from "../types/activity";

export const useRoomActivity = () => {
  const [activities, setActivities] = useState<RoomActivity[]>([]);

  const addActivity = (activity: Omit<RoomActivity, "id" | "timeStamp">) => {
    const newActivity: RoomActivity = {
      ...activity,
      id: crypto.randomUUID(),
      timeStamp: new Date().toISOString(),
    };
    setActivities([...activities, newActivity]);
  };

  return { activities, addActivity };
};
