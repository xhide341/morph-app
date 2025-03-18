import { Navigate, useLocation } from "react-router-dom";
import { useUserInfo } from "../contexts/user-context";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { userName } = useUserInfo();
  const location = useLocation();

  // If no username, redirect to session page
  if (!userName) {
    return <Navigate to="/session" replace state={{ from: location }} />;
  }

  return <>{children}</>;
}
