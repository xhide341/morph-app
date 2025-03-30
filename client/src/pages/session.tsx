import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRoom } from "../hooks/use-room";
import { z } from "zod";
import { ThemeToggle } from "../components/theme-toggle";

// Add this at the top of your file
declare global {
  interface Window {
    isNavigating?: boolean;
  }
}

// inline room schema
const roomSchema = z.object({
  roomName: z
    .string()
    .min(1, "room name is required")
    .max(50, "room name too long"),
});

// TODO: add custom UI validation
export function SessionPage() {
  const navigate = useNavigate();
  const { createRoom, fetchRoom } = useRoom();
  const [roomName, setRoomName] = useState("");

  const handleRoom = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const roomId = roomName.trim().toLowerCase();

      // validate with zod schema
      const { roomName: validatedRoom } = roomSchema.parse({
        roomName: roomId,
      });

      console.log("[Session] Validated room:", validatedRoom);

      // check if room exists
      const roomExists = await fetchRoom(validatedRoom);
      if (roomExists) {
        console.log("[Session] Room exists:", roomExists);
        navigate(`/room/${validatedRoom}`);
        return;
      }

      // create new room if doesn't exist
      const createdRoom = await createRoom(validatedRoom);
      if (!createdRoom) {
        console.error("[Session] Failed to create room");
        alert("failed to create room. please try again.");
        return;
      }

      console.log("[Session] Created room:", createdRoom);
      console.log("[Session] Navigating to new room:", validatedRoom);
      navigate(`/room/${validatedRoom}`);
      return;
    } catch (error) {
      console.error("[Session] Error:", error);
      if (error instanceof z.ZodError) {
        alert(error.errors[0].message);
      } else {
        alert("an unexpected error occurred. please try again.");
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
              Enter room name to get started
            </p>
          </div>

          <form onSubmit={handleRoom} className="space-y-4">
            <input
              type="text"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder="Enter room name"
              className="w-full rounded-md bg-[var(--color-secondary)] p-3 text-[var(--color-foreground)] placeholder:text-[var(--color-foreground)]/50 focus:ring-2 focus:ring-[var(--color-accent)] focus:outline-none"
            />

            <button
              type="submit"
              className="w-full max-w-full rounded-md bg-[var(--color-accent)] p-3 text-[var(--color-foreground)]"
            >
              Continue
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
