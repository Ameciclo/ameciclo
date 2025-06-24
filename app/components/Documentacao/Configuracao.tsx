import { ConfigIcon } from "~/components/Commom/Icones/DocumentationIcons";

export default function Configuracao() {
  return (
    <section id="configuracao" className="mb-12">
      <h2 className="text-2xl lg:text-3xl font-bold text-green-400 mb-4 lg:mb-6 flex items-center gap-3">
        <ConfigIcon className="w-6 h-6 lg:w-8 lg:h-8" />
        Configuração
      </h2>
      <div className="bg-gray-800 rounded-lg p-4 lg:p-6 border border-gray-700">
        <h3 className="text-xl font-semibold mb-4">Variáveis de Ambiente</h3>
        <p className="mb-4">O projeto pode utilizar variáveis de ambiente para configurações específicas:</p>
        
        <div className="space-y-4">
          <div>
            <p className="mb-2">Crie um arquivo <code className="bg-gray-700 px-2 py-1 rounded">.env</code> na raiz do projeto:</p>
            <div className="bg-gray-900 p-3 rounded border border-gray-600">
              <code className="text-green-300">
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
        
        <h3 className="text-xl font-semibold mt-6 mb-4">Configurações do Tailwind</h3>
        <div className="bg-gray-900 p-4 rounded border border-gray-600">
          <code className="text-green-300 text-sm">
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