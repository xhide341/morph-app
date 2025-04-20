import { useEffect, useState } from "react";
import { Plus } from "react-feather";

import { useRoom } from "../hooks/use-room";
import { RoomUser } from "../types/room";

export const UserDisplay = ({
  users,
  roomId,
}: {
  users: RoomUser[];
  roomId: string;
}) => {
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
    if (roomUrl) {
      setCopied(true);
      navigator.clipboard.writeText(roomUrl).catch((error) => {
        console.error("failed to copy url:", error);
      });
      setTimeout(() => setCopied(false), 3000);
    }
  };

  return (
    <div
      className="flex flex-col items-center gap-4"
      role="region"
      aria-label="Room members"
    >
      <div
        className="flex items-center gap-2"
        role="list"
        aria-label="Active users"
      >
        {activeUsers.map((user) => (
          <div
            key={user.userName}
            className="bg-primary text-background relative flex h-10 w-10 items-center justify-center rounded-full text-center text-lg font-semibold leading-none"
            onMouseEnter={() =>
              setTooltips((prev) => ({
                ...prev,
                [user.userName]: true,
              }))
            }
            onMouseLeave={() =>
              setTooltips((prev) => ({
                ...prev,
                [user.userName]: false,
              }))
            }
            role="listitem"
            aria-label={`User ${user.userName}`}
          >
            <span className="flex items-center justify-center">
              {user.userName.charAt(0)}
            </span>
            {/* tooltip */}
            <div
              className={`bg-secondary absolute -top-10 left-1/2 -translate-x-1/2 rounded-xl p-1 transition-all duration-300 ease-in-out ${
                tooltips[user.userName]
                  ? "visible translate-y-0 opacity-100"
                  : "invisible -translate-y-2 opacity-0"
              }`}
              role="tooltip"
              aria-label={`${user.userName}'s tooltip`}
            >
              <div className="text-foreground flex items-center whitespace-nowrap text-xs font-medium">
                <p className="bg-primary/80 rounded-lg px-1.5 py-1 text-gray-800">
                  {user.userName}
                </p>
              </div>
              {/* arrow */}
              <div
                className="border-t-secondary absolute -bottom-1 left-1/2 h-0 w-0 -translate-x-1/2 border-x-[5px] border-t-[5px] border-solid border-x-transparent"
                aria-hidden="true"
              ></div>
            </div>
          </div>
        ))}
        <div className="relative flex flex-col items-center justify-center gap-1">
          {/* tooltip */}
          <div
            className={`bg-secondary absolute -top-10 left-1/2 -translate-x-1/2 rounded-xl p-1 text-xs transition-all duration-300 ease-in-out ${
              tooltips["add"]
                ? "visible translate-y-0 opacity-100"
                : "invisible -translate-y-2 opacity-0"
            }`}
            onMouseEnter={() => setTooltips((prev) => ({ ...prev, add: true }))}
            onMouseLeave={() =>
              setTooltips((prev) => ({ ...prev, add: false }))
            }
            role="tooltip"
            aria-label="Room URL tooltip"
          >
            {/* Inner div with white background */}
            <div className="flex cursor-pointer items-center whitespace-nowrap text-xs font-thin text-gray-800 transition-colors duration-75">
              <p
                className="bg-primary/80 rounded-lg px-1.5 py-1"
                onClick={handleCopy}
                aria-label={copied ? "URL copied!" : "Copy room URL"}
              >
                {copied ? "URL copied!" : roomUrl}
              </p>
            </div>
            {/* arrow */}
            <div
              className="border-t-secondary absolute -bottom-1 left-1/2 h-0 w-0 -translate-x-1/2 border-x-[5px] border-t-[5px] border-solid border-x-transparent"
              aria-hidden="true"
            ></div>
          </div>
          {/* add button */}
          <div
            className="bg-background text-foreground border-foreground/50 hover:border-primary/70 hover:bg-primary/5 group flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-dashed text-lg font-bold transition-all duration-300"
            onMouseEnter={() => setTooltips((prev) => ({ ...prev, add: true }))}
            onMouseLeave={() =>
              setTooltips((prev) => ({ ...prev, add: false }))
            }
            role="button"
            aria-label="Add user to room"
            onMouseDown={handleCopy}
          >
            <Plus
              className="h-4 w-4 transition-transform duration-300 group-hover:scale-125"
              aria-hidden="true"
            />
          </div>
        </div>
      </div>
      <div className="flex flex-col items-center justify-center text-center">
        <h5 className="text-xs" aria-live="polite">
          There are currently {activeUsers.length}{" "}
          {activeUsers.length === 1 ? "member" : "members"} in this room
        </h5>
      </div>
    </div>
  );
};
