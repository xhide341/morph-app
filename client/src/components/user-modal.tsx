import { useState } from "react";
import { X } from "react-feather";

interface UserModalProps {
  isOpen: boolean;
  onJoin: (userName: string) => void;
  onSkip: () => void;
}

export const UserModal = ({ isOpen, onJoin, onSkip }: UserModalProps) => {
  const [userName, setUserName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const processedName = userName.trim();
    onJoin(processedName || "user");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative w-full max-w-md rounded-lg bg-[var(--color-background)] p-6 shadow-xl">
        <button
          onClick={onSkip}
          className="absolute top-4 right-4 text-[var(--color-foreground)]/50 hover:text-[var(--color-foreground)]"
        >
          <X size={20} />
        </button>

        <h2 className="mb-4 text-xl font-semibold text-[var(--color-foreground)]">
          Join Room
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="userName"
              className="mb-2 block text-sm text-[var(--color-foreground)]/70"
            >
              enter your name (optional)
            </label>
            <input
              type="text"
              id="userName"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="your name"
              className="w-full rounded-md bg-[var(--color-secondary)] p-2 text-[var(--color-foreground)] placeholder:text-[var(--color-foreground)]/50"
              maxLength={50}
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 rounded-md bg-[var(--color-accent)] px-4 py-2 text-[var(--color-foreground)]"
            >
              join
            </button>
            <button
              type="button"
              onClick={onSkip}
              className="rounded-md bg-[var(--color-secondary)] px-4 py-2 text-[var(--color-foreground)]"
            >
              skip
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
