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
        <p className="mb-4" style={{ fontSize: fontSize }}>O projeto pode utilizar variáveis de ambiente para configurações específicas:</p>
        
        <div className="space-y-4">
          <div>
            <p className="mb-2" style={{ fontSize: fontSize - 2 }}>Crie um arquivo <code className={`${darkMode ? 'bg-gray-700' : 'bg-gray-200'} px-2 py-1 rounded`}>.env</code> na raiz do projeto:</p>
            <div className={`${darkMode ? "bg-gray-900 border-gray-600" : "bg-gray-100 border-gray-300"} p-3 rounded border`}>
              <code className={`${darkMode ? "text-green-300" : "text-green-700"}`} style={{ fontSize: fontSize - 2 }}>
                # APIs<br />
                API_BASE_URL=http://api.garfo.ameciclo.org<br />
                CMS_BASE_URL=http://cms.ameciclo.org<br /><br />
                # Analytics<br />
                GOOGLE_ANALYTICS_ID=G-PQNS7S7FD3<br /><br />
                # Desenvolvimento<br />
                NODE_ENV=development
              </code>
            </div>
          </div>
        </div>
        
        <h3 className="text-xl font-semibold mt-6 mb-4" style={{ fontSize: fontSize + 4 }}>Configurações do Tailwind</h3>
        <div className={`${darkMode ? 'bg-gray-900 border-gray-600' : 'bg-gray-100 border-gray-300'} p-4 rounded border`}>
          <code className={`${darkMode ? 'text-green-300' : 'text-green-700'} text-sm`} style={{ fontSize: fontSize - 2 }}>
{`// tailwind.config.ts
export default {
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ameciclo: "#2E8B57", // Verde Ameciclo
      },
    },
  },
  plugins: [],
};`}
          </code>
        </div>
      </div>
    </section>
  );
}