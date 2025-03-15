export type RoomActivity = {
  id: string;
  type:
    | "join"
    | "leave"
    | "start_timer"
    | "pause_timer"
    | "complete_timer"
    | "reset_timer";
  userName: string;
  timeStamp: string;
  roomId: string;
  details?: {
    timerDuration?: number;
    pomodoroType?: "25" | "55";
  };
};
