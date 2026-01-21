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
        <h3 className={`text-xl font-semibold mb-4`} style={{ fontSize: fontSize + 4 }}>Dependências Principais (40+ pacotes)</h3>
        <div className="space-y-4 mb-8">
          <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'} p-4 rounded`}>
            <h4 className={`font-semibold ${darkMode ? 'text-green-400' : 'text-green-700'} mb-3`} style={{ fontSize: fontSize }}>Framework e Core</h4>
            <ul className="text-sm space-y-2" style={{ fontSize: fontSize - 2 }}>
              <li><strong className={darkMode ? 'text-blue-300' : 'text-blue-700'}>@remix-run/*</strong> (v2.16.5) - Framework full-stack com SSR, file-based routing, loaders</li>
              <li><strong className={darkMode ? 'text-blue-300' : 'text-blue-700'}>@vercel/remix</strong> (v2.16.7) - Adapter para deploy na Vercel</li>
              <li><strong className={darkMode ? 'text-blue-300' : 'text-blue-700'}>react</strong> (v18.2.0) + <strong>react-dom</strong> - Biblioteca UI</li>
              <li><strong className={darkMode ? 'text-blue-300' : 'text-blue-700'}>typescript</strong> (v5.1.6) - Superset com tipagem estática</li>
              <li><strong className={darkMode ? 'text-blue-300' : 'text-blue-700'}>vite</strong> (v5.1.0) - Build tool rápido (HMR, ESM)</li>
            </ul>
          </div>
          
          <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'} p-4 rounded`}>
            <h4 className={`font-semibold ${darkMode ? 'text-green-400' : 'text-green-700'} mb-3`} style={{ fontSize: fontSize }}>UI e Estilização</h4>
            <ul className="text-sm space-y-2" style={{ fontSize: fontSize - 2 }}>
              <li><strong className={darkMode ? 'text-blue-300' : 'text-blue-700'}>tailwindcss</strong> (v3.4.4) - Framework CSS utility-first</li>
              <li><strong className={darkMode ? 'text-blue-300' : 'text-blue-700'}>framer-motion</strong> (v11.18.0) - Animações declarativas</li>
              <li><strong className={darkMode ? 'text-blue-300' : 'text-blue-700'}>styled-components</strong> (v6.1.14) - CSS-in-JS</li>
              <li><strong className={darkMode ? 'text-blue-300' : 'text-blue-700'}>lucide-react</strong> (v0.545.0) - Ícones SVG</li>
            </ul>
          </div>
          
          <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'} p-4 rounded`}>
            <h4 className={`font-semibold ${darkMode ? 'text-green-400' : 'text-green-700'} mb-3`} style={{ fontSize: fontSize }}>Visualização de Dados</h4>
            <ul className="text-sm space-y-2" style={{ fontSize: fontSize - 2 }}>
              <li><strong className={darkMode ? 'text-blue-300' : 'text-blue-700'}>highcharts</strong> (v12.2.0) + <strong>highcharts-react-official</strong> - Gráficos interativos</li>
              <li><strong className={darkMode ? 'text-blue-300' : 'text-blue-700'}>react-map-gl</strong> (v6.1.21) + <strong>mapbox-gl</strong> (v1.13.0) - Mapas interativos</li>
              <li><strong className={darkMode ? 'text-blue-300' : 'text-blue-700'}>react-google-charts</strong> (v5.2.1) - Gráficos Google Charts</li>
              <li><strong className={darkMode ? 'text-blue-300' : 'text-blue-700'}>@turf/*</strong> - Manipulação de dados geoespaciais</li>
            </ul>
          </div>
          
          <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'} p-4 rounded`}>
            <h4 className={`font-semibold ${darkMode ? 'text-green-400' : 'text-green-700'} mb-3`} style={{ fontSize: fontSize }}>Funcionalidades Específicas</h4>
            <ul className="text-sm space-y-2" style={{ fontSize: fontSize - 2 }}>
              <li><strong className={darkMode ? 'text-blue-300' : 'text-blue-700'}>@fullcalendar/*</strong> (v6.1.x) - Calendário com Google Calendar</li>
              <li><strong className={darkMode ? 'text-blue-300' : 'text-blue-700'}>@tanstack/react-query</strong> (v5.90.7) - Cache e sincronização de dados</li>
              <li><strong className={darkMode ? 'text-blue-300' : 'text-blue-700'}>keen-slider</strong> (v6.3.3) - Carrossel/slider</li>
              <li><strong className={darkMode ? 'text-blue-300' : 'text-blue-700'}>swiper</strong> (v12.0.3) - Slider touch</li>
              <li><strong className={darkMode ? 'text-blue-300' : 'text-blue-700'}>react-markdown</strong> (v10.1.0) - Renderização Markdown</li>
              <li><strong className={darkMode ? 'text-blue-300' : 'text-blue-700'}>fuse.js</strong> (v7.1.0) - Busca fuzzy</li>
              <li><strong className={darkMode ? 'text-blue-300' : 'text-blue-700'}>match-sorter</strong> (v8.0.0) - Ordenação inteligente</li>
            </ul>
          </div>
          
          <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'} p-4 rounded`}>
            <h4 className={`font-semibold ${darkMode ? 'text-green-400' : 'text-green-700'} mb-3`} style={{ fontSize: fontSize }}>Utilitários</h4>
            <ul className="text-sm space-y-2" style={{ fontSize: fontSize - 2 }}>
              <li><strong className={darkMode ? 'text-blue-300' : 'text-blue-700'}>react-spinners</strong> (v0.17.0) - Loading indicators</li>
              <li><strong className={darkMode ? 'text-blue-300' : 'text-blue-700'}>react-lazyload</strong> (v3.2.1) - Lazy loading</li>
              <li><strong className={darkMode ? 'text-blue-300' : 'text-blue-700'}>react-table</strong> (v7.8.0) - Tabelas avançadas</li>
              <li><strong className={darkMode ? 'text-blue-300' : 'text-blue-700'}>isbot</strong> (v4.1.0) - Detecção de bots</li>
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
        
        <div className={`mt-6 p-4 ${darkMode ? 'bg-blue-900/30 border-blue-500/30' : 'bg-blue-50 border-blue-200'} border rounded`}>
          <p className={`${darkMode ? 'text-blue-200' : 'text-blue-800'}`} style={{ fontSize: fontSize - 2 }}>
            <strong>Deploy:</strong> O projeto está configurado para deploy automático na Vercel via GitHub.
            Build otimizado com code splitting (Highcharts, Mapbox, Calendar em chunks separados).
          </p>
        </div>
      </div>
    </section>
  );
}