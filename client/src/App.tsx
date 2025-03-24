import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { SessionPage } from "./pages/session";
import { RoomPage } from "./pages/room";
import { UserProvider } from "./contexts/user-context";
import { ProtectedRoute } from "./components/protected-route";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// TODO: still need to make sure other routes that are not protected are not accessible/redirected to session page

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // for activities, we want immediate updates
      staleTime: 0,
      // enable refetching to ensure sync
      refetchOnWindowFocus: true,
      // add retry for better reliability
      retry: 3,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <Router>
          <div className="min-h-dvh bg-[var(--color-background)]">
            <Routes>
              <Route path="/session" element={<SessionPage />} />
              <Route
                path="/room/:roomId"
                element={
                  <ProtectedRoute>
                    <RoomPage />
                  </ProtectedRoute>
                }
              />

              <Route path="/" element={<Navigate to="/session" replace />} />
            </Routes>
          </div>
        </Router>
      </UserProvider>
    </QueryClientProvider>
  );
}
