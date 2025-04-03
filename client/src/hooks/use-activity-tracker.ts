import { useEffect, useRef, useState } from "react";
import { RoomActivity } from "server/types/room";
import { socketService } from "../services/socket-service";

// hook used by useRoom to track all room activities
export function useActivityTracker(roomId?: string, userName?: string) {
  const [activities, setActivities] = useState<RoomActivity[]>([]);

  // only fetch and connect when both roomId and userName exist
  // technically locking out users without a username
  useEffect(() => {
    if (!roomId || !userName) {
      return;
    }

    // fetch historical activities
    const fetchHistoricalActivities = async () => {
      try {
        const response = await fetch(`/api/room/${roomId}/activities`);

        if (!response.ok) {
          return;
        }

        const historicalActivities = await response.json();
        setActivities(historicalActivities);
      } catch (error) {
        // error handling kept empty intentionally
      }
    };

    fetchHistoricalActivities();

    // connect to socket if username is set
    socketService.connect(roomId, userName);

    // subscribe to activity events
    const unsubscribe = socketService.subscribe(
      "activity",
      (data: RoomActivity) => {
        setActivities((prev) => {
          const isDuplicate = prev.some(
            (existingActivity) =>
              existingActivity.type === data.type &&
              existingActivity.userName === data.userName &&
              // if the timestamps are within 2 seconds of each other
              Math.abs(
                new Date(existingActivity.timeStamp).getTime() -
                  new Date(data.timeStamp).getTime(),
              ) < 2000,
          );

          if (isDuplicate) {
            return prev;
          }

          return [...prev, data];
        });
      },
    );

    return () => {
      unsubscribe();
    };
  }, [roomId, userName]);

  const addActivity = async (
    activityData: Omit<RoomActivity, "timeStamp" | "id">,
  ) => {
    if (!roomId) return null;

    // create new activity with default username if not provided
    const newActivity = {
      ...activityData,
      id: crypto.randomUUID(),
      timeStamp: new Date().toISOString(),
    };

    // store in redis for persistence
    try {
      // essentially calls redisService.storeActivity
      const response = await fetch(`/api/room/${roomId}/activities`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newActivity),
      });

      if (!response.ok) {
        return null;
      }

      socketService.emit("activity", newActivity);

      // optimistic update
      setActivities((prev) => [...prev, newActivity]);

      return newActivity;
    } catch (error) {
      return null;
    }
  };

  return {
    activities,
    addActivity,
  };
}
