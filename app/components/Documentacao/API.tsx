import { ApiIcon } from "~/components/Commom/Icones/DocumentationIcons";

import { DocumentationComponentProps } from "./types";

export default function API({ darkMode = true, fontSize = 16 }: DocumentationComponentProps) {
  return (
    <section id="api" className="mb-12">
      <h2 className={`text-2xl lg:text-3xl font-bold ${darkMode ? "text-green-400" : "text-green-700"} mb-4 lg:mb-6 flex items-center gap-3`} style={{ fontSize: fontSize + 8 }}>
        <ApiIcon className="w-6 h-6 lg:w-8 lg:h-8" />
        API
      </h2>
      <div className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} rounded-lg p-4 lg:p-6 border`}>
        <p className="mb-6" style={{ fontSize: fontSize }}>A aplicação consome dados de múltiplas APIs externas e internas. Todas as requisições utilizam <code className={`${darkMode ? 'bg-gray-700' : 'bg-gray-200'} px-2 py-1 rounded`}>fetchWithTimeout</code> para garantir resiliência:</p>
        
        <div className="space-y-6">
          <div>
            <h3 className={`text-xl font-semibold ${darkMode ? 'text-green-400' : 'text-green-700'} mb-3`} style={{ fontSize: fontSize + 4 }}>APIs Externas</h3>
            <div className="space-y-4">
              <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'} p-4 rounded`}>
                <div className={`font-semibold ${darkMode ? 'text-green-400' : 'text-green-700'} mb-2`} style={{ fontSize: fontSize }}>API Garfo - Contagens de Ciclistas</div>
                <code className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'} block mb-2`} style={{ fontSize: fontSize - 2 }}>GET http://api.garfo.ameciclo.org/cyclist-counts</code>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`} style={{ fontSize: fontSize - 2 }}>Retorna lista de contagens realizadas</p>
                <code className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'} block`} style={{ fontSize: fontSize - 2 }}>GET http://api.garfo.ameciclo.org/cyclist-counts/edition/:id</code>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} style={{ fontSize: fontSize - 2 }}>Detalhes de uma contagem específica</p>
              </div>
              
              <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'} p-4 rounded`}>
                <div className={`font-semibold ${darkMode ? 'text-green-400' : 'text-green-700'} mb-2`} style={{ fontSize: fontSize }}>CMS Strapi - Conteúdo</div>
                <code className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'} block mb-2`} style={{ fontSize: fontSize - 2 }}>GET http://do.strapi.ameciclo.org/api/projetos</code>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`} style={{ fontSize: fontSize - 2 }}>Lista de projetos da organização</p>
                <code className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'} block`} style={{ fontSize: fontSize - 2 }}>GET http://do.strapi.ameciclo.org/api/projetos/:slug</code>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} style={{ fontSize: fontSize - 2 }}>Detalhes de um projeto</p>
              </div>

              <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'} p-4 rounded`}>
                <div className={`font-semibold ${darkMode ? 'text-green-400' : 'text-green-700'} mb-2`} style={{ fontSize: fontSize }}>Google Calendar API</div>
                <code className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'} block mb-2`} style={{ fontSize: fontSize - 2 }}>Integração via FullCalendar</code>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} style={{ fontSize: fontSize - 2 }}>Eventos da agenda da Ameciclo</p>
              </div>

              <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'} p-4 rounded`}>
                <div className={`font-semibold ${darkMode ? 'text-green-400' : 'text-green-700'} mb-2`} style={{ fontSize: fontSize }}>Mapbox API</div>
                <code className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'} block mb-2`} style={{ fontSize: fontSize - 2 }}>Token configurado via variável de ambiente</code>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} style={{ fontSize: fontSize - 2 }}>Mapas interativos em várias páginas</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className={`text-xl font-semibold ${darkMode ? 'text-green-400' : 'text-green-700'} mb-3`} style={{ fontSize: fontSize + 4 }}>Serviço fetchWithTimeout</h3>
            <div className={`${darkMode ? 'bg-gray-900 border-gray-600' : 'bg-gray-100 border-gray-300'} p-4 rounded border`}>
              <code className={`${darkMode ? 'text-green-300' : 'text-green-700'} text-sm`} style={{ fontSize: fontSize - 2 }}>
{`// app/services/fetchWithTimeout.ts
export async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeout: number = 5000,
  fallbackData: any = null,
  onApiDown?: (error: string) => void,
  retries: number = 1
): Promise<any> {
  // Implementa timeout, retries e fallback
  // Garante resiliência quando APIs estão indisponíveis
}`}
              </code>
            </div>
          </div>
          
          <div>
            <h3 className={`text-xl font-semibold ${darkMode ? 'text-green-400' : 'text-green-700'} mb-3`} style={{ fontSize: fontSize + 4 }}>Estrutura de Dados - Contagens</h3>
            <div className={`${darkMode ? 'bg-gray-900 border-gray-600' : 'bg-gray-100 border-gray-300'} p-4 rounded border`}>
              <code className={`${darkMode ? 'text-green-300' : 'text-green-700'} text-sm`} style={{ fontSize: fontSize - 2 }}>
{`{
  "counts": [
    {
      "id": 1,
      "name": "Ponte do Jiquiá",
      "slug": "ponte-do-jiquia",
      "date": "2024-03-15",
      "total_cyclists": 245,
      "total_women": 89,
      "total_helmet": 156,
      "total_juveniles": 23,
      "location": {
        "lat": -8.0476,
        "lng": -34.8770
      }
    }
  ]
}`}
              </code>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}