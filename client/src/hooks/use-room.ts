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

      if (response.status === 404) {
        console.log("[useRoom] Room not found");
        return null;
      }

      if (!response.ok) {
        console.error("[useRoom] Failed to fetch room info");
        return null;
      }

      const data = await response.json();
      console.log("[useRoom] fetchRoom response data:", data);

      if (!data) return null;

      return data;
    } catch (error) {
      console.error("[useRoom] Error:", error);
      return null;
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
      console.log("[useRoom] Room info:", roomInfo);

      return data;
    } catch (error) {
      console.error(error);
    }
  };

  const addUserToRoom = async (roomId: string, userName: string) => {
    try {
      const response = await fetch(`/api/room/${roomId}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userName }),
      });

      if (!response.ok) {
        console.error("[useRoom] Failed to join room:", await response.text());
        return null;
      }

      const data = await response.json();
      if (!data) return null;

      // Update room info with the new data
      setRoomInfo((prevInfo) => {
        if (!prevInfo) return null;
        return {
          ...prevInfo,
          activeUsers: data.userCount || 1,
          lastActive: data.lastActive || new Date().toISOString(),
        };
      });
      console.log("[useRoom] Room info:", roomInfo);

      return data;
    } catch (error) {
      console.error("[useRoom] Error joining room:", error);
      return null;
    }
  };

  const removeUserFromRoom = async (roomId: string, userName: string) => {
    try {
      const response = await fetch(`/api/room/${roomId}/users`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userName }),
      });
      if (!response.ok) {
        console.error("[useRoom] Failed to leave room");
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

  const fetchActivities = async (roomId: string) => {
    try {
      const response = await fetch(`/api/room/${roomId}/activities`);
      if (!response.ok) {
        console.error("[useRoom] Failed to fetch activities");
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
