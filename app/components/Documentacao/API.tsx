import { ApiIcon } from "~/components/Commom/Icones/DocumentationIcons";

export default function API() {
  return (
    <section id="api" className="mb-12">
      <h2 className="text-2xl lg:text-3xl font-bold text-green-400 mb-4 lg:mb-6 flex items-center gap-3">
        <ApiIcon className="w-6 h-6 lg:w-8 lg:h-8" />
        API
      </h2>
      <div className="bg-gray-800 rounded-lg p-4 lg:p-6 border border-gray-700">
        <p className="mb-6">A aplicação consome dados de diferentes APIs para fornecer informações sobre mobilidade ativa:</p>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold text-green-400 mb-3">Endpoints principais</h3>
            <div className="space-y-4">
              <div className="bg-gray-700 p-4 rounded">
                <div className="font-semibold text-green-400 mb-2">Contagens de Ciclistas</div>
                <code className="text-sm text-gray-300 block mb-2">GET http://api.garfo.ameciclo.org/cyclist-counts</code>
                <p className="text-sm text-gray-400">Retorna dados de contagens de ciclistas realizadas em diferentes pontos da cidade</p>
              </div>
              
              <div className="bg-gray-700 p-4 rounded">
                <div className="font-semibold text-green-400 mb-2">Contagem Individual</div>
                <code className="text-sm text-gray-300 block mb-2">GET http://api.garfo.ameciclo.org/cyclist-counts/edition/:id</code>
                <p className="text-sm text-gray-400">Retorna dados detalhados de uma contagem específica</p>
              </div>
              
              <div className="bg-gray-700 p-4 rounded">
                <div className="font-semibold text-green-400 mb-2">CMS - Conteúdo</div>
                <code className="text-sm text-gray-300 block mb-2">GET http://cms.ameciclo.org/api/</code>
                <p className="text-sm text-gray-400">Sistema de gerenciamento de conteúdo para projetos e informações</p>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold text-green-400 mb-3">Estrutura de Dados - Contagens</h3>
            <div className="bg-gray-900 p-4 rounded border border-gray-600">
              <code className="text-green-300 text-sm">
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