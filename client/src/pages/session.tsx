import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRoom } from "../hooks/use-room";
import { ThemeToggle } from "../components/theme-toggle";
import { z } from "zod";
import { sessionSchema } from "../schemas/session";

export function SessionPage() {
  const [userName, setUserName] = useState("");
  const [sessionName, setSessionName] = useState("");
  const navigate = useNavigate();
  const { addRoom } = useRoom();

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const result = sessionSchema.parse({
        userName: userName.trim(),
        sessionName: sessionName.trim(),
      });

      const sessionId = result.sessionName.toLowerCase();
      await addRoom(sessionId, result.userName);
      navigate(`/room/${sessionId}`);
    } catch (error) {
      if (error instanceof z.ZodError) {
        alert(error.errors[0].message);
      }
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
