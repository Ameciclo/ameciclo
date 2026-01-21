import { VolunteerIcon, ResearchIcon, EventIcon, TechIcon } from "~/components/Commom/Icones/ParticipeIcons";

export function VolunteerSection() {
  return (
    <div className="bg-gradient-to-r from-teal-500 to-cyan-600 rounded-xl p-8 text-white">
      <div className="flex items-center justify-center gap-4 mb-8">
        <VolunteerIcon className="w-8 h-8" />
        <h2 className="text-2xl sm:text-3xl font-bold">Voluntariado</h2>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white/10 backdrop-blur rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <ResearchIcon className="w-6 h-6" />
            <h3 className="text-xl font-semibold">Pesquisa e Avaliação</h3>
          </div>
          <ul className="space-y-3">
            <li>• Pesquisas de perfil do ciclista</li>
            <li>• Avaliação cicloviária voluntária</li>
            <li>• Coleta de dados de mobilidade</li>
          </ul>
        </div>

        <div className="bg-white/10 backdrop-blur rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <EventIcon className="w-6 h-6" />
            <h3 className="text-xl font-semibold">Ações e Eventos</h3>
          </div>
          <ul className="space-y-3">
            <li>• Operações de Ghost Bike</li>
            <li>• Organização de eventos</li>
            <li>• Campanhas educativas</li>
          </ul>
        </div>

        <div className="bg-white/10 backdrop-blur rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <TechIcon className="w-6 h-6" />
            <h3 className="text-xl font-semibold">Habilidades Técnicas</h3>
          </div>
          <ul className="space-y-3">
            <li>• Design e comunicação</li>
            <li>• Programação e tecnologia</li>
            <li>• Produção de conteúdo</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
