import { useState, useEffect } from "react";
import { RoomInfo, RoomUser, RoomActivity } from "server/types/room";
import { useActivityTracker } from "./use-activity-tracker";

export const useRoom = (roomId?: string) => {
  const [roomInfo, setRoomInfo] = useState<RoomInfo | null>(null);
  const [roomUsers, setRoomUsers] = useState<RoomUser[]>([]);

  // get activities from activity tracker
  const { activities, addActivity } = useActivityTracker(roomId);

  useEffect(() => {
    if (!roomId) return;

    const initRoom = async () => {
      // get room metadata
      const room = await fetchRoom(roomId);
      if (room) setRoomInfo(room);

      // get list of users in room
      const users = await fetchRoomUsers(roomId);
      if (users) setRoomUsers(users);
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

      // add join activity
      addActivity({
        type: "join",
        userName,
        roomId,
        timeRemaining: "25:00",
        timerMode: "work",
      });
      console.log("[useRoom] Added join activity");

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

      // add join activity
      addActivity({
        type: "join",
        userName,
        roomId,
        timeRemaining: "25:00",
        timerMode: "work",
      });
      console.log("[useRoom] Added join activity");

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

      // add leave activity
      addActivity({
        type: "leave",
        userName,
        roomId,
        timeRemaining: "25:00",
        timerMode: "work",
      });

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
      const response = await fetch(`/api/room/${roomId}/url`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        console.error("[useRoom] Failed to store shareable URL");
        return null;
      }

      // copy to clipboard
      await navigator.clipboard.writeText(url);
      return url;
    } catch (error) {
      console.error("[useRoom] Error sharing room:", error);
      return null;
    }
  };

  const getRoomUrl = async (roomId: string) => {
    try {
      const response = await fetch(`/api/room/${roomId}/url`);
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
    activities,
    addActivity,
    fetchRoom,
    createRoom,
    addUserToRoom,
    removeUserFromRoom,
    fetchRoomUsers,
    shareRoom,
    getRoomUrl,
  };
};

export default useRoom;
