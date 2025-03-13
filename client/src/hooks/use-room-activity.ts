import { useState, useEffect } from "react";
import { RoomActivity } from "../types/activity";

export const useRoomActivity = () => {
  const [activities, setActivities] = useState<RoomActivity[]>([]);

  const addActivity = async (
    activity: Omit<RoomActivity, "id" | "timeStamp">,
  ) => {
    const newActivity: RoomActivity = {
      ...activity,
      id: crypto.randomUUID(),
      timeStamp: new Date().toISOString(),
    };

    // TODO: Add API call to Redis
    // const response = await fetch('/api/room-activity', {
    //   method: 'POST',
    //   body: JSON.stringify(newActivity)
    // });

    setActivities([...activities, newActivity]);
  };

  useEffect(() => {
    // TODO: Setup WebSocket connection for real-time updates
    // const socket = new WebSocket('ws://your-server/room-activities');
    // socket.onmessage = (event) => {
    //   const newActivity = JSON.parse(event.data);
    //   setActivities(prev => [...prev, newActivity]);
    // };
    // TODO: Fetch recent activities from Redis (last 24h)
    // const fetchActivities = async () => {
    //   const response = await fetch('/api/room-activity/recent');
    //   const data = await response.json();
    //   setActivities(data);
    // };
    // fetchActivities();
    // return () => socket.close();
  }, []);

  return { activities, addActivity };
};
