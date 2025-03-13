import { Clock } from "../components/clock";
import { ThemeToggle } from "../components/theme-toggle";
import { useParams } from "react-router-dom";
import { Header } from "../components/header";
import { ActivityLog } from "../components/activity-log";

export function RoomPage() {
  const { sessionId } = useParams();

  return (
    <div className="font-roboto mx-auto flex h-dvh w-full max-w-2xl flex-col bg-[var(--color-background)] p-4 text-[var(--color-foreground)]">
      <Header />
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="mx-auto flex w-full max-w-3xl flex-col">
        <Clock />
      </div>
      <ActivityLog />
    </div>
  );
}
