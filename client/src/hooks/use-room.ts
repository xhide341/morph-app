import { useEffect, useState } from "react";
import { RoomInfo, RoomUser } from "server/types/room";

export const useRoom = (roomId?: string) => {
  const [roomInfo, setRoomInfo] = useState<RoomInfo | null>(null);
  const [roomUsers, setRoomUsers] = useState<RoomUser[]>([]);

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

  useEffect(() => {
    if (!roomId) return;

    fetchRoom(roomId);
    fetchRoomUsers(roomId);
  }, [roomId]);

  const addRoom = async (roomId: string, userName: string) => {
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

  return {
    roomInfo,
    roomUsers,
    fetchRoom,
    addRoom,
    addUserToRoom,
    removeUserFromRoom,
    fetchRoomUsers,
  };
};

export default useRoom;
