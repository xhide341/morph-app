import { motion, AnimatePresence } from "motion/react";
import { useRoomActivity } from "../hooks/use-room-activity"; // This will be implemented later
import { format } from "date-fns";

interface Activity {
  id: string;
  type: "join" | "leave" | "timer_start" | "timer_complete";
  username: string;
  timestamp: number;
}

export const ActivityLog = ({ roomId }: { roomId: string }) => {
  const { activities } = useRoomActivity(roomId);

  return (
    <div className="max-h-[400px] overflow-y-auto p-4">
      <div className="relative">
        <AnimatePresence initial={false}>
          {activities?.map((activity) => (
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
                  <span className="font-medium">{activity.userName}</span>
                  <span className="text-primary">
                    {activity.type === "join" && "joined the room"}
                    {activity.type === "leave" && "left the room"}
                    {activity.type === "start_timer" && "started a timer"}
                    {activity.type === "pause_timer" && "paused the timer"}
                    {activity.type === "complete_timer" &&
                      "completed the session"}
                  </span>
                  <span className="ml-auto text-xs text-gray-400">
                    {format(new Date(activity.timeStamp), "HH:mm")}
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
