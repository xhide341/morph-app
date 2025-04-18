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
  lastWorkTime?: string;
  lastBreakTime?: string;
};

export interface RoomInfo {
  roomId: string;
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
