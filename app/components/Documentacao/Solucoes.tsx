import { TroubleshootIcon } from "~/components/Commom/Icones/DocumentationIcons";

export default function Solucoes() {
  return (
    <section id="solucoes" className="mb-12">
      <h2 className="text-2xl lg:text-3xl font-bold text-green-400 mb-4 lg:mb-6 flex items-center gap-3">
        <TroubleshootIcon className="w-6 h-6 lg:w-8 lg:h-8" />
        Soluções
      </h2>
      <div className="bg-gray-800 rounded-lg p-4 lg:p-6 border border-gray-700">
        <h3 className="text-xl font-semibold mb-4">Problemas Comuns</h3>
        
        <div className="space-y-6">
          <div className="bg-gray-700 p-4 rounded">
            <h4 className="font-semibold text-red-400 mb-2">Erro: "Module not found"</h4>
            <p className="text-sm mb-2"><strong>Solução:</strong></p>
            <div className="bg-gray-900 p-2 rounded">
              <code className="text-green-300 text-sm">npm install</code>
            </div>
            <p className="text-sm mt-2">Reinstale as dependências se algum módulo não for encontrado.</p>
          </div>
          
          <div className="bg-gray-700 p-4 rounded">
            <h4 className="font-semibold text-red-400 mb-2">Erro: "Port already in use"</h4>
            <p className="text-sm mb-2"><strong>Solução:</strong></p>
            <div className="bg-gray-900 p-2 rounded">
              <code className="text-green-300 text-sm">npx kill-port 5173</code>
            </div>
            <p className="text-sm mt-2">Mate o processo que está usando a porta 5173.</p>
          </div>
          
          <div className="bg-gray-700 p-4 rounded">
            <h4 className="font-semibold text-red-400 mb-2">Erro de API: "Failed to fetch" ou "504 Gateway Timeout"</h4>
            <p className="text-sm mb-2"><strong>Possíveis causas:</strong></p>
            <ul className="text-sm list-disc list-inside space-y-1">
              <li>API externa indisponível</li>
              <li>Problemas de CORS</li>
              <li>URL da API incorreta</li>
              <li>Timeout na conexão com a API</li>
            </ul>
            <p className="text-sm mt-2"><strong>Solução:</strong> Use o utilitário fetchWithTimeout para definir um timeout e fornecer dados de fallback.</p>
          </div>
          
          <div className="bg-gray-700 p-4 rounded">
            <h4 className="font-semibold text-red-400 mb-2">Problemas com react-map-gl</h4>
            <p className="text-sm mb-2"><strong>Solução:</strong></p>
            <div className="bg-gray-900 p-2 rounded">
              <code className="text-green-300 text-sm">npm remove react-map-gl && npm install react-map-gl@6</code>
            </div>
            <p className="text-sm mt-2">Use a versão 6 para compatibilidade com Vite.</p>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-yellow-900 border border-yellow-600 rounded">
          <p className="text-yellow-200">
            <strong>Dica:</strong> Se o problema persistir, consulte os issues no GitHub ou abra um novo issue com detalhes do erro.
          </p>
        </div>
      </div>
    </section>
  );
}