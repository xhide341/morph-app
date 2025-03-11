export interface RoomActivity {
  id: string;
  type: "join" | "leave" | "start_timer" | "pause_timer" | "complete_timer";
  userName: string;
  timeStamp: string;
  sessionName: string;
  details?: {
    timerDuration?: number;
    pomodoroType?: "25" | "55";
  };
}
