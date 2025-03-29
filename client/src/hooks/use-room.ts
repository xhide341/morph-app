import { useState, useEffect } from "react";
import { RoomInfo, RoomUser } from "server/types/room";
import { useActivityTracker } from "./use-activity-tracker";
import { wsService } from "server/services/websocket-service";

export const useRoom = (roomId?: string) => {
  const [roomInfo, setRoomInfo] = useState<RoomInfo | null>(null);
  const [roomUsers, setRoomUsers] = useState<RoomUser[]>([]);
  // get activities from activity tracker
  const { activities, addActivity } = useActivityTracker(roomId);

  // Separate WebSocket connection effect
  useEffect(() => {
    if (!roomId) return;

    // Only connect if room exists in state
    if (roomInfo) {
      wsService.connect(roomId);

      return () => {
        wsService.disconnect();
      };
    }
  }, [roomId, roomInfo]);

  // Room initialization effect
  useEffect(() => {
    if (!roomId) return;

    const initRoom = async () => {
      try {
        // get room metadata first
        const room = await fetchRoom(roomId);

        if (room) {
          setRoomInfo(room);
          // get list of users in room
          const users = await fetchRoomUsers(roomId);
          if (users) setRoomUsers(users);
        }
      } catch (error) {
        console.error("[useRoom] Error initializing room:", error);
      }
    };

    initRoom();
    return () => wsService.disconnect();
  }, [roomId]);

  const fetchRoom = async (roomId: string): Promise<RoomInfo | null> => {
    try {
      const response = await fetch(`/api/room/${roomId}/info`);
      if (response.status === 404) return null;
      const data = await response.json();
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

      if (!response.ok) {
        console.error("[useRoom] Failed to create room");
        return null;
      }

      const data = await response.json();
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
    activities,
    addActivity,
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
