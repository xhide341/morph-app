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

      const roomId = result.roomName;
      const userId = result.userName;

      const joinOrCreateRoom = async () => {
        const roomExists = await fetchRoom(roomId);
        // create room
        if (!roomExists) {
          const newRoom = await createRoom(roomId, userId);
          if (!newRoom) return;
          return newRoom;
        }
        // join room
        const joinedRoom = await addUserToRoom(roomId, userId);
        if (!joinedRoom) return;
        return joinedRoom;
      };

      const room = await joinOrCreateRoom();
      if (!room) return;

      setUserName(userId);
      navigate(`/room/${roomId}`);
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
