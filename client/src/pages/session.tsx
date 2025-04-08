import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRoom } from "../hooks/use-room";
import { z } from "zod";

import { ThemeToggle } from "../components/theme-toggle";
import { AlertCircle } from "react-feather";

// inline room schema
const roomSchema = z.object({
  roomName: z.string().min(1, "Room name is required").max(20, "Room name is too long"),
});

// TODO: add custom UI validation
export function SessionPage() {
  const navigate = useNavigate();
  const { createRoom, fetchRoom } = useRoom();
  const [roomName, setRoomName] = useState("");
  const [validationError, setValidationError] = useState("");

  const handleRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");

    try {
      const roomId = roomName.trim().toLowerCase();

      // validate with zod schema
      const { roomName: validatedRoom } = roomSchema.parse({
        roomName: roomId,
      });

      // check if room exists
      const roomExists = await fetchRoom(validatedRoom);
      if (roomExists) {
        navigate(`/room/${validatedRoom}`);
        return;
      }

      // create new room if doesn't exist
      const createdRoom = await createRoom(validatedRoom);
      if (!createdRoom) {
        console.error("[Session] Failed to create room");
        setValidationError("Failed to create room. Please try again.");
        return;
      }

      navigate(`/room/${validatedRoom}`);
      return;
    } catch (error) {
      console.error("[Session] Error:", error);
      if (error instanceof z.ZodError) {
        setValidationError(error.errors[0].message);
      } else {
        setValidationError("An unexpected error occurred. Please try again.");
      }
    }
  };

  return (
    <div className="bg-background text-foreground flex min-h-dvh w-full flex-col p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="mx-auto flex w-full max-w-xs flex-grow flex-col items-center justify-center">
        <div className="w-full space-y-6">
          <h1 className="font-qurova text-center text-2xl font-bold tracking-wide">morph</h1>
          <div className="text-center">
            <h1 className="mb-2 text-4xl font-bold">Welcome</h1>
            <p className="text-foreground/70 text-sm">Enter room name to get started</p>
          </div>

          <form onSubmit={handleRoom} className="space-y-4">
            <div className="space-y-2">
              <input
                type="text"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                placeholder="Enter room name"
                className="bg-secondary text-foreground placeholder:text-foreground/50 focus:ring-accent w-full rounded-md p-2 text-sm focus:ring-1 focus:outline-none"
              />
              {validationError && (
                <p className="font-base text-primary flex items-center gap-1 text-xs tracking-wide">
                  <AlertCircle size={12} />
                  {validationError}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="bg-accent hover:bg-accent/90 text-background font-base w-full max-w-full cursor-pointer rounded-md p-2 text-sm tracking-wide"
            >
              Continue
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
