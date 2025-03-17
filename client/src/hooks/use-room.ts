import { useEffect, useState } from "react";
import { RoomInfo, RoomUser } from "server/types/room";
import redisService from "server/services/redis-service";

export const useRoom = (roomId: string) => {
  const [roomInfo, setRoomInfo] = useState<RoomInfo | null>(null);
  const [roomUsers, setRoomUsers] = useState<RoomUser[]>([]);

  const fetchRoom = async (roomId: string) => {
    const data = await redisService.getRoomInfo(roomId);
    if (!data) return;
    setRoomInfo({
      createdBy: data.createdBy,
      createdAt: data.createdAt,
      lastActive: data.lastActive,
      activeUsers: parseInt(data.activeUsers),
    });
  };

  useEffect(() => {
    if (!roomId || !roomUsers) return;

    fetchRoom(roomId);
    fetchRoomUsers(roomId);
  }, [roomId, roomUsers]);

  const addRoom = async (roomId: string, userName: string) => {
    const data = await redisService.createRoom(roomId, userName);
    if (!data) return;

    setRoomInfo({
      createdBy: userName,
      createdAt: Date.now().toString(),
      lastActive: Date.now().toString(),
      activeUsers: 1,
    });
  };

  const addUserToRoom = async (roomId: string, userName: string) => {
    const data = await redisService.userJoinRoom(roomId, userName);
    if (!data || !roomInfo) return;

    setRoomInfo({
      ...roomInfo,
      activeUsers: data.userCount,
      lastActive: data.lastActive.toString(),
    });
  };

  const removeUserFromRoom = async (roomId: string, userName: string) => {
    const data = await redisService.userLeaveRoom(roomId, userName);
    if (!data || !roomInfo) return;

    setRoomInfo({
      ...roomInfo,
      activeUsers: data.userCount,
      lastActive: data.lastActive.toString(),
    });
  };

  const fetchRoomUsers = async (roomId: string) => {
    const data = await redisService.getRoomUsers(roomId);
    if (!data) return;
    setRoomUsers(data);
  };
};
