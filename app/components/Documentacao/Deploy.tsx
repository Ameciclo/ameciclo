import { DeployIcon } from "~/components/Commom/Icones/DocumentationIcons";

export default function Deploy() {
  return (
    <section id="deploy" className="mb-12">
      <h2 className="text-2xl lg:text-3xl font-bold text-green-400 mb-4 lg:mb-6 flex items-center gap-3">
        <DeployIcon className="w-6 h-6 lg:w-8 lg:h-8" />
        Deploy
      </h2>
      <div className="bg-gray-800 rounded-lg p-4 lg:p-6 border border-gray-700">
        <h3 className="text-xl font-semibold mb-4">Dependências Principais</h3>
        <div className="space-y-4 mb-8">
          <div className="bg-gray-700 p-4 rounded">
            <h4 className="font-semibold text-green-400 mb-3">Framework e Core</h4>
            <ul className="text-sm space-y-2">
              <li><strong className="text-blue-300">@remix-run/*</strong> - Framework full-stack React com SSR</li>
              <li><strong className="text-blue-300">react</strong> - Biblioteca para interfaces de usuário</li>
              <li><strong className="text-blue-300">typescript</strong> - Superset do JavaScript com tipagem</li>
              <li><strong className="text-blue-300">vite</strong> - Build tool rápido e moderno</li>
            </ul>
          </div>
          
          <div className="bg-gray-700 p-4 rounded">
            <h4 className="font-semibold text-green-400 mb-3">UI e Estilização</h4>
            <ul className="text-sm space-y-2">
              <li><strong className="text-blue-300">tailwindcss</strong> - Framework CSS utilitário</li>
              <li><strong className="text-blue-300">framer-motion</strong> - Animações e transições</li>
              <li><strong className="text-blue-300">styled-components</strong> - CSS-in-JS</li>
            </ul>
          </div>
          
          <div className="bg-gray-700 p-4 rounded">
            <h4 className="font-semibold text-green-400 mb-3">Funcionalidades Específicas</h4>
            <ul className="text-sm space-y-2">
              <li><strong className="text-blue-300">@fullcalendar/*</strong> - Calendário interativo para agenda</li>
              <li><strong className="text-blue-300">highcharts</strong> - Gráficos e visualizações</li>
              <li><strong className="text-blue-300">react-map-gl</strong> - Mapas interativos</li>
              <li><strong className="text-blue-300">keen-slider</strong> - Carrossel/slider responsivo</li>
              <li><strong className="text-blue-300">react-markdown</strong> - Renderização de Markdown</li>
            </ul>
          </div>
          
          <div className="bg-gray-700 p-4 rounded">
            <h4 className="font-semibold text-green-400 mb-3">Utilitários</h4>
            <ul className="text-sm space-y-2">
              <li><strong className="text-blue-300">match-sorter</strong> - Busca e ordenação inteligente</li>
              <li><strong className="text-blue-300">react-spinners</strong> - Indicadores de carregamento</li>
              <li><strong className="text-blue-300">react-lazyload</strong> - Carregamento lazy de componentes</li>
            </ul>
          </div>
        </div>
        
        <h3 className="text-xl font-semibold mb-4">Build para produção</h3>
        <div className="space-y-4">
          <div>
            <p className="mb-2">1. Gerar build otimizado:</p>
            <div className="bg-gray-900 p-3 rounded border border-gray-600">
              <code className="text-green-300">npm run build</code>
            </div>
          </div>
          
          <div>
            <p className="mb-2">2. Iniciar servidor de produção:</p>
            <div className="bg-gray-900 p-3 rounded border border-gray-600">
              <code className="text-green-300">npm start</code>
            </div>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-yellow-900 border border-yellow-600 rounded">
          <p className="text-yellow-200">
            <strong>Nota:</strong> O pipeline de deploy ainda está em desenvolvimento. 
            Consulte o README.md para atualizações sobre o processo de deploy.
          </p>
        </div>
      </div>
    </section>
  );
}