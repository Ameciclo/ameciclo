import { vitePlugin as remix } from "@remix-run/dev";
import { installGlobals } from "@remix-run/node";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { vercelPreset } from "@vercel/remix/vite";

installGlobals();



export default defineConfig({
  server: {
    host: true
  },
  plugins: [
    remix({
      presets: [vercelPreset()],
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
        v3_singleFetch: false,
        v3_lazyRouteDiscovery: true,
      },
    }),
    tsconfigPaths(),
  ],
  build: {
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('highcharts')) {
              return 'highcharts';
            }
            if (id.includes('react-map-gl') || id.includes('mapbox-gl')) {
              return 'mapbox';
            }
            if (id.includes('@fullcalendar')) {
              return 'calendar';
            }
          }
        }
      }
    },
    ssr: {
      noExternal: ['@remix-run/server-runtime']
    }
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
  }
});
