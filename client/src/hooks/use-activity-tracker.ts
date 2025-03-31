import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { RoomActivity } from "server/types/room";
import { ws } from "../services/websocket-client";
import { useUserInfo } from "../contexts/user-context";

// fetch historical activities from redis via api
const fetchActivities = async (roomId: string): Promise<RoomActivity[]> => {
  const response = await fetch(`/api/room/${roomId}/activities`);
  if (!response.ok) {
    console.error("[Activity] Failed to fetch activities");
    return [];
  }
  return response.json();
};

// store new activity in redis via api
const storeActivity = async (roomId: string, activity: RoomActivity) => {
  const response = await fetch(`/api/room/${roomId}/activities`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(activity),
  });
  if (!response.ok) {
    console.error("[Activity] Failed to store activity");
    return;
  }
  return response.json();
};

// hook used by useRoom to track all room activities
export const useActivityTracker = (roomId?: string) => {
  const queryClient = useQueryClient();
  const { userName } = useUserInfo();
  const activitiesKey = ["activities", roomId];

  // fetch from redis for historical data
  const { data: activities = [] } = useQuery({
    queryKey: activitiesKey,
    queryFn: () => (roomId ? fetchActivities(roomId) : []),
    enabled: !!roomId,
  });

  // More simplified activity subscription
  useEffect(() => {
    if (!roomId) return;

    const handleActivity = (data: any) => {
      console.log("[ActivityTracker] Received WebSocket activity:", data);
      const newActivity = data.payload as RoomActivity;

      // immediately update cache with new activity
      queryClient.setQueryData(activitiesKey, (prev: RoomActivity[] = []) => {
        if (prev.some((activity) => activity.id === newActivity.id))
          return prev;
        return [...prev, newActivity];
      });
    };

    // subscribe directly to the websocket client
    console.log("[ActivityTracker] Subscribing to activity events");
    ws.subscribe("activity", handleActivity);

    // cleanup subscription
    return () => {
      console.log("[ActivityTracker] Unsubscribing from activity events");
      ws.unsubscribe("activity", handleActivity);
    };
  }, [roomId, queryClient]);

  useEffect(() => {
    if (!roomId) return;
    console.log("[ActivityTracker] Connecting to WebSocket");
    ws.connect(roomId);
    return () => {
      console.log("[ActivityTracker] Disconnecting from WebSocket");
      ws.disconnect();
    };
  }, [roomId]);

  // mutation for adding new activities
  // used by useRoom to log join/leave/timer activities
  const { mutate: addActivity } = useMutation({
    mutationFn: async (activity: Omit<RoomActivity, "timeStamp" | "id">) => {
      // create new activity
      const newActivity = {
        ...activity,
        id: crypto.randomUUID(),
        timeStamp: new Date().toISOString(),
      };

      // check for duplicates using the existing activities
      const isDuplicate = activities.some(
        (existingActivity) =>
          existingActivity.type === activity.type &&
          existingActivity.userName === activity.userName &&
          // if the timestamps are within 2 seconds of each other
          Math.abs(
            new Date(existingActivity.timeStamp).getTime() -
              new Date(newActivity.timeStamp).getTime(),
          ) < 2000,
      );

      if (isDuplicate) {
        console.log("[ActivityTracker] Duplicate activity detected, skipping");
        return null; // Return null instead of undefined
      }

      console.log("[ActivityTracker] Storing new activity:", newActivity);

      // store in redis first
      const storedActivity = await storeActivity(activity.roomId, newActivity);

      // Only broadcast if we have a valid stored activity
      if (storedActivity) {
        console.log("[ActivityTracker] Broadcasting via WebSocket");
        ws.send({
          type: "activity",
          payload: storedActivity,
        });
      }

      return storedActivity;
    },
    onSuccess: (newActivity) => {
      queryClient.setQueryData(activitiesKey, (prev: RoomActivity[] = []) => {
        if (
          !newActivity ||
          prev.some((activity) => activity.id === newActivity.id)
        )
          return prev;
        return [...prev, newActivity];
      });
    },
    onError: (error) => {
      console.error("[Activity] Failed to add activity:", error);
    },
  });

  return {
    activities, // will update when WebSocket receives new activities
    addActivity,
  };
};
