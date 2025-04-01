import { createContext, useContext, useEffect, useState } from "react";

interface UserContextType {
  userName: string;
  setUserName: (name: string) => void;
  clearUserName: () => void;
}

const UserContext = createContext<UserContextType>({
  userName: "",
  setUserName: () => {},
  clearUserName: () => {},
});

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [userName, setUserNameState] = useState<string>(() => {
    // Get from localStorage on initial load
    const savedName = localStorage.getItem("userName");
    return savedName || "";
  });

  // Set username and save to localStorage
  const setUserName = (name: string) => {
    setUserNameState(name);
    if (name) {
      localStorage.setItem("userName", name);
    }
  };

  // Clear username from state and localStorage
  const clearUserName = () => {
    setUserNameState("");
    localStorage.removeItem("userName");
  };

  // Add event listener for tab/window close
  useEffect(() => {
    const handleBeforeUnload = () => {
      // clear username when tab is closed
      localStorage.removeItem("userName");
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  return (
    <UserContext.Provider value={{ userName, setUserName, clearUserName }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserInfo = () => useContext(UserContext);
