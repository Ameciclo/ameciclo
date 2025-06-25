import { TroubleshootIcon } from "~/components/Commom/Icones/DocumentationIcons";

import { DocumentationComponentProps } from "./types";

export default function Solucoes({ darkMode = true, fontSize = 16 }: DocumentationComponentProps) {
  return (
    <section id="solucoes" className="mb-12">
      <h2 className={`text-2xl lg:text-3xl font-bold ${darkMode ? "text-green-400" : "text-green-700"} mb-4 lg:mb-6 flex items-center gap-3`} style={{ fontSize: fontSize + 8 }}>
        <TroubleshootIcon className="w-6 h-6 lg:w-8 lg:h-8" />
        Soluções
      </h2>
      <div className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} rounded-lg p-4 lg:p-6 border`}>
        <h3 className={`text-xl font-semibold mb-4`} style={{ fontSize: fontSize + 4 }}>Problemas Comuns</h3>
        
        <div className="space-y-6">
          <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'} p-4 rounded`}>
            <h4 className={`font-semibold ${darkMode ? 'text-red-400' : 'text-red-600'} mb-2`} style={{ fontSize: fontSize }}>Erro: "Module not found"</h4>
            <p className="text-sm mb-2" style={{ fontSize: fontSize - 2 }}><strong>Solução:</strong></p>
            <div className={`${darkMode ? 'bg-gray-900' : 'bg-gray-200'} p-2 rounded`}>
              <code className={`${darkMode ? 'text-green-300' : 'text-green-700'} text-sm`} style={{ fontSize: fontSize - 2 }}>npm install</code>
            </div>
            <p className="text-sm mt-2" style={{ fontSize: fontSize - 2 }}>Reinstale as dependências se algum módulo não for encontrado.</p>
          </div>
          
          <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'} p-4 rounded`}>
            <h4 className={`font-semibold ${darkMode ? 'text-red-400' : 'text-red-600'} mb-2`} style={{ fontSize: fontSize }}>Erro: "Port already in use"</h4>
            <p className="text-sm mb-2" style={{ fontSize: fontSize - 2 }}><strong>Solução:</strong></p>
            <div className={`${darkMode ? 'bg-gray-900' : 'bg-gray-200'} p-2 rounded`}>
              <code className={`${darkMode ? 'text-green-300' : 'text-green-700'} text-sm`} style={{ fontSize: fontSize - 2 }}>npx kill-port 5173</code>
            </div>
            <p className="text-sm mt-2" style={{ fontSize: fontSize - 2 }}>Mate o processo que está usando a porta 5173.</p>
          </div>
          
          <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'} p-4 rounded`}>
            <h4 className={`font-semibold ${darkMode ? 'text-red-400' : 'text-red-600'} mb-2`} style={{ fontSize: fontSize }}>Erro de API: "Failed to fetch" ou "504 Gateway Timeout"</h4>
            <p className="text-sm mb-2" style={{ fontSize: fontSize - 2 }}><strong>Possíveis causas:</strong></p>
            <ul className="text-sm list-disc list-inside space-y-1" style={{ fontSize: fontSize - 2 }}>
              <li>API externa indisponível</li>
              <li>Problemas de CORS</li>
              <li>URL da API incorreta</li>
              <li>Timeout na conexão com a API</li>
            </ul>
            <p className="text-sm mt-2" style={{ fontSize: fontSize - 2 }}><strong>Solução:</strong> Use o utilitário fetchWithTimeout para definir um timeout e fornecer dados de fallback.</p>
          </div>
          
          <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'} p-4 rounded`}>
            <h4 className={`font-semibold ${darkMode ? 'text-red-400' : 'text-red-600'} mb-2`} style={{ fontSize: fontSize }}>Problemas com react-map-gl</h4>
            <p className="text-sm mb-2" style={{ fontSize: fontSize - 2 }}><strong>Solução:</strong></p>
            <div className={`${darkMode ? 'bg-gray-900' : 'bg-gray-200'} p-2 rounded`}>
              <code className={`${darkMode ? 'text-green-300' : 'text-green-700'} text-sm`} style={{ fontSize: fontSize - 2 }}>npm remove react-map-gl && npm install react-map-gl@6</code>
            </div>
            <p className="text-sm mt-2" style={{ fontSize: fontSize - 2 }}>Use a versão 6 para compatibilidade com Vite.</p>
          </div>
        </div>
        
        <div className={`mt-6 p-4 ${darkMode ? 'bg-yellow-900 border-yellow-600' : 'bg-yellow-50 border-yellow-200'} border rounded`}>
          <p className={`${darkMode ? 'text-yellow-200' : 'text-yellow-800'}`} style={{ fontSize: fontSize - 2 }}>
            <strong>Dica:</strong> Se o problema persistir, consulte os issues no GitHub ou abra um novo issue com detalhes do erro.
          </p>
        </div>
      </div>
    </section>
  );
}