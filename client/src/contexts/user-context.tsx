import { createContext, useContext, useState } from "react";

type UserContextType = {
  userName: string;
  setUserName: (name: string) => void;
  clearUserName: () => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  // initialize from localStorage if exists
  const [userName, setUserNameState] = useState(() => {
    const saved = localStorage.getItem("userName");
    return saved ? saved : "";
  });

  // update localStorage when userName changes
  const setUserName = (name: string) => {
    setUserNameState(name);
    localStorage.setItem("userName", name);
  };

  const clearUserName = () => {
    setUserNameState("");
    localStorage.removeItem("userName");
    localStorage.clear();
  };

  return (
    <UserContext.Provider value={{ userName, setUserName, clearUserName }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUserInfo() {
  const context = useContext(UserContext);
  if (!context) throw new Error("No user context found");
  return context;
}
