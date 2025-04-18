import { Navigate, useNavigate, useParams } from "react-router-dom";

import { ShareButton } from "./share-button";
import ThemeToggle from "./theme-toggle";

export const Header = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  if (!roomId) {
    return <Navigate to="/" />;
  }
  return (
    <header
      className="flex w-full items-center justify-between px-2 py-3 sm:p-4"
      role="banner"
    >
      <h1
        className="font-qurova cursor-pointer text-xl font-semibold tracking-wide sm:text-2xl"
        onClick={() => navigate("/")}
        role="link"
        aria-label="Return to home page"
      >
        morph
      </h1>

      <nav
        className="flex items-center gap-2"
        role="navigation"
        aria-label="Room actions"
      >
        <ShareButton roomId={roomId || ""} />
        <ThemeToggle />
      </nav>
    </header>
  );
};

export default Header;
