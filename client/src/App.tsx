import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { SessionPage } from "./pages/session";
import Header from "./components/header";
import { Clock } from "./components/clock";
import ThemeToggle from "./components/theme-toggle";

export const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/session" replace />} />
        <Route path="/session" element={<SessionPage />} />
        <Route
          path="/room/:sessionId"
          element={
            <div className="font-roboto mx-auto flex h-dvh w-full max-w-dvw flex-col bg-[var(--color-background)] p-4 text-[var(--color-foreground)]">
              <div className="mx-auto flex w-full max-w-3xl flex-col">
                <Header />
                <Clock />
                <ThemeToggle />
              </div>
            </div>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
