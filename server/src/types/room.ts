export type RoomActivity = {
  id: string;
  type:
    | "join"
    | "leave"
    | "start_timer"
    | "pause_timer"
    | "complete_timer"
    | "reset_timer"
    | "change_timer";
  userName: string;
  timeStamp: string;
  roomId: string;
  timerDuration?: number;
  timeRemaining?: string;
  timerMode?: "work" | "break";
};

export interface RoomInfo {
  roomId: string;
  createdBy?: string | null;
  createdAt: string;
  lastActive: string;
  activeUsers: number;
}

export type RoomUser = {
  userName: string;
  joinedAt: string;
};

export type RoomResponse = {
  roomInfo: RoomInfo;
  users: RoomUser[];
  exists: boolean;
};
