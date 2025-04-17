import { useState, useEffect, useRef, useCallback } from "react";
import { RoomInfo, RoomUser, RoomActivity } from "../types/room";
import { useUserInfo } from "../contexts/user-context";

// const API_URL = import.meta.env.VITE_API_URL;
const API_URL = "http://localhost:3000";

export const useRoom = (roomId?: string) => {
  const { userName } = useUserInfo();
  const [roomInfo, setRoomInfo] = useState<RoomInfo | null>(null);
  const [roomUsers, setRoomUsers] = useState<RoomUser[]>([]);

  // room functions
  const fetchRoom = async (roomId: string) => {
    try {
      console.log(`[fetchRoom] Fetching room with ID: ${roomId}`);
      const response = await fetch(`${API_URL}/api/room/${roomId}/info`);

      console.log(`[fetchRoom] Response status: ${response.status}`);
      if (!response.ok) {
        console.log(`[fetchRoom] Room not found: ${roomId}`);
        return null;
      }

      const data = await response.json();
      console.log(`[fetchRoom] Room data:`, data);
      return data;
    } catch (error) {
      console.error("[fetchRoom] Error fetching room:", error);
      return null;
    }
  };

  const fetchRoomUsers = async (): Promise<RoomUser[] | null> => {
    console.log("fetchRoomUsers called");
    if (!roomId) return null;
    try {
      const response = await fetch(`${API_URL}/api/room/${roomId}/users`);
      if (!response.ok) return null;
      const users = await response.json();
      setRoomUsers(users);
      return users;
    } catch (error) {
      console.error("[useRoom] error fetching room users:", error);
      return null;
    }
  };

  const createRoom = async (roomId: string) => {
    try {
      console.log(`[createRoom] Creating room with ID: ${roomId}`);
      const response = await fetch(`${API_URL}/api/room/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId }),
      });

      console.log(`[createRoom] Response status: ${response.status}`);
      if (!response.ok) {
        console.error(`[createRoom] Failed to create room: ${response.status}`);
        const errorText = await response.text();
        console.error(`[createRoom] Error response: ${errorText}`);
        return null;
      }

      const text = await response.text();
      console.log(`[createRoom] Response text: ${text}`);
      if (!text || text.trim() === "") {
        console.error("[createRoom] Empty response from create room");
        return null;
      }

      const data = JSON.parse(text);
      console.log(`[createRoom] Created room data:`, data);
      setRoomInfo(data);
      return data;
    } catch (error) {
      console.error("[createRoom] Error creating room:", error);
      return null;
    }
  };

  const joinRoom = async (roomId: string, userName: string = "user") => {
    try {
      const response = await fetch(`${API_URL}/api/room/${roomId}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userName }),
      });
      if (!response.ok) return null;

      const data = await response.json();
      if (!data) return null;

      setRoomInfo((prev) => ({
        ...prev!,
        activeUsers: data.userCount,
        lastActive: data.lastActive,
      }));

      return data;
    } catch (error) {
      console.error("[useRoom] Error joining room:", error);
      return null;
    }
  };

  const leaveRoom = async (roomId: string, userName: string) => {
    try {
      const response = await fetch(`${API_URL}/api/room/${roomId}/users`, {
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

  const shareRoom = async (roomId: string) => {
    try {
      const clientUrl = API_URL;
      const url = `${clientUrl}/room/${roomId}`;

      // store url in redis
      const response = await fetch(`${API_URL}/api/room/${roomId}/url`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        console.error("[useRoom] Failed to store shareable URL");
        return null;
      }

      return url;
    } catch (error) {
      console.error("[useRoom] Error sharing room:", error);
      return null;
    }
  };

  const getRoomUrl = async (roomId: string) => {
    try {
      const response = await fetch(`${API_URL}/api/room/${roomId}/url`);
      if (!response.ok) {
        console.error("[useRoom] Failed to get shareable URL");
        return null;
      }
      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error("[useRoom] Error getting room URL:", error);
      return null;
    }
  };

  return {
    roomInfo,
    roomUsers,
    setRoomUsers,
    fetchRoom,
    createRoom,
    joinRoom,
    leaveRoom,
    fetchRoomUsers,
    shareRoom,
    getRoomUrl,
  };
};

export default useRoom;
