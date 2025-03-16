export interface RoomActivity {
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
}

export interface TimerHistory {
  id: string;
  roomId: string;
  duration: number;
  date: string;
  userName: string;
  type: "work" | "break";
  completed: boolean;
  timeRemaining?: string;
}

export interface RoomInfo {
  createdBy: string;
  createdAt: number;
  lastActive: number;
  activeUsers: string;
}
