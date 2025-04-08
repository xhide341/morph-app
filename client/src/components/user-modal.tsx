import { useState } from "react";
import { z } from "zod";
import { AlertCircle } from "react-feather";

interface UserModalProps {
  isOpen: boolean;
  onJoin: (userName: string) => void;
  onSkip: (userName: string) => void;
}

const userNameSchema = z.string().min(1).max(10);

export const UserModal = ({ isOpen, onJoin, onSkip }: UserModalProps) => {
  const [userName, setUserName] = useState("");
  const [validationError, setValidationError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setValidationError("");

    try {
      const validatedName = userNameSchema.safeParse(userName.trim());
      if (!validatedName.success) {
        setValidationError(validatedName.error.errors[0].message);
        return;
      }
      onJoin(userName || "user");
    } catch (error) {
      if (error instanceof z.ZodError) {
        setValidationError(error.errors[0].message);
      }
    }
  }

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      role="dialog"
      aria-labelledby="modal-title"
      aria-modal="true"
    >
      <div className="bg-background relative w-full max-w-md rounded-lg p-6 shadow-xl">
        <h2 id="modal-title" className="text-foreground mb-4 text-lg font-semibold tracking-wide">
          What's your name?
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="space-y-2">
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
              placeholder="user"
              className="bg-secondary text-foreground placeholder:text-foreground/50 w-full rounded-md p-2 text-sm outline-none"
              maxLength={10}
              aria-invalid={!!validationError}
              aria-describedby={validationError ? "validation-error" : undefined}
            />
            {validationError && (
              <p
                id="validation-error"
                className="text-primary flex items-center gap-1 text-xs font-medium"
                role="alert"
              >
                <AlertCircle className="text-yellow" size={12} aria-hidden="true" />
                {validationError}
              </p>
            )}
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="bg-primary text-background hover:bg-primary/90 flex-1 cursor-pointer rounded-md px-4 py-2 text-sm"
            >
              Join
            </button>
            <button
              type="button"
              onClick={() => onSkip("user")}
              className="bg-primary text-background hover:bg-primary/90 cursor-pointer rounded-md px-4 py-2 text-sm"
            >
              Skip
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
