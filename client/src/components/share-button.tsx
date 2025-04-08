import { useState } from "react";
import { Share2 } from "react-feather";
import { useRoom } from "../hooks/use-room";

export const ShareButton = ({ roomId }: { roomId: string }) => {
  const [copied, setCopied] = useState(false);
  const { shareRoom } = useRoom(roomId);

  const handleShare = async () => {
    try {
      const url = await shareRoom(roomId);
      if (url) {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (error) {
      console.error("Failed to share URL:", error);
    }
  };

  return (
    <button
      onClick={handleShare}
      className="bg-primary hover:bg-primary/80 text-background flex cursor-pointer items-center gap-1 rounded-md px-2 py-2 text-xs font-thin tracking-wide"
      aria-label="Share room link"
    >
      <Share2
        size={12}
        className={`transition-colors ${copied ? "text-background fill-background" : ""}`}
      />
      <span>{copied ? "Copied!" : "Share"}</span>
    </button>
  );
};
