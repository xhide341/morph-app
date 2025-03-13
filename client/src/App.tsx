import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { SessionPage } from "./pages/session";
import { RoomPage } from "./pages/room";

export default function App() {
  return (
    <Router>
      <div className="min-h-dvh bg-[var(--color-background)]">
        <Routes>
          <Route path="/" element={<Navigate to="/session" replace />} />
          <Route path="/session" element={<SessionPage />} />
          <Route path="/room/:sessionId" element={<RoomPage />} />
        </Routes>
      </div>
    </Router>
  );
}
