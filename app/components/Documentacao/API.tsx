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
        <p className="mb-6" style={{ fontSize: fontSize }}>A aplicação consome dados de diferentes APIs para fornecer informações sobre mobilidade ativa:</p>
        
        <div className="space-y-6">
          <div>
            <h3 className={`text-xl font-semibold ${darkMode ? 'text-green-400' : 'text-green-700'} mb-3`} style={{ fontSize: fontSize + 4 }}>Endpoints principais</h3>
            <div className="space-y-4">
              <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'} p-4 rounded`}>
                <div className={`font-semibold ${darkMode ? 'text-green-400' : 'text-green-700'} mb-2`} style={{ fontSize: fontSize }}>Contagens de Ciclistas</div>
                <code className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'} block mb-2`} style={{ fontSize: fontSize - 2 }}>GET http://api.garfo.ameciclo.org/cyclist-counts</code>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} style={{ fontSize: fontSize - 2 }}>Retorna dados de contagens de ciclistas realizadas em diferentes pontos da cidade</p>
              </div>
              
              <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'} p-4 rounded`}>
                <div className={`font-semibold ${darkMode ? 'text-green-400' : 'text-green-700'} mb-2`} style={{ fontSize: fontSize }}>Contagem Individual</div>
                <code className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'} block mb-2`} style={{ fontSize: fontSize - 2 }}>GET http://api.garfo.ameciclo.org/cyclist-counts/edition/:id</code>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} style={{ fontSize: fontSize - 2 }}>Retorna dados detalhados de uma contagem específica</p>
              </div>
              
              <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'} p-4 rounded`}>
                <div className={`font-semibold ${darkMode ? 'text-green-400' : 'text-green-700'} mb-2`} style={{ fontSize: fontSize }}>CMS - Conteúdo</div>
                <code className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'} block mb-2`} style={{ fontSize: fontSize - 2 }}>GET http://cms.ameciclo.org/api/</code>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} style={{ fontSize: fontSize - 2 }}>Sistema de gerenciamento de conteúdo para projetos e informações</p>
              </div>
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