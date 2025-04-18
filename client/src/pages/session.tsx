import { useState } from "react";
import { AlertCircle } from "react-feather";
import { useNavigate } from "react-router-dom";
import { z } from "zod";

import { ThemeToggle } from "../components/theme-toggle";
import { useRoom } from "../hooks/use-room";

// inline room schema
const roomSchema = z.object({
  roomName: z
    .string()
    .min(1, "Room name is required")
    .max(20, "Room name is too long"),
});

// TODO: add custom UI validation
export function SessionPage() {
  const navigate = useNavigate();
  const { createRoom, fetchRoom } = useRoom();
  const [roomName, setRoomName] = useState("");
  const [validationError, setValidationError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");
    setIsSubmitting(true);

    try {
      const roomId = roomName.trim().toLowerCase();

      // 1. Validate with zod
      const { roomName: validatedRoom } = roomSchema.parse({
        roomName: roomId,
      });

      // 2. Try to create room (server handles existence check)
      const room = await createRoom(validatedRoom);
      if (!room) {
        navigate(`/room/${validatedRoom}`);
      }

      // 3. Navigate to room
      navigate(`/room/${validatedRoom}`);
    } catch (error) {
      console.error("[Session] Error:", error);
      if (error instanceof z.ZodError) {
        setValidationError(error.errors[0].message);
      } else {
        setValidationError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="bg-background text-foreground flex min-h-dvh w-full flex-col p-4"
      role="main"
      aria-label="Session page"
    >
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>

      <div className="mx-auto flex w-full max-w-xs flex-grow flex-col items-center justify-center">
        <div className="w-full space-y-6">
          <h1 className="font-qurova text-center text-2xl font-bold tracking-wide">
            morph
          </h1>
          <div className="text-center">
            <h1 className="mb-2 text-4xl font-bold">Welcome</h1>
            <p className="text-foreground/70 text-sm">
              Enter room name to get started
            </p>
          </div>

          <form
            onSubmit={handleRoom}
            className="space-y-4"
            aria-label="Create room form"
            noValidate
          >
            <div className="space-y-2">
              <input
                type="text"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                placeholder="Enter room name"
                className="bg-secondary text-foreground placeholder:text-foreground/50 focus:ring-accent w-full rounded-md p-2 text-sm focus:outline-none focus:ring-1"
                aria-required="true"
                aria-invalid={!!validationError}
                aria-describedby={validationError ? "room-error" : undefined}
              />
              {validationError && (
                <p
                  className="font-base text-primary flex items-center gap-1 text-xs tracking-wide"
                  id="room-error"
                  role="alert"
                >
                  <AlertCircle size={12} aria-hidden="true" />
                  {validationError}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="bg-accent hover:bg-accent/90 text-background font-base w-full max-w-full cursor-pointer rounded-md p-2 text-sm tracking-wide"
              disabled={isSubmitting}
              aria-busy={isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Continue"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
