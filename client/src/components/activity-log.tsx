import { motion, AnimatePresence } from "motion/react";
import { useRoomActivity } from "../hooks/use-room-activity"; // This will be implemented later
import { format } from "date-fns";

interface Activity {
  id: string;
  type: "join" | "leave" | "timer_start" | "timer_complete";
  username: string;
  timestamp: number;
}

export const ActivityLog = () => {
  // This hook will be implemented later as per the implementation plan
  // const activities = useRoomActivity();

  const activities: Activity[] = [
    {
      id: "1",
      type: "join",
      username: "Alice",
      timestamp: Date.now() - 5000,
    },
    {
      id: "2",
      type: "leave",
      username: "Bob",
      timestamp: Date.now() - 3000,
    },
    {
      id: "3",
      type: "timer_start",
      username: "Charlie",
      timestamp: Date.now() - 2000,
    },
    {
      id: "4",
      type: "timer_complete",
      username: "David",
      timestamp: Date.now() - 1000,
    },
  ];

  return (
    <div className="max-h-[400px] overflow-y-auto p-4">
      <div className="relative">
        <AnimatePresence initial={false}>
          {activities?.map((activity: Activity) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, height: 0, y: -20 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              transition={{
                duration: 0.3,
                height: { duration: 0.2 },
                opacity: { duration: 0.2 },
              }}
              className="mb-2"
            >
              <div className="rounded-lg p-1">
                <div className="flex items-center gap-1 text-xs">
                  <span className="font-medium">{activity.username}</span>
                  <span className="text-primary">
                    {activity.type === "join" && "joined the room"}
                    {activity.type === "leave" && "left the room"}
                    {activity.type === "timer_start" && "started a timer"}
                    {activity.type === "timer_complete" &&
                      "completed the session"}
                  </span>
                  <span className="ml-auto text-xs text-gray-400">
                    {format(activity.timestamp, "HH:mm")}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ActivityLog;
