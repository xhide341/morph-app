import { useState, useEffect, useRef } from "react";
import { RoomInfo, RoomUser } from "server/types/room";
import { useUserInfo } from "../contexts/user-context";
import { socketService } from "../services/socket-service";
import { RoomActivity } from "server/types/room";

export const useRoom = (roomId?: string) => {
  const { userName } = useUserInfo();
  const [roomInfo, setRoomInfo] = useState<RoomInfo | null>(null);
  const [roomUsers, setRoomUsers] = useState<RoomUser[]>([]);

  // IMPORTANT: Declare useRef at the top level
  const prevJoinLeaveCountRef = useRef<number>(0);

  // // get activities from activity tracker
  // const { activities: trackerActivities, addActivity } = useActivityTracker(
  //   roomId,
  //   userName,
  // );

  // tracker for room initialization
  // will trigger on roomId and userName changes
  // useEffect(() => {
  //   if (!roomId) return;

  //   console.log("[useRoom] Initializing room:", roomId);
  //   const initRoom = async () => {
  //     try {
  //       // get room metadata
  //       const room = await fetchRoom(roomId);
  //       if (room) {
  //         setRoomInfo(room);
  //       }

  //       // fetch users
  //       const users = await fetchRoomUsers(roomId);
  //       console.log("[initRoom] Fetched users:", users);
  //       if (users) {
  //         setRoomUsers(users);
  //         console.log("[initRoom] Set roomUsers: ", users);
  //       } else {
  //         console.log("[initRoom] No users fetched or fetch failed");
  //       }
  //     } catch (error) {
  //       console.error("[initRoom] Error initializing room:", error);
  //     }
  //   };

  //   initRoom();
  // }, [roomId, userName]); //retrigger on these changes

  // tracker for join/leave activities
  // will trigger mainly from activity updates
  // i still dont know the best way to handle this
  // useEffect(() => {
  //   if (!roomId || !trackerActivities.length) return;

  //   // count current join/leave activities
  //   const joinLeaveActivities = trackerActivities.filter(
  //     (a) => a.type === "join" || a.type === "leave",
  //   );

  //   const currentCount = joinLeaveActivities.length;

  //   // only refetch if the count has changed
  //   if (currentCount !== prevJoinLeaveCountRef.current) {
  //     console.log(
  //       "[useRoom] Join/leave activity count changed, refreshing users",
  //     );

  //     // update current ref
  //     prevJoinLeaveCountRef.current = currentCount;

  //     // refetch users
  //     fetchRoomUsers(roomId).then((users) => {
  //       if (users) setRoomUsers(users);
  //     });
  //   }
  // }, [trackerActivities, roomId]);

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
        console.log("[useRoom] Fetched users:", getRoomUsers);
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

  // function to fetch room users
  const fetchRoomUsers = async (roomId: string) => {
    if (!roomId) return null;

    try {
      console.log("[useRoom] fetching room users for roomId:", roomId);
      const response = await fetch(`/api/room/${roomId}/users`);

      if (!response.ok) {
        console.error("[useRoom] error fetching room users, status:", response.status);
        return null;
      }

      const users = await response.json();
      console.log("[useRoom] fetched users:", users);
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
      console.log("[useRoom] received user activity:", activity.type);

      if (activity.type === "join" || activity.type === "leave") {
        console.log("[useRoom] fetching updated user list");
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

  // This api call is important for user presence (RoomInfo) which was
  // used by initRoom. The activity tracking is handled by the socket
  // automatically upon "connection"
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

  // This api call is important for both user presence (RoomInfo) and
  // activity tracking. Though the reason for keeping it is for future
  // use-cases where I want to manually handle the leave activity.
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
