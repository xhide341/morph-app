import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRoom } from "../hooks/use-room";
import { useUserInfo } from "../contexts/user-context";
import { z } from "zod";
import { roomSchema } from "../schemas/room-schema";

import { ThemeToggle } from "../components/theme-toggle";

export function SessionPage() {
  const navigate = useNavigate();
  const { createRoom, addUserToRoom, fetchRoom } = useRoom();
  const { setUserName } = useUserInfo();
  const [userName, setUserNameInput] = useState("");
  const [roomName, setRoomName] = useState("");

  const handleRoom = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const result = roomSchema.parse({
        userName: userName.trim().toLowerCase(),
        roomName: roomName.trim().toLowerCase(),
      });
      if (!result) return;
      console.log("[Session] Validation passed:", result);

      const roomId = result.roomName;
      const userId = result.userName;

      // First debug point
      console.log("[Session] Attempting to check room:", roomId);
      const roomExists = await fetchRoom(roomId);
      console.log("[Session] Room exists check result:", roomExists);

      if (!roomExists) {
        // Second debug point
        console.log("[Session] Creating new room with:", { roomId, userId });
        const newRoom = await createRoom(roomId, userId);
        console.log("[Session] Create room response:", newRoom);

        if (!newRoom) {
          console.error("[Session] Room creation failed");
          alert("Failed to create room. Please try again.");
          return;
        }

        setUserName(userId);
        navigate(`/room/${roomId}`);
        return;
      }

      // Third debug point
      console.log("[Session] Joining existing room:", roomId);
      const joinedRoom = await addUserToRoom(roomId, userId);
      console.log("[Session] Join room response:", joinedRoom);

      if (!joinedRoom) {
        console.error("[Session] Room join failed");
        alert("Failed to join room. Please try again.");
        return;
      }

      setUserName(userId);
      navigate(`/room/${roomId}`);
    } catch (error) {
      // Better error handling
      console.error("[Session] Error:", error);
      if (error instanceof z.ZodError) {
        alert(error.errors[0].message);
      } else {
        alert("An unexpected error occurred. Please try again.");
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

          <form onSubmit={handleRoom} className="space-y-4">
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserNameInput(e.target.value)}
              placeholder="Enter your name"
              className="w-full rounded-md bg-[var(--color-secondary)] p-3 text-[var(--color-foreground)] placeholder:text-[var(--color-foreground)]/50 focus:ring-2 focus:ring-[var(--color-accent)] focus:outline-none"
            />

            <input
              type="text"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder="Enter room name"
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
