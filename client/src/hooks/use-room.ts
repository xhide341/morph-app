import { useEffect, useState } from "react";
import { RoomActivity } from "../types/room";
import { redisService } from "../services/redis-service";

export const useRoom = (roomId: string) => {
  const [room, setRoom] = useState<RoomActivity[]>([]);

  const fetchRoom = async (roomId: string) => {
    const room = await redisService.getRoomInfo(roomId);
    setRoom(room);
  };

  useEffect(() => {
    fetchRoom(roomId);
  }, [roomId]);
};
