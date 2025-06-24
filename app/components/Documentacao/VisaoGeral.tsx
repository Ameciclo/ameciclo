import { OverviewIcon, StatusIcon } from "~/components/Commom/Icones/DocumentationIcons";

export default function VisaoGeral() {
  return (
    <section id="visao-geral" className="mb-12">
      <h2 className="text-2xl lg:text-3xl font-bold text-green-400 mb-4 lg:mb-6 flex items-center gap-3">
        <OverviewIcon className="w-8 h-8" />
        Visão Geral
      </h2>
      <div className="bg-gray-800 rounded-lg p-4 lg:p-6 border border-gray-700">
        <p className="text-lg mb-4">
          O projeto <strong className="text-green-400">Ameciclo</strong> é uma plataforma web desenvolvida com <strong>Remix</strong> e <strong>TypeScript</strong>
          que tem como objetivo fornecer dados sobre mobilidade ativa na região metropolitana do Recife.
        </p>
        <p className="mb-4">
          A plataforma oferece visualização de dados de contagens de ciclistas, documentos relacionados à mobilidade urbana,
          observatórios especializados em diferentes aspectos da mobilidade ativa, e ferramentas de monitoramento para
          garantir a disponibilidade e performance de todos os serviços.
        </p>
        <div className="bg-blue-900/30 border border-blue-500/30 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="font-semibold text-blue-400">Monitoramento em Tempo Real</h4>
          </div>
          <p className="text-sm mb-3">
            A plataforma conta com uma página dedicada ao monitoramento do status de todos os serviços e páginas em tempo real.
          </p>
          <a
            href="/status"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
          >
            <StatusIcon className="w-4 h-4" />
            Ver Status dos Serviços
          </a>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mt-6">
          <div className="bg-gray-700 p-4 rounded">
            <h4 className="font-semibold text-green-400 mb-2">Objetivo</h4>
            <p className="text-sm">Promover a mobilidade ativa através de dados e informações acessíveis</p>
          </div>
          <div className="bg-gray-700 p-4 rounded">
            <h4 className="font-semibold text-green-400 mb-2">Tecnologias</h4>
            <p className="text-sm">Remix, TypeScript, React, Tailwind CSS</p>
          </div>
        </div>
      </div>
    </section>
  );
}