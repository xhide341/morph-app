import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/globals.css";
import "@mantine/core/styles.css";
import App from "./App.tsx";
import { ColorSchemeScript, createTheme, MantineProvider } from "@mantine/core";

const theme = createTheme({
  fontFamily: "Inter, sans-serif",
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ColorSchemeScript />
    <MantineProvider theme={theme} defaultColorScheme="dark">
      <App />
    </MantineProvider>
  </StrictMode>
);
