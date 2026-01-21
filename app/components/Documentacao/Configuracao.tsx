import { ConfigIcon } from "~/components/Commom/Icones/DocumentationIcons";

import { DocumentationComponentProps } from "./types";

export default function Configuracao({ darkMode = true, fontSize = 16 }: DocumentationComponentProps) {
  return (
    <section id="configuracao" className="mb-12">
      <h2 className={`text-2xl lg:text-3xl font-bold ${darkMode ? "text-green-400" : "text-green-700"} mb-4 lg:mb-6 flex items-center gap-3`} style={{ fontSize: fontSize + 8 }}>
        <ConfigIcon className="w-6 h-6 lg:w-8 lg:h-8" />
        Configuração
      </h2>
      <div className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} rounded-lg p-4 lg:p-6 border`}>
        <h3 className={`text-xl font-semibold mb-4`} style={{ fontSize: fontSize + 4 }}>Variáveis de Ambiente</h3>
        <p className="mb-4" style={{ fontSize: fontSize }}>Configure as variáveis no arquivo <code className={`${darkMode ? 'bg-gray-700' : 'bg-gray-200'} px-2 py-1 rounded`}>.env</code>:</p>
        
        <div className="space-y-4">
          <div>
            <div className={`${darkMode ? "bg-gray-900 border-gray-600" : "bg-gray-100 border-gray-300"} p-3 rounded border`}>
              <code className={`${darkMode ? "text-green-300" : "text-green-700"}`} style={{ fontSize: fontSize - 2 }}>
                # APIs Externas<br />
                API_GARFO_URL=http://api.garfo.ameciclo.org<br />
                CMS_BASE_URL=http://do.strapi.ameciclo.org<br /><br />
                # Mapbox<br />
                MAPBOX_ACCESS_TOKEN=pk.seu_token_aqui<br /><br />
                # Google Calendar<br />
                GOOGLE_CALENDAR_API_KEY=sua_chave_aqui<br /><br />
                # Analytics<br />
                GOOGLE_ANALYTICS_ID=G-PQNS7S7FD3<br /><br />
                # Ambiente<br />
                NODE_ENV=development
              </code>
            </div>
          </div>
        </div>
        
        <h3 className="text-xl font-semibold mt-6 mb-4" style={{ fontSize: fontSize + 4 }}>Configurações Principais</h3>
        
        <div className="space-y-4">
          <div>
            <h4 className={`font-semibold ${darkMode ? 'text-green-400' : 'text-green-700'} mb-2`} style={{ fontSize: fontSize }}>Vite + Remix (vite.config.ts)</h4>
            <div className={`${darkMode ? 'bg-gray-900 border-gray-600' : 'bg-gray-100 border-gray-300'} p-4 rounded border`}>
              <code className={`${darkMode ? 'text-green-300' : 'text-green-700'} text-sm`} style={{ fontSize: fontSize - 2 }}>
{`export default defineConfig({
  plugins: [
    remix({
      presets: [vercelPreset()],
      future: { v3_singleFetch: false }
    })
  ],
  build: {
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('highcharts')) return 'highcharts';
          if (id.includes('mapbox')) return 'mapbox';
          if (id.includes('@fullcalendar')) return 'calendar';
        }
      }
    }
  }
});`}
              </code>
            </div>
          </div>

          <div>
            <h4 className={`font-semibold ${darkMode ? 'text-green-400' : 'text-green-700'} mb-2`} style={{ fontSize: fontSize }}>Tailwind CSS (tailwind.config.ts)</h4>
            <div className={`${darkMode ? 'bg-gray-900 border-gray-600' : 'bg-gray-100 border-gray-300'} p-4 rounded border`}>
              <code className={`${darkMode ? 'text-green-300' : 'text-green-700'} text-sm`} style={{ fontSize: fontSize - 2 }}>
{`module.exports = {
  content: ["./app/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ameciclo: "#008080",
        ideciclo: "#5050aa"
      },
      height: {
        cover: "52vh",
        "no-cover": "25vh"
      }
    }
  }
};`}
              </code>
            </div>
          </div>

          <div>
            <h4 className={`font-semibold ${darkMode ? 'text-green-400' : 'text-green-700'} mb-2`} style={{ fontSize: fontSize }}>TypeScript (tsconfig.json)</h4>
            <div className={`${darkMode ? 'bg-gray-900 border-gray-600' : 'bg-gray-100 border-gray-300'} p-4 rounded border`}>
              <code className={`${darkMode ? 'text-green-300' : 'text-green-700'} text-sm`} style={{ fontSize: fontSize - 2 }}>
{`{
  "compilerOptions": {
    "lib": ["DOM", "DOM.Iterable", "ES2022"],
    "jsx": "react-jsx",
    "module": "ESNext",
    "target": "ES2022",
    "strict": true,
    "baseUrl": ".",
    "paths": { "~/*": ["./app/*"] }
  }
}`}
              </code>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}