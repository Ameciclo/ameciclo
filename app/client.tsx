import { StartClient } from "@tanstack/react-start/client";
import { StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";

// Suppress react-map-gl warnings and errors
const originalWarn = console.warn;
const originalError = console.error;

console.warn = (...args: any[]) => {
  const message = String(args[0] || "");
  if (message.includes("Marker") && message.includes("defaultProps")) {
    return;
  }
  originalWarn.apply(console, args);
};

console.error = (...args: any[]) => {
  const message = String(args[0] || "");
  if (message.includes("setLayerProperty is not a function")) {
    return;
  }
  originalError.apply(console, args);
};

hydrateRoot(
  document,
  <StrictMode>
    <StartClient />
  </StrictMode>
);
