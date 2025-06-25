import { DeployIcon } from "~/components/Commom/Icones/DocumentationIcons";

import { DocumentationComponentProps } from "./types";

export default function Deploy({ darkMode = true, fontSize = 16 }: DocumentationComponentProps) {
  return (
    <section id="deploy" className="mb-12">
      <h2 className={`text-2xl lg:text-3xl font-bold ${darkMode ? "text-green-400" : "text-green-700"} mb-4 lg:mb-6 flex items-center gap-3`} style={{ fontSize: fontSize + 8 }}>
        <DeployIcon className="w-6 h-6 lg:w-8 lg:h-8" />
        Deploy
      </h2>
      <div className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} rounded-lg p-4 lg:p-6 border`}>
        <h3 className={`text-xl font-semibold mb-4`} style={{ fontSize: fontSize + 4 }}>Dependências Principais</h3>
        <div className="space-y-4 mb-8">
          <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'} p-4 rounded`}>
            <h4 className={`font-semibold ${darkMode ? 'text-green-400' : 'text-green-700'} mb-3`} style={{ fontSize: fontSize }}>Framework e Core</h4>
            <ul className="text-sm space-y-2" style={{ fontSize: fontSize - 2 }}>
              <li><strong className={darkMode ? 'text-blue-300' : 'text-blue-700'}>@remix-run/*</strong> - Framework full-stack React com SSR</li>
              <li><strong className={darkMode ? 'text-blue-300' : 'text-blue-700'}>react</strong> - Biblioteca para interfaces de usuário</li>
              <li><strong className={darkMode ? 'text-blue-300' : 'text-blue-700'}>typescript</strong> - Superset do JavaScript com tipagem</li>
              <li><strong className={darkMode ? 'text-blue-300' : 'text-blue-700'}>vite</strong> - Build tool rápido e moderno</li>
            </ul>
          </div>
          
          <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'} p-4 rounded`}>
            <h4 className={`font-semibold ${darkMode ? 'text-green-400' : 'text-green-700'} mb-3`} style={{ fontSize: fontSize }}>UI e Estilização</h4>
            <ul className="text-sm space-y-2" style={{ fontSize: fontSize - 2 }}>
              <li><strong className={darkMode ? 'text-blue-300' : 'text-blue-700'}>tailwindcss</strong> - Framework CSS utilitário</li>
              <li><strong className={darkMode ? 'text-blue-300' : 'text-blue-700'}>framer-motion</strong> - Animações e transições</li>
              <li><strong className={darkMode ? 'text-blue-300' : 'text-blue-700'}>styled-components</strong> - CSS-in-JS</li>
            </ul>
          </div>
          
          <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'} p-4 rounded`}>
            <h4 className={`font-semibold ${darkMode ? 'text-green-400' : 'text-green-700'} mb-3`} style={{ fontSize: fontSize }}>Funcionalidades Específicas</h4>
            <ul className="text-sm space-y-2" style={{ fontSize: fontSize - 2 }}>
              <li><strong className={darkMode ? 'text-blue-300' : 'text-blue-700'}>@fullcalendar/*</strong> - Calendário interativo para agenda</li>
              <li><strong className={darkMode ? 'text-blue-300' : 'text-blue-700'}>highcharts</strong> - Gráficos e visualizações</li>
              <li><strong className={darkMode ? 'text-blue-300' : 'text-blue-700'}>react-map-gl</strong> - Mapas interativos</li>
              <li><strong className={darkMode ? 'text-blue-300' : 'text-blue-700'}>keen-slider</strong> - Carrossel/slider responsivo</li>
              <li><strong className={darkMode ? 'text-blue-300' : 'text-blue-700'}>react-markdown</strong> - Renderização de Markdown</li>
            </ul>
          </div>
          
          <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'} p-4 rounded`}>
            <h4 className={`font-semibold ${darkMode ? 'text-green-400' : 'text-green-700'} mb-3`} style={{ fontSize: fontSize }}>Utilitários</h4>
            <ul className="text-sm space-y-2" style={{ fontSize: fontSize - 2 }}>
              <li><strong className={darkMode ? 'text-blue-300' : 'text-blue-700'}>match-sorter</strong> - Busca e ordenação inteligente</li>
              <li><strong className={darkMode ? 'text-blue-300' : 'text-blue-700'}>react-spinners</strong> - Indicadores de carregamento</li>
              <li><strong className={darkMode ? 'text-blue-300' : 'text-blue-700'}>react-lazyload</strong> - Carregamento lazy de componentes</li>
            </ul>
          </div>
        </div>
        
        <h3 className={`text-xl font-semibold mb-4`} style={{ fontSize: fontSize + 4 }}>Build para produção</h3>
        <div className="space-y-4">
          <div>
            <p className="mb-2" style={{ fontSize: fontSize - 2 }}>1. Gerar build otimizado:</p>
            <div className={`${darkMode ? "bg-gray-900 border-gray-600" : "bg-gray-100 border-gray-300"} p-3 rounded border`}>
              <code className={`${darkMode ? "text-green-300" : "text-green-700"}`} style={{ fontSize: fontSize - 2 }}>npm run build</code>
            </div>
          </div>
          
          <div>
            <p className="mb-2" style={{ fontSize: fontSize - 2 }}>2. Iniciar servidor de produção:</p>
            <div className={`${darkMode ? "bg-gray-900 border-gray-600" : "bg-gray-100 border-gray-300"} p-3 rounded border`}>
              <code className={`${darkMode ? "text-green-300" : "text-green-700"}`} style={{ fontSize: fontSize - 2 }}>npm start</code>
            </div>
          </div>
        </div>
        
        <div className={`mt-6 p-4 ${darkMode ? 'bg-yellow-900 border-yellow-600' : 'bg-yellow-50 border-yellow-200'} border rounded`}>
          <p className={`${darkMode ? 'text-yellow-200' : 'text-yellow-800'}`} style={{ fontSize: fontSize - 2 }}>
            <strong>Nota:</strong> O pipeline de deploy ainda está em desenvolvimento. 
            Consulte o README.md para atualizações sobre o processo de deploy.
          </p>
        </div>
      </div>
    </section>
  );
}