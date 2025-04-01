import { useEffect, useRef, useState } from "react";
import { RoomActivity } from "server/types/room";
import { socketService } from "../services/socket-service";

// hook used by useRoom to track all room activities
export function useActivityTracker(roomId?: string, userName?: string) {
  const [activities, setActivities] = useState<RoomActivity[]>([]);
  const initialized = useRef(false);

  // only fetch and connect when both roomId and userName exist
  // technically locking out users without a username
  useEffect(() => {
    if (!roomId || !userName) {
      console.log("[ActivityTracker] Waiting for roomId and userName");
      return;
    }

    // fetch historical activities
    const fetchHistoricalActivities = async () => {
      try {
        console.log(
          `[ActivityTracker] Fetching historical activities for room: ${roomId}`,
        );
        const response = await fetch(`/api/room/${roomId}/activities`);

        if (!response.ok) {
          console.error(
            `[ActivityTracker] Failed to fetch activities: ${response.status}`,
          );
          return;
        }

        const historicalActivities = await response.json();
        console.log(
          "[ActivityTracker] Received historical activities:",
          historicalActivities.length,
          historicalActivities,
        );

        setActivities(historicalActivities);
      } catch (error) {
        console.error("[ActivityTracker] Error fetching activities:", error);
      }
    };

    fetchHistoricalActivities();

    // connect to socket if username is set
    console.log(
      "[ActivityTracker] Connecting to room with username:",
      userName,
    );
    socketService.connect(roomId, userName);

    // subscribe to activity events
    console.log("[ActivityTracker] Subscribing to activity events");
    const unsubscribe = socketService.subscribe(
      "activity",
      (data: RoomActivity) => {
        console.log("[ActivityTracker] Received activity:", data);

        // check for duplicates
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
            console.log(
              "[ActivityTracker] Duplicate activity detected, skipping",
            );
            return prev;
          }

          return [...prev, data];
        });
      },
    );

    return () => {
      console.log("[ActivityTracker] Cleaning up");
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

    console.log("[ActivityTracker] Storing new activity:", newActivity);

    // store in redis for persistence
    try {
      const response = await fetch(`/api/room/${roomId}/activities`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newActivity),
      });

      if (!response.ok) {
        console.error("[ActivityTracker] Failed to store activity");
        return null;
      }

      console.log("[ActivityTracker] Broadcasting via WebSocket");
      socketService.emit("activity", newActivity);

      // optimistic update
      setActivities((prev) => [...prev, newActivity]);

      return newActivity;
    } catch (error) {
      console.error("[ActivityTracker] Error storing activity:", error);
      return null;
    }
  };

  return {
    activities,
    addActivity,
  };
}
