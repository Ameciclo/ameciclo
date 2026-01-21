import { UsersIcon, TargetIcon } from "~/components/Commom/Icones/ParticipeIcons";

interface WorkGroupsSectionProps {
  darkMode: boolean;
}

export function WorkGroupsSection({ darkMode }: WorkGroupsSectionProps) {
  return (
    <div className={`border rounded-xl shadow-lg p-8 ${darkMode ? "bg-gradient-to-br from-gray-800 to-gray-700 border-gray-600" : "bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200"}`}>
      <div className="flex items-center justify-center gap-4 mb-8">
        <UsersIcon className="w-8 h-8 text-ameciclo" />
        <h2 className={`text-2xl sm:text-3xl font-bold ${darkMode ? "text-white" : "text-gray-800"}`}>
          Grupos de Trabalho
        </h2>
      </div>
      <div className={`text-center mb-6 sm:mb-8 px-4 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
        <p className="mb-2">Chamamos pessoas associadas para participar dos grupos de trabalho!</p>
        <p className="mb-2">Estes grupos são fundamentais para o desenvolvimento dos nossos projetos e ações.</p>
        <p>
          Acesse <a href="https://t.me/addlist/Fd6XMYf6tJs1Mjgx" target="_blank" rel="noopener noreferrer" className="text-ameciclo font-semibold hover:underline">gts.ameciclo.org</a> para ver todos os grupos.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={`backdrop-blur p-6 rounded-lg border ${darkMode ? "bg-gray-700/80 border-gray-600" : "bg-white/80 border-emerald-100"}`}>
          <div className="flex items-center gap-2 mb-3">
            <UsersIcon className="w-5 h-5 text-ameciclo" />
            <h4 className="font-semibold text-ameciclo">Como Participar</h4>
          </div>
          <ul className={`space-y-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
            <li>• Seja uma pessoa associada</li>
            <li>• Participe das reuniões ordinárias</li>
            <li>• Manifeste interesse em grupos específicos</li>
            <li>• Contribua com suas habilidades</li>
          </ul>
        </div>
        <div className="bg-white/80 backdrop-blur p-6 rounded-lg border border-emerald-100">
          <div className="flex items-center gap-2 mb-3">
            <TargetIcon className="w-5 h-5 text-ameciclo" />
            <h4 className="font-semibold text-ameciclo">Áreas de Atuação</h4>
          </div>
          <ul className="space-y-2 text-gray-700">
            <li>• Mobilidade e infraestrutura</li>
            <li>• Comunicação e educação</li>
            <li>• Eventos e ações</li>
            <li>• Pesquisa e dados</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
