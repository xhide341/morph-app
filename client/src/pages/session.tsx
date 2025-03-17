import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRoom } from "../hooks/use-room";
import { ThemeToggle } from "../components/theme-toggle";

export function SessionPage() {
  const [userName, setUserName] = useState("");
  const [sessionName, setSessionName] = useState("");
  const navigate = useNavigate();
  const { addRoom } = useRoom();

  const validateSessionName = (name: string): string | null => {
    if (!name.trim()) return "Session name cannot be empty";
    if (name.length > 10) return "Session name must be less than 10 characters";
    if (name.includes(" ")) return "Session name must not contain spaces";
    if (name !== name.replace(/[^a-zA-Z0-9]/g, ""))
      return "Session name must only contain alphanumeric characters";
    return null;
  };

  const handleCreateSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim()) {
      alert("Please enter your name first");
      return;
    }
    if (sessionName.trim()) {
      if (sessionName.length > 10) {
        alert("Session name must be less than 10 characters");
        return;
      }
      if (sessionName.includes(" ")) {
        alert("Session name must not contain spaces");
        return;
      }
      if (sessionName !== sessionName.replace(/[^a-zA-Z0-9]/g, "")) {
        alert("Session name must only contain alphanumeric characters");
        return;
      }
      const sessionId = `${sessionName.toLowerCase()}`;
      addRoom(sessionId, userName.trim());
      navigate(`/room/${sessionId}`);
    }
  };

  return (
    <div className="font-roboto flex min-h-dvh w-full flex-col bg-[var(--color-background)] p-4 text-[var(--color-foreground)]">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="mx-auto flex w-full max-w-md flex-grow flex-col items-center justify-center">
        <div className="w-full space-y-6">
          <div className="text-center">
            <h1 className="mb-2 text-4xl font-bold">Welcome</h1>
            <p className="text-[var(--color-foreground)]/70">
              Enter your details to get started
            </p>
          </div>

          <form onSubmit={handleCreateSession} className="space-y-4">
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Enter your name"
              className="w-full rounded-md bg-[var(--color-secondary)] p-3 text-[var(--color-foreground)] placeholder:text-[var(--color-foreground)]/50 focus:ring-2 focus:ring-[var(--color-accent)] focus:outline-none"
            />

            <input
              type="text"
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
              placeholder="Enter session name"
              className="w-full rounded-md bg-[var(--color-secondary)] p-3 text-[var(--color-foreground)] placeholder:text-[var(--color-foreground)]/50 focus:ring-2 focus:ring-[var(--color-accent)] focus:outline-none"
            />

            <button type="submit" className="css-button-3d w-full max-w-full">
              Continue
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
