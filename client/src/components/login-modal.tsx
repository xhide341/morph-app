import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { useState } from "react";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [name, setName] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const userName = name.trim() || "user";
    localStorage.setItem("userName", userName);
    onClose();
  };

  const handleSkip = () => {
    localStorage.setItem("userName", "user");
    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      {/* The backdrop, rendered as a fixed sibling to the panel container */}
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      {/* Full-screen container to center the panel */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="w-full max-w-sm rounded-xl bg-[var(--color-primary)] p-6 shadow-xl">
          <DialogTitle className="text-lg font-medium text-[var(--color-foreground)]">
            Welcome! What's your name?
          </DialogTitle>

          <form onSubmit={handleLogin} className="mt-4 flex flex-col gap-4">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="rounded-md bg-[var(--color-secondary)] p-2 text-[var(--color-foreground)] placeholder:text-[var(--color-foreground)]/50 focus:ring-2 focus:ring-[var(--color-accent)] focus:outline-none"
            />

            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 rounded-md bg-[var(--color-accent)] px-3 py-1.5 text-sm font-semibold text-[var(--color-foreground)] shadow-[var(--color-foreground)]/10 shadow-inner hover:bg-[var(--color-secondary)]"
              >
                Continue
              </button>
              <button
                type="button"
                onClick={handleSkip}
                className="flex-1 rounded-md bg-[var(--color-secondary)] px-3 py-1.5 text-sm font-semibold text-[var(--color-foreground)] shadow-[var(--color-foreground)]/10 shadow-inner hover:opacity-80"
              >
                Skip
              </button>
            </div>
          </form>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
