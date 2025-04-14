import { useEffect, useState, useRef } from "react";
import { RoomActivity } from "../types/room";
import { socketService } from "../services/socket-service";

const API_URL = import.meta.env.VITE_API_URL || "https://morph-app.onrender.com:10000";

// main uses:
// 1. auto-fetch activities
// 2. local state update of "activities" which are then passed to room.tsx
export function useActivityTracker(roomId?: string, userName?: string) {
  const [activities, setActivities] = useState<RoomActivity[]>([]);
  const isMountedRef = useRef(false);

  // function to fetch activities that can be called anytime
  const fetchActivities = async () => {
    if (!roomId) return;

    try {
      const response = await fetch(`${API_URL}/api/room/${roomId}/activities`);
      if (!response.ok) {
        return;
      }
      const activityHistory = await response.json();
      if (!activityHistory) return;
      setActivities(activityHistory);
    } catch (error) {
      console.error("[useActivityTracker] error fetching activities:", error);
    }
  };

  // auto-fetch activities on mount and subscribe to socket events
  useEffect(() => {
    if (!roomId) return;

    isMountedRef.current = true;
    fetchActivities();

    // subscribe to socket events to know when to refetch
    const handleActivityUpdate = (activity: RoomActivity) => {
      // refetch all activities when we get a new one
      fetchActivities();
    };

    // subscribe to socket activity events
    const unsubscribe = socketService.subscribe("activity", handleActivityUpdate);

    return () => {
      isMountedRef.current = false;
      unsubscribe();
    };
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

    // optimistic update
    setActivities((prev) => [...prev, newActivity]);

    return newActivity;
  };

  return {
    activities,
    addActivity,
    fetchActivities, // expose this so it can be called manually if needed
  };
}
