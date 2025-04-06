import { useEffect, useState } from "react";
import { RoomUser } from "server/types/room";
import { useRoom } from "../hooks/use-room";

import { Plus, Copy } from "react-feather";

// TODO: when the add button is clicked, open a modal with the url of the room

export const UserDisplay = ({ users, roomId }: { users: RoomUser[]; roomId: string }) => {
  const { shareRoom } = useRoom();
  const [roomUrl, setRoomUrl] = useState<string>("");
  const [tooltips, setTooltips] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState(false);
  const activeUsers = users || [];

  useEffect(() => {
    if (!roomId) return;

    const fetchUrl = async () => {
      const url = await shareRoom(roomId);
      if (url) setRoomUrl(url);
    };
    fetchUrl();
  }, [roomId]);

  const handleCopy = () => {
    // Close tooltip instantly - do this first
    setTooltips((prev) => ({ ...prev, add: false }));

    // Then handle the copy operation
    if (roomUrl) {
      navigator.clipboard
        .writeText(roomUrl)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        })
        .catch((error) => {
          console.error("Failed to copy URL:", error);
        });
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-2">
        {activeUsers.map((user) => (
          <div
            key={user.userName}
            className="bg-primary text-foreground relative flex h-10 w-10 items-center justify-center rounded-full text-lg font-bold"
            onMouseEnter={() => setTooltips((prev) => ({ ...prev, [user.userName]: true }))}
            onMouseLeave={() => setTooltips((prev) => ({ ...prev, [user.userName]: false }))}
          >
            {user.userName.charAt(0)}
            <div
              className={`bg-secondary text-foreground absolute -top-8 left-1/2 -translate-x-1/2 rounded px-1.5 py-1 text-xs font-medium whitespace-nowrap transition-all duration-200 ${
                tooltips[user.userName] ? "visible opacity-100" : "invisible opacity-0"
              }`}
            >
              {user.userName}
              <div className="bg-secondary absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 transform"></div>
            </div>
          </div>
        ))}
        {/* mini modal on hover */}
        <div className="relative flex flex-col items-center justify-center gap-1">
          <div
            className={`bg-secondary text-foreground absolute -top-8 left-1/2 flex -translate-x-1/2 rounded px-1.5 py-1 text-xs font-medium whitespace-nowrap transition-none ${
              tooltips["add"] ? "visible opacity-100" : "invisible opacity-0"
            }`}
            onMouseEnter={() => setTooltips((prev) => ({ ...prev, add: true }))}
            onMouseLeave={() => setTooltips((prev) => ({ ...prev, add: false }))}
          >
            {roomUrl}
            <Copy className="hover:text-primary ml-1 h-4 w-4 cursor-pointer" onClick={handleCopy} />
            <div className="bg-secondary absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 transform"></div>
          </div>
          <div
            className="bg-background text-foreground border-foreground flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-dashed text-lg font-bold transition-all duration-200"
            onMouseEnter={() => setTooltips((prev) => ({ ...prev, add: true }))}
            onMouseLeave={() => setTooltips((prev) => ({ ...prev, add: false }))}
          >
            <Plus className="h-4 w-4" />
          </div>
        </div>
      </div>
      <div className="flex flex-col items-center">
        <h5 className="text-xs">
          There are currently {activeUsers.length} {activeUsers.length === 1 ? "member" : "members"}{" "}
          in this room
        </h5>
      </div>
    </div>
  );
};
