import { RemixBrowser } from "@remix-run/react";
import { startTransition, StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";

// Suppress react-map-gl warnings and errors
const originalWarn = console.warn;
const originalError = console.error;

console.warn = (...args) => {
  const message = String(args[0] || '');
  if (message.includes('Marker') && message.includes('defaultProps')) {
    return;
  }
  originalWarn.apply(console, args);
};

console.error = (...args) => {
  const message = String(args[0] || '');
  if (message.includes('setLayerProperty is not a function')) {
    return;
  }
  originalError.apply(console, args);
};

startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      <RemixBrowser />
    </StrictMode>
  );
});
