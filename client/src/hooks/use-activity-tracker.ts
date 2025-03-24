import { useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { RoomActivity } from "server/types/room";
import { wsService } from "server/services/websocket-service";

// the only source of truth in the local state
export const useActivityTracker = (roomId?: string) => {
  const queryClient = useQueryClient();
  const activitiesKey = ["activities", roomId];

  // replace useState with useQuery
  const { data: activities = [] } = useQuery({
    queryKey: activitiesKey,
    queryFn: () => [], // initial empty array
    enabled: !!roomId,
  });

  useEffect(() => {
    if (!roomId) return;

    const handleActivity = (data: any) => {
      console.log("[Activity] Received from WebSocket:", data.payload);
      const newActivity = data.payload as RoomActivity;
      console.log(
        `[Activity][${newActivity.type}] Received from WebSocket:`,
        newActivity.userName,
      );

      // update react query cache instead of useState
      queryClient.setQueryData(activitiesKey, (prev: RoomActivity[] = []) => {
        if (prev.some((activity) => activity.id === newActivity.id)) {
          console.log("[Activity] Skipping duplicate:", newActivity.id);
          return prev;
        }
        console.log(
          `[Activity][${newActivity.type}] Adding to state:`,
          newActivity.userName,
        );
        return [...prev, newActivity];
      });
    };

    // subscribe to activities
    console.log("[useActivityTracker] Subscribing to activities...");
    wsService.subscribe("activity", handleActivity);

    return () => {
      console.log("[useActivityTracker] Unsubscribing from activities...");
      wsService.unsubscribe("activity", handleActivity);
    };
  }, [roomId, queryClient, activitiesKey]);

  // convert addActivity to use mutation
  const { mutate: addActivity } = useMutation({
    mutationFn: async (activity: Omit<RoomActivity, "timeStamp" | "id">) => {
      console.log("[Activity] Adding activity:", activity);

      const newActivity = {
        ...activity,
        id: crypto.randomUUID(),
        timeStamp: new Date().toISOString(),
      };

      console.log("[Activity] Sending to WebSocket:", newActivity);
      wsService.send({
        type: "activity",
        payload: newActivity,
      });

      return Promise.resolve(newActivity);
    },
    onSuccess: (newActivity) => {
      // update cache on successful mutation
      queryClient.setQueryData(activitiesKey, (prev: RoomActivity[] = []) => [
        ...prev,
        newActivity,
      ]);
    },
  });

  return { activities, addActivity };
};
