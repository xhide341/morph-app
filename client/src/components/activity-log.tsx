import { motion, AnimatePresence } from "motion/react";
import { RoomActivity } from "server/types/room";
import { format } from "date-fns";
import { useRef, useEffect } from "react";

export const ActivityLog = ({ activities }: { activities: RoomActivity[] }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // auto scroll to bottom when activities change
  useEffect(() => {
    // add small delay to ensure content is rendered
    const timeoutId = setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTo({
          top: scrollRef.current.scrollHeight,
          behavior: "smooth",
        });
      }
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [activities]);

  return (
    <div
      ref={scrollRef}
      className="scrollbar-hide max-h-[120px] overflow-y-auto p-2"
    >
      <div className="relative py-2">
        <AnimatePresence mode="popLayout">
          {activities?.map((activity) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
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
                    {activity.type === "reset_timer" && "stopped the timer"}
                    {activity.type === "change_timer" &&
                      `set timer to ${activity.timeRemaining?.split(":")[0]}-minute ${activity.timerMode}`}
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
