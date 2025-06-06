import { format } from "date-fns";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef } from "react";
import { RoomActivity } from "server/types/room";

export const ActivityLog = ({ activities }: { activities: RoomActivity[] }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [activities]);

  return (
    <div
      ref={scrollRef}
      className="scrollbar-hide mx-auto max-h-[140px] max-w-[90%] overflow-y-auto"
      role="log"
      aria-label="Room activity log"
      aria-live="polite"
    >
      <div className="relative py-2">
        <AnimatePresence mode="popLayout">
          {activities.map((activity) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 1, y: -0.5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{
                duration: 0.4,
                delay: 0.2,
              }}
              className="mb-2"
            >
              <div className="rounded-lg p-1">
                <div className="flex items-center gap-1 text-xs">
                  <span className="font-medium" aria-label="User name">
                    {activity.userName}
                  </span>
                  <span
                    className="text-primary"
                    aria-label="Activity description"
                  >
                    {activity.type === "join" && "joined the room"}
                    {activity.type === "leave" && "left the room"}
                    {activity.type === "start_timer" && "started a timer"}
                    {activity.type === "pause_timer" && "paused the timer"}
                    {activity.type === "complete_timer" &&
                      "completed the session"}
                    {activity.type === "reset_timer" && "stopped the timer"}
                    {activity.type === "change_timer" &&
                      `set timer to ${parseInt(activity.timeRemaining?.split(":")[0] || "0")} minute${parseInt(activity.timeRemaining?.split(":")[0] || "0") !== 1 ? 's' : ''} ${activity.timerMode}`}
                  </span>
                  <span
                    className="ml-auto text-xs text-gray-400"
                    aria-label="Time of activity"
                  >
                    {activity.timeStamp
                      ? format(new Date(activity.timeStamp), "HH:mm")
                      : "00:00"}
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
