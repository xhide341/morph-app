import { useParams, Navigate, useNavigate } from "react-router-dom";

import { ShareButton } from "./share-button";
import ThemeToggle from "./theme-toggle";

export const Header = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  if (!roomId) {
    return <Navigate to="/" />;
  }
  return (
    <div className="flex w-full items-center justify-between p-4">
      <h1
        className="font-qurovademo cursor-pointer text-2xl tracking-wide"
        onClick={() => navigate("/")}
      >
        morph
      </h1>

      <div className="flex items-center gap-2">
        <ShareButton roomId={roomId || ""} />
        <ThemeToggle />
      </div>
    </div>
  );
};

export default Header;
