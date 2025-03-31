import { useState, useEffect } from "react";
import { RoomInfo, RoomUser } from "server/types/room";
import { useActivityTracker } from "./use-activity-tracker";

export const useRoom = (roomId?: string) => {
  const [roomInfo, setRoomInfo] = useState<RoomInfo | null>(null);
  const [roomUsers, setRoomUsers] = useState<RoomUser[]>([]);
  // get activities from activity tracker
  const { activities, addActivity } = useActivityTracker(roomId);

  // combined room initialization effect
  useEffect(() => {
    if (!roomId) return;

    console.log("[useRoom] Initializing room:", roomId);
    const initRoom = async () => {
      try {
        // get room metadata
        const room = await fetchRoom(roomId);
        if (room) {
          setRoomInfo(room);
        }
        const users = await fetchRoomUsers(roomId);
        if (users) setRoomUsers(users);
      } catch (error) {
        console.error("[useRoom] Error initializing room:", error);
      }
    };

    initRoom();
  }, [roomId]);

  // room functions
  const fetchRoom = async (roomId: string): Promise<RoomInfo | null> => {
    try {
      const response = await fetch(`/api/room/${roomId}/info`);

      if (!response.ok) {
        // handle non-200 responses properly
        if (response.status === 404) return null;
        console.error(`[useRoom] Server error: ${response.status}`);
        return null;
      }

      // check for empty response
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
    try {
      const response = await fetch(`/api/room/${roomId}/users`);
      if (!response.ok) {
        console.error("Failed to fetch room users");
        return;
      }
      const data = await response.json();
      if (!data) return;
      console.log("[useRoom] Fetched room users:", data);
      setRoomUsers(data);

      return data;
    } catch (error) {
      console.error(error);
    }
  };

  const createRoom = async (roomId: string) => {
    try {
      const response = await fetch("/api/room/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId }),
      });

      // better error handling
      if (!response.ok) {
        console.error(`[useRoom] Failed to create room: ${response.status}`);
        return null;
      }

      // check for empty response
      const text = await response.text();
      if (!text || text.trim() === "") {
        console.error("[useRoom] Empty response from create room");
        return null;
      }

      const data = JSON.parse(text);
      console.log("[useRoom] Created room:", data);
      setRoomInfo(data);
      return data;
    } catch (error) {
      console.error("[useRoom] Error creating room:", error);
      return null;
    }
  };

  const joinRoom = async (roomId: string, userName: string = "user") => {
    try {
      const response = await fetch(`/api/room/${roomId}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userName }),
      });

      if (!response.ok) return null;

      const data = await response.json();
      if (!data) return null;

      // always add join activity regardless of modal skip
      addActivity({
        type: "join",
        userName,
        roomId,
      });
      console.log("[useRoom] Added join activity");

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
    activities, // just pass through
    addActivity, // used in join/leave activities here
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
