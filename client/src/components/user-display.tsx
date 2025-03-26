import { useState } from "react";
import { RoomActivity } from "server/types/room";
import { Plus } from "react-feather";

// TODO: Add a modal to add a new user, the modal contains the url of the room

export const UserDisplay = ({ activities }: { activities: RoomActivity[] }) => {
  const filteredActivities = [
    ...new Set(activities.filter((activity) => activity.userName)),
  ];
  const userNames = filteredActivities.map((activity) => activity.userName);
  const [tooltips, setTooltips] = useState<Record<string, boolean>>({});

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-2">
        {userNames.map((userName, index) => (
          <div
            key={userName + index}
            className="bg-primary text-foreground relative flex h-10 w-10 items-center justify-center rounded-full text-lg font-bold"
            onMouseEnter={() =>
              setTooltips((prev) => ({ ...prev, [userName + index]: true }))
            }
            onMouseLeave={() =>
              setTooltips((prev) => ({ ...prev, [userName + index]: false }))
            }
          >
            {userName.charAt(0)}
            <div
              className={`bg-secondary text-foreground absolute -top-8 left-1/2 -translate-x-1/2 rounded px-2 py-1 text-xs font-medium whitespace-nowrap transition-all duration-200 ${
                tooltips[userName + index]
                  ? "visible opacity-100"
                  : "invisible opacity-0"
              }`}
            >
              {userName}
            </div>
          </div>
        ))}
        <div className="bg-background text-foreground border-foreground flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-dashed text-lg font-bold">
          <Plus className="h-4 w-4" />
        </div>
      </div>
      <div className="flex flex-col items-center">
        <h5 className="text-xs">
          There are currently {userNames.length}{" "}
          {userNames.length === 1 ? "member" : "members"} in this room
        </h5>
      </div>
    </div>
  );
};
