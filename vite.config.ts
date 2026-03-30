import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { cloudflare } from "@cloudflare/vite-plugin";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  server: {
    host: true,
  },
  plugins: [
    cloudflare({ viteEnvironment: { name: "ssr" } }),
    tanstackStart({ srcDirectory: "app" }),
    react(),
    tsconfigPaths(),
  ],
  build: {
    sourcemap: false,
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes("node_modules")) {
            if (id.includes("highcharts")) {
              return "highcharts";
            }
            if (id.includes("react-map-gl") || id.includes("mapbox-gl")) {
              return "mapbox";
            }
            if (id.includes("@fullcalendar")) {
              return "calendar";
            }
          }
        },
      },
    },
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx"],
  },
});
