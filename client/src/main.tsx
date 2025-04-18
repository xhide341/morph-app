import { createRoot } from "react-dom/client";

import App from "./App.tsx";
import "./styles/globals.css";
import { initTheme } from "./utils/theme-switch";

// initialize theme from localStorage
initTheme();

createRoot(document.getElementById("root")!).render(<App />);
