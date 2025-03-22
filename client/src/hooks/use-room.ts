import { useState, useEffect } from "react";
import { RoomInfo, RoomUser } from "server/types/room";
import { useActivityTracker } from "./use-activity-tracker";

export const useRoom = (roomId?: string) => {
  const [roomInfo, setRoomInfo] = useState<RoomInfo | null>(null);
  const [roomUsers, setRoomUsers] = useState<RoomUser[]>([]);
  const { activities, addActivity } = useActivityTracker(roomId);

  // this useEffect is specifically for:
  // 1. fetching initial room info (name, settings, etc.)
  // 2. fetching initial list of users in the room
  useEffect(() => {
    if (!roomId) return;

    const initRoom = async () => {
      // get room metadata
      fetchRoom(roomId);
      // get list of users in room
      fetchRoomUsers(roomId);
    };

    initRoom();
  }, [roomId]);

  const fetchRoom = async (roomId: string) => {
    try {
      const response = await fetch(`/api/room/${roomId}/info`);
      if (!response.ok) {
        console.error("Failed to fetch room info");
        return;
      }
      const data = await response.json();
      if (!data) return;
      setRoomInfo(data);

      return data;
    } catch (error) {
      console.error(error);
    }
  };

  const createRoom = async (roomId: string, userName: string) => {
    try {
      const response = await fetch("/api/room/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId, userName }),
      });
      if (!response.ok) {
        console.error("Failed to create room");
        return;
      }
      const data = await response.json();
      if (!data) return;
      setRoomInfo(data);

      return data;
    } catch (error) {
      console.error(error);
    }
  };

  const addUserToRoom = async (roomId: string, userName: string) => {
    try {
      const response = await fetch(`/api/room/${roomId}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userName }),
      });
      if (!response.ok) {
        console.error("Failed to join room");
        return;
      }
      const data = await response.json();
      if (!data || !roomInfo) return;

      setRoomInfo({
        ...roomInfo,
        activeUsers: roomInfo.activeUsers,
        lastActive: roomInfo.lastActive,
      });

      return data;
    } catch (error) {
      console.error(error);
    }
  };

  const removeUserFromRoom = async (roomId: string, userName: string) => {
    try {
      const response = await fetch(`/api/room/${roomId}/leave`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userName }),
      });
      if (!response.ok) {
        console.error("Failed to leave room");
        return;
      }
      const data = await response.json();
      if (!data || !roomInfo) return;

      setRoomInfo({
        ...roomInfo,
        activeUsers: data.userCount,
        lastActive: data.lastActive,
      });

      return data;
    } catch (error) {
      console.error(error);
    }
  };

  const fetchRoomUsers = async (roomId: string) => {
    try {
      const response = await fetch(`/api/room/${roomId}/users`);
      if (!response.ok) {
        console.error("Failed to fetch room users");
        return;
      }
      const data = await response.json();
      if (!data) return;
      setRoomUsers(data);

      return data;
    } catch (error) {
      console.error(error);
    }
  };

  const fetchActivities = async (roomId: string) => {
    try {
      const response = await fetch(`/api/activity/room/${roomId}`);
      if (!response.ok) {
        console.error("Failed to fetch activities");
        return [];
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(error);
      return [];
    }
  };

  return {
    activities,
    roomInfo,
    roomUsers,
    addActivity,
    fetchRoom,
    createRoom,
    addUserToRoom,
    removeUserFromRoom,
    fetchRoomUsers,
    fetchActivities,
  };
};

export default useRoom;
