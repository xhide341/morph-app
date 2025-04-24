import { useState } from "react";

import { RoomActivity } from "../types/room";

const API_URL = import.meta.env.VITE_API_URL;
// const API_URL = "http://localhost:3000";

export function useActivity(roomId?: string) {
  const [activities, setActivities] = useState<RoomActivity[]>([]);

  const fetchActivities = async () => {
    if (!roomId) return;
    try {
      const response = await fetch(`${API_URL}/api/room/${roomId}/activities`);
      if (!response.ok) return;
      const activityHistory = await response.json();
      return activityHistory || null;
    } catch (error) {
      console.error("[useActivity] error fetching activities:", error);
    }
  };

  return {
    activities,
    setActivities,
    fetchActivities,
  };
}
