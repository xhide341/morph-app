import { useEffect, useState } from "react";
import { RoomInfo, RoomUser } from "server/types/room";
import redisService from "server/services/redis-service";

export const useRoom = (roomId: string) => {
  const [roomInfo, setRoomInfo] = useState<RoomInfo | null>(null);
  const [roomUsers, setRoomUsers] = useState<RoomUser[]>([]);

  const fetchRoom = async (roomId: string) => {
    try {
      const data = await redisService.getRoomInfo(roomId);
      if (!data) return;
      setRoomInfo(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (!roomId || !roomUsers) return;

    fetchRoom(roomId);
    fetchRoomUsers(roomId);
  }, [roomId, roomUsers]);

  const addRoom = async (roomId: string, userName: string) => {
    try {
      const data = await redisService.createRoom(roomId, userName);
      if (!data) return;

      setRoomInfo(data);
    } catch (error) {
      console.error(error);
    }
  };

  const addUserToRoom = async (roomId: string, userName: string) => {
    try {
      const data = await redisService.userJoinRoom(roomId, userName);
      if (!data || !roomInfo) return;

      setRoomInfo({
        ...roomInfo,
        activeUsers: roomInfo.activeUsers,
        lastActive: roomInfo.lastActive,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const removeUserFromRoom = async (roomId: string, userName: string) => {
    try {
      const data = await redisService.userLeaveRoom(roomId, userName);
      if (!data || !roomInfo) return;

      setRoomInfo({
        ...roomInfo,
        activeUsers: data.userCount,
        lastActive: data.lastActive,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const fetchRoomUsers = async (roomId: string) => {
    try {
      const data = await redisService.getRoomUsers(roomId);
      if (!data) return;
      setRoomUsers(data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchRoomInfo = async (roomId: string) => {
    try {
      const data = await redisService.getRoomInfo(roomId);
      if (!data) return;
      setRoomInfo(data);
    } catch (error) {
      console.error(error);
    }
  };
};
