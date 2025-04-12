import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { SessionPage } from "./pages/session";
import { RoomPage } from "./pages/room";
import { UserProvider } from "./contexts/user-context";

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
