import { useState, useEffect } from "react";

interface SessionData {
  userName: string;
  roomId: string;
}

export const useSession = () => {
  const [sessionData, setSessionData] = useState<SessionData | null>(() => {
    // try to get initial data from storage
    const stored = localStorage.getItem("session_data");
    return stored ? JSON.parse(stored) : null;
  });

  // persist session data changes to storage
  useEffect(() => {
    if (sessionData) {
      localStorage.setItem("session_data", JSON.stringify(sessionData));
    } else {
      localStorage.removeItem("session_data");
    }
  }, [sessionData]);

  const saveSession = (data: SessionData) => {
    setSessionData(data);
  };

  const clearSession = () => {
    setSessionData(null);
  };

  return {
    sessionData,
    saveSession,
    clearSession,
  };
};
