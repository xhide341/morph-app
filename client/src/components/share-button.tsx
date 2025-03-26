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
      className="css-button-3d flex items-center gap-2 p-2"
      aria-label="Share room link"
    >
      <Share2 size={16} />
      <span>{copied ? "Copied!" : "Share"}</span>
    </button>
  );
};
