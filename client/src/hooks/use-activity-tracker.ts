import { useEffect, useState } from "react";
import { RoomActivity } from "server/types/room";

// main uses:
// 1. auto-fetch activities
// 2. local state update of "activities" which are then passed to room.tsx
export function useActivityTracker(roomId?: string, userName?: string) {
  const [activities, setActivities] = useState<RoomActivity[]>([]);

  // auto-fetch activities on mount
  useEffect(() => {
    if (!roomId && !userName) return;

    // fetch historical activities
    const fetchRedisActivities = async () => {
      try {
        const response = await fetch(`/api/room/${roomId}/activities`);
        if (!response.ok) {
          return;
        }
        const activityHistory = await response.json();
        if (!activityHistory) return;
        console.log("[fetchRedisActivities] Fetched activities:", activityHistory);
        setActivities(activityHistory);
      } catch (error) {
        console.error("[useActivityTracker] Error fetching historical activities:", error);
      }
    };

    fetchRedisActivities();
  }, [roomId, userName]);

  // current flow:
  // 1. update local state
  const addActivity = (activityData: Omit<RoomActivity, "timeStamp" | "id">) => {
    if (!roomId) return null;

    const newActivity = {
      ...activityData,
      id: crypto.randomUUID(),
      timeStamp: new Date().toISOString(),
    };

    // local state update
    setActivities((prev) => [...prev, newActivity]);

    return newActivity;
  };

  return {
    activities,
    addActivity,
  };
}
