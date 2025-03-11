export interface TimerHistory {
  id: string;
  sessionName: string;
  duration: number;
  date: string;
  userName: string;
  type: "pomodoro" | "custom";
  completed: boolean;
  pomodoroType?: "25" | "55";
}
