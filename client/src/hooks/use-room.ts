import { useState, useEffect, useRef } from "react";
import { RoomInfo, RoomUser } from "server/types/room";
import { useUserInfo } from "../contexts/user-context";
import { socketService } from "../services/socket-service";
import { RoomActivity } from "server/types/room";

const API_URL = process.env.VITE_API_URL || "http://localhost:10000";

export const useRoom = (roomId?: string) => {
  const { userName } = useUserInfo();
  const [roomInfo, setRoomInfo] = useState<RoomInfo | null>(null);
  const [roomUsers, setRoomUsers] = useState<RoomUser[]>([]);

  // auto-fetch room/user data on mount
  useEffect(() => {
    if (!roomId || !userName) return;

    const fetchRoomData = async () => {
      try {
        const getRoomInfo = await fetchRoom(roomId);
        if (!getRoomInfo) return;
        setRoomInfo(getRoomInfo);

        const getRoomUsers = await fetchRoomUsers(roomId);
        if (!getRoomUsers) return;
        setRoomUsers(getRoomUsers);
      } catch (error) {
        console.error("[useRoom] Error fetching room data:", error);
      }
    };

    fetchRoomData();
  }, [roomId, userName]);

  const updateRoomInfo = (info: RoomInfo) => {
    setRoomInfo(info);
  };

  const updateRoomUsers = (users: RoomUser[]) => {
    setRoomUsers(users);
  };

  // room functions
  const fetchRoom = async (roomId: string): Promise<RoomInfo | null> => {
    try {
      const response = await fetch(`${API_URL}/api/room/${roomId}/info`);

      if (!response.ok) {
        if (response.status === 404) return null;
        console.error(`[useRoom] Server error: ${response.status}`);
        return null;
      }

      const text = await response.text();
      if (!text || text.trim() === "") {
        console.error("[useRoom] Empty response from server");
        return null;
      }

      return JSON.parse(text);
    } catch (error) {
      console.error("[useRoom] Error fetching room:", error);
      return null;
    }
  };

  const fetchRoomUsers = async (roomId: string) => {
    if (!roomId) return null;

    try {
      // fetch room users api
      const response = await fetch(`${API_URL}/api/room/${roomId}/users`);

      if (!response.ok) {
        console.error("[useRoom] error fetching room users, status:", response.status);
        return null;
      }

      const users = await response.json();
      setRoomUsers(users);
      return users;
    } catch (error) {
      console.error("[useRoom] error fetching room users:", error);
      return null;
    }
  };

  // auto-fetch room users on mount and listen for user events
  useEffect(() => {
    if (!roomId) return;

    // initial fetch
    fetchRoomUsers(roomId);

    // subscribe to socket events for user join/leave
    const handleUserActivity = (activity: RoomActivity) => {
      if (activity.type === "join" || activity.type === "leave") {
        fetchRoomUsers(roomId);
      }
    };

    const unsubscribe = socketService.subscribe("activity", handleUserActivity);

    return () => {
      unsubscribe();
    };
  }, [roomId]);

  const createRoom = async (roomId: string) => {
    try {
      const response = await fetch(`${API_URL}/api/room/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId }),
      });

      if (!response.ok) {
        console.error(`[useRoom] Failed to create room: ${response.status}`);
        return null;
      }

      const text = await response.text();
      if (!text || text.trim() === "") {
        console.error("[useRoom] Empty response from create room");
        return null;
      }

      const data = JSON.parse(text);
      setRoomInfo(data);
      return data;
    } catch (error) {
      console.error("[useRoom] Error creating room:", error);
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
      const url = window.location.href;

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
    fetchRoom,
    createRoom,
    joinRoom,
    leaveRoom,
    fetchRoomUsers,
    shareRoom,
    getRoomUrl,
    updateRoomInfo,
    updateRoomUsers,
  };
};

export default useRoom;
