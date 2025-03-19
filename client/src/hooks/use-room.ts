import { useEffect, useState } from "react";
import { RoomInfo, RoomUser } from "server/types/room";

export const useRoom = (roomId?: string) => {
  const [roomInfo, setRoomInfo] = useState<RoomInfo | null>(null);
  const [roomUsers, setRoomUsers] = useState<RoomUser[]>([]);

  const fetchRoom = async (roomId: string) => {
    try {
      const response = await fetch(`/api/room/${roomId}`);
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
      const response = await fetch("/api/room/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId, userName }),
      });
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
      const response = await fetch("/api/room/leave", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId, userName }),
      });
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
      const response = await fetch(`/api/room/users/${roomId}`);
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
