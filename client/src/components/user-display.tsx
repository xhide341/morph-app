import { useEffect, useState } from "react";
import { RoomUser } from "server/types/room";
import { useRoom } from "../hooks/use-room";

import { Plus, Copy } from "react-feather";

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
    setTooltips((prev) => ({ ...prev, add: false }));
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
            {/* tooltip */}
            <div
              className={`bg-secondary absolute -top-10 left-1/2 -translate-x-1/2 rounded-xl p-1 transition-all duration-200 ${
                tooltips[user.userName] ? "visible opacity-100" : "invisible opacity-0"
              }`}
            >
              <div className="text-foreground flex items-center text-xs font-medium whitespace-nowrap">
                <p className="bg-primary/80 rounded-lg px-1.5 py-1 text-gray-800">
                  {user.userName}
                </p>
              </div>
              {/* arrow */}
              <div className="border-t-secondary absolute -bottom-1 left-1/2 h-0 w-0 -translate-x-1/2 border-x-[5px] border-t-[5px] border-solid border-x-transparent"></div>
            </div>
          </div>
        ))}
        <div className="relative flex flex-col items-center justify-center gap-1">
          {/* tooltip */}
          <div
            className={`bg-secondary absolute -top-10 left-1/2 -translate-x-1/2 rounded-xl p-1 pr-1.5 text-xs transition-all duration-200 ${
              tooltips["add"] ? "visible opacity-100" : "invisible opacity-0"
            }`}
            onMouseEnter={() => setTooltips((prev) => ({ ...prev, add: true }))}
            onMouseLeave={() => setTooltips((prev) => ({ ...prev, add: false }))}
          >
            {/* Inner div with white background */}
            <div className="flex items-center text-xs font-thin whitespace-nowrap text-gray-800">
              <p className="bg-primary/80 rounded-lg px-1.5 py-1">{roomUrl}</p>
              <Copy
                className={`ml-1 h-4 w-4 transform cursor-pointer transition-all ${
                  copied ? "text-white/80" : "text-white/50 hover:scale-105 hover:text-white/80"
                }`}
                onClick={handleCopy}
              />
            </div>
            {/* arrow */}
            <div className="border-t-secondary absolute -bottom-1 left-1/2 h-0 w-0 -translate-x-1/2 border-x-[5px] border-t-[5px] border-solid border-x-transparent"></div>
          </div>
          {/* add button */}
          <div
            className="bg-background text-foreground border-foreground flex h-10 w-10 items-center justify-center rounded-full border border-dashed text-lg font-bold"
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
