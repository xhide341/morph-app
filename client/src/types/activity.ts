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
