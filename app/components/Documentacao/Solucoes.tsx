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
            <h4 className={`font-semibold ${darkMode ? 'text-red-400' : 'text-red-600'} mb-2`} style={{ fontSize: fontSize }}>Erro: "Module not found" ou problemas com node_modules</h4>
            <p className="text-sm mb-2" style={{ fontSize: fontSize - 2 }}><strong>Solução:</strong></p>
            <div className={`${darkMode ? 'bg-gray-900' : 'bg-gray-200'} p-2 rounded mb-2`}>
              <code className={`${darkMode ? 'text-green-300' : 'text-green-700'} text-sm`} style={{ fontSize: fontSize - 2 }}>rm -rf node_modules package-lock.json && npm install</code>
            </div>
            <p className="text-sm" style={{ fontSize: fontSize - 2 }}>Limpa e reinstala todas as dependências.</p>
          </div>
          
          <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'} p-4 rounded`}>
            <h4 className={`font-semibold ${darkMode ? 'text-red-400' : 'text-red-600'} mb-2`} style={{ fontSize: fontSize }}>Erro: "Port already in use" (porta 5173)</h4>
            <p className="text-sm mb-2" style={{ fontSize: fontSize - 2 }}><strong>Solução:</strong></p>
            <div className={`${darkMode ? 'bg-gray-900' : 'bg-gray-200'} p-2 rounded mb-2`}>
              <code className={`${darkMode ? 'text-green-300' : 'text-green-700'} text-sm`} style={{ fontSize: fontSize - 2 }}>lsof -ti:5173 | xargs kill -9</code>
            </div>
            <p className="text-sm" style={{ fontSize: fontSize - 2 }}>Mata o processo usando a porta.</p>
          </div>
          
          <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'} p-4 rounded`}>
            <h4 className={`font-semibold ${darkMode ? 'text-red-400' : 'text-red-600'} mb-2`} style={{ fontSize: fontSize }}>Erro de API: "Failed to fetch", "504 Gateway Timeout" ou "ECONNREFUSED"</h4>
            <p className="text-sm mb-2" style={{ fontSize: fontSize - 2 }}><strong>Causa:</strong> API externa indisponível ou timeout</p>
            <p className="text-sm mb-2" style={{ fontSize: fontSize - 2 }}><strong>Solução:</strong> O sistema já usa <code className={`${darkMode ? 'bg-gray-600' : 'bg-gray-300'} px-1 rounded`}>fetchWithTimeout</code> com fallback automático. Verifique:</p>
            <ul className="text-sm list-disc list-inside space-y-1 ml-4" style={{ fontSize: fontSize - 2 }}>
              <li>Status da API em /status (se disponível)</li>
              <li>Logs do console para detalhes do erro</li>
              <li>Dados de fallback em app/services/staticFallbacks.ts</li>
            </ul>
          </div>
          
          <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'} p-4 rounded`}>
            <h4 className={`font-semibold ${darkMode ? 'text-red-400' : 'text-red-600'} mb-2`} style={{ fontSize: fontSize }}>Erro: "Mapbox token not found" ou mapa não carrega</h4>
            <p className="text-sm mb-2" style={{ fontSize: fontSize - 2 }}><strong>Solução:</strong></p>
            <div className={`${darkMode ? 'bg-gray-900' : 'bg-gray-200'} p-2 rounded mb-2`}>
              <code className={`${darkMode ? 'text-green-300' : 'text-green-700'} text-sm`} style={{ fontSize: fontSize - 2 }}>MAPBOX_ACCESS_TOKEN=pk.seu_token_aqui</code>
            </div>
            <p className="text-sm" style={{ fontSize: fontSize - 2 }}>Configure o token no .env. Obtenha em mapbox.com</p>
          </div>

          <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'} p-4 rounded`}>
            <h4 className={`font-semibold ${darkMode ? 'text-red-400' : 'text-red-600'} mb-2`} style={{ fontSize: fontSize }}>Erro: TypeScript "Type error" ou "Cannot find module"</h4>
            <p className="text-sm mb-2" style={{ fontSize: fontSize - 2 }}><strong>Solução:</strong></p>
            <div className={`${darkMode ? 'bg-gray-900' : 'bg-gray-200'} p-2 rounded mb-2`}>
              <code className={`${darkMode ? 'text-green-300' : 'text-green-700'} text-sm`} style={{ fontSize: fontSize - 2 }}>npm run typecheck</code>
            </div>
            <p className="text-sm" style={{ fontSize: fontSize - 2 }}>Verifica erros de tipo. Use <code className={`${darkMode ? 'bg-gray-600' : 'bg-gray-300'} px-1 rounded`}>// @ts-ignore</code> apenas em casos extremos.</p>
          </div>

          <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'} p-4 rounded`}>
            <h4 className={`font-semibold ${darkMode ? 'text-red-400' : 'text-red-600'} mb-2`} style={{ fontSize: fontSize }}>Erro: Build falha com "Chunk size warning" ou "Out of memory"</h4>
            <p className="text-sm mb-2" style={{ fontSize: fontSize - 2 }}><strong>Solução:</strong> Já configurado code splitting no vite.config.ts</p>
            <div className={`${darkMode ? 'bg-gray-900' : 'bg-gray-200'} p-2 rounded mb-2`}>
              <code className={`${darkMode ? 'text-green-300' : 'text-green-700'} text-sm`} style={{ fontSize: fontSize - 2 }}>NODE_OPTIONS="--max-old-space-size=4096" npm run build</code>
            </div>
            <p className="text-sm" style={{ fontSize: fontSize - 2 }}>Aumenta memória do Node se necessário.</p>
          </div>

          <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'} p-4 rounded`}>
            <h4 className={`font-semibold ${darkMode ? 'text-red-400' : 'text-red-600'} mb-2`} style={{ fontSize: fontSize }}>Problema: Highcharts não renderiza ou erro "Highcharts is not defined"</h4>
            <p className="text-sm mb-2" style={{ fontSize: fontSize - 2 }}><strong>Solução:</strong> Usar ClientOnly ou lazy loading</p>
            <div className={`${darkMode ? 'bg-gray-900' : 'bg-gray-200'} p-2 rounded`}>
              <code className={`${darkMode ? 'text-green-300' : 'text-green-700'} text-sm`} style={{ fontSize: fontSize - 2 }}>
{`import { ClientOnly } from "remix-utils/client-only";
<ClientOnly>{() => <ChartComponent />}</ClientOnly>`}
              </code>
            </div>
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