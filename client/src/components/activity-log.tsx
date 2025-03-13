import { motion, AnimatePresence } from "motion/react";
import { useRoomActivity } from "../hooks/use-room-activity"; // This will be implemented later
import { format } from "date-fns";
interface Activity {
  id: string;
  type: "join" | "leave" | "timer_start" | "timer_complete";
  username: string;
  timestamp: number;
}

const ActivityLog = () => {
  // This hook will be implemented later as per the implementation plan
  const activities = useRoomActivity();

  return (
    <div className="max-h-[400px] overflow-y-auto p-4">
      <h2 className="mb-4 text-xl font-semibold">Room Activity</h2>
      <AnimatePresence mode="popLayout">
        {activities?.map((activity: Activity) => (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="mb-2 rounded-lg bg-gray-100 p-3"
          >
            <div className="flex items-center gap-2">
              {activity.type === "join" && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="h-2 w-2 rounded-full bg-green-500"
                />
              )}
              <span className="font-medium">{activity.username}</span>
              <span className="text-gray-600">
                {activity.type === "join" ? "joined" : "left"} the room
              </span>
              <span className="ml-auto text-sm text-gray-400">
                {format(activity.timestamp, "HH:mm")}
              </span>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ActivityLog;
