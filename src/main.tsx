import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./styles/globals.css";
import { ColorSchemeScript, createTheme, MantineProvider } from "@mantine/core";

const theme = createTheme({
  fontFamily: "var(--font-roboto)",
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ColorSchemeScript />
    <MantineProvider theme={theme} defaultColorScheme="dark">
      <App />
    </MantineProvider>
  </StrictMode>,
);
