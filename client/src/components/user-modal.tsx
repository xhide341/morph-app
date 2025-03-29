import { useState } from "react";
import { z } from "zod";

interface UserModalProps {
  isOpen: boolean;
  onJoin: (userName: string) => void;
  onSkip: (userName: string) => void;
}

const userNameSchema = z.string().min(1).max(10);

export const UserModal = ({ isOpen, onJoin, onSkip }: UserModalProps) => {
  const [userName, setUserName] = useState("user");

  //   add proper ui validator
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const validatedName = userNameSchema.safeParse(userName.trim());
      if (!validatedName.success) {
        throw new Error(validatedName.error.message);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(error.errors[0].message);
      } else {
        throw new Error("An unexpected error occurred. Please try again.");
      }
    }
    onJoin(userName || "user");
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-background relative w-full max-w-md rounded-lg p-6 shadow-xl">
        <h2 className="text-foreground mb-4 text-xl font-semibold tracking-wide">
          What's your name?
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="userName"
              className="mb-2 block text-sm text-[var(--color-foreground)]/70"
            >
              Enter your name (optional):
            </label>
            <input
              type="text"
              id="userName"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="hide handsome"
              className="bg-secondary text-foreground placeholder:text-foreground/50 w-full rounded-md p-2 outline-none"
              maxLength={10}
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="bg-primary text-foreground hover:bg-primary/90 flex-1 cursor-pointer rounded-md px-4 py-2 text-sm"
            >
              Join
            </button>
            <button
              type="button"
              onClick={() => onSkip(userName)}
              className="bg-primary text-foreground hover:bg-primary/90 cursor-pointer rounded-md px-4 py-2 text-sm"
            >
              Skip
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
