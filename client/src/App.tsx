import { Route, BrowserRouter as Router, Routes } from "react-router-dom";

import { UserProvider } from "./contexts/user-context";
import { RoomPage } from "./pages/room";
import { SessionPage } from "./pages/session";

export default function App() {
  return (
    <UserProvider>
      <Router>
        <div className="bg-background font-manrope min-h-dvh">
          <Routes>
            <Route path="/" element={<SessionPage />} />
            <Route path="/room/:roomId" element={<RoomPage />} />
          </Routes>
        </div>
      </Router>
    </UserProvider>
  );
}
