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
    // Get from sessionStorage on initial load
    const savedName = sessionStorage.getItem("userName");
    return savedName || "";
  });

  // Set username and save to sessionStorage
  const setUserName = (name: string) => {
    setUserNameState(name);
    if (name) {
      sessionStorage.setItem("userName", name);
    }
  };

  // Clear username from state and sessionStorage
  const clearUserName = () => {
    setUserNameState("");
    sessionStorage.removeItem("userName");
  };

  return (
    <UserContext.Provider value={{ userName, setUserName, clearUserName }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserInfo = () => useContext(UserContext);
