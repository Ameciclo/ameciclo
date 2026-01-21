import { RobotIcon, AlertIcon, ToolIcon, InfoIcon } from "~/components/Commom/Icones/ParticipeIcons";

interface BicibotSectionProps {
  darkMode: boolean;
  fontSize: number;
}

export function BicibotSection({ darkMode, fontSize }: BicibotSectionProps) {
  return (
    <div className={`border-2 rounded-xl shadow-lg p-8 ${darkMode ? "bg-gradient-to-br from-gray-800 to-gray-700 border-gray-600" : "bg-gradient-to-br from-red-50 to-orange-50 border-red-100"}`}>
      <div className="flex items-center justify-center gap-4 mb-8">
        <RobotIcon className="w-8 h-8 text-gray-800" />
        <h2 className={`text-2xl sm:text-3xl font-bold text-center sm:text-left ${darkMode ? "text-white" : "text-gray-800"}`}>
          Bicibot (BETA) - Denuncie Infrações
        </h2>
      </div>
      <div className="max-w-4xl mx-auto">
        <p className={`text-center mb-6 px-4 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
          Denuncie motoristas infratores ou lugares que demandam manutenções na infraestrutura cicloviária.
        </p>

        <div className="bg-white/80 backdrop-blur p-6 rounded-lg mb-6 border border-red-100">
          <div className="flex items-center gap-2 mb-3">
            <AlertIcon className="w-5 h-5 text-purple-800" />
            <h4 className="font-semibold text-purple-800">O que é a Bicibot?</h4>
          </div>
          <p className={`mb-4 ${darkMode ? "text-black" : "text-gray-700"}`}>
            Uma assistente criada para ajudar ciclistas a denunciarem situações de risco no trânsito.
            Nasceu da parceria entre a Ameciclo (Recife) e a Ciclocidade (São Paulo).
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className={`p-4 rounded-lg ${darkMode ? "bg-grey" : "bg-red-50"}`}>
              <div className="flex items-center gap-2 mb-2">
                <ToolIcon className="w-4 h-4 text-red-700" />
                <h5 className={`font-medium ${darkMode ? "text-red-900" : "text-red-700"}`}>Como Funciona:</h5>
              </div>
              <ul className="space-y-1 text-gray-700 text-sm">
                <li style={{ fontSize: `${fontSize}px` }}>• Chatbot no ChatGPT</li>
                <li style={{ fontSize: `${fontSize}px` }}>• Acesse: bicibot.ameciclo.org</li>
                <li style={{ fontSize: `${fontSize}px` }}>• Coleta dados organizados</li>
                <li style={{ fontSize: `${fontSize}px` }}>• Base de dados pública</li>
              </ul>
            </div>
            <div className={`p-4 rounded-lg ${darkMode ? "bg-grey" : "bg-orange-50"}`}>
              <div className="flex items-center gap-2 mb-2">
                <InfoIcon className="w-4 h-4 text-orange-700" />
                <h5 className={`font-medium ${darkMode ? "text-orange-900" : "text-orange-700"}`}>Informações Coletadas:</h5>
              </div>
              <ul className="space-y-1 text-gray-700 text-sm">
                <li>• Placa ou identificação do veículo</li>
                <li>• Endereço do ocorrido</li>
                <li>• Data e horário</li>
                <li>• Relato da situação</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="text-center">
          <a
            href="https://bicibot.ameciclo.org"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gradient-to-r from-purple-500 to-purple-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg hover:from-purple-600 hover:to-purple-800 transition-all duration-300 inline-block mb-4 sm:mb-0 sm:mr-4 font-semibold shadow-lg text-center w-full sm:w-auto"
          >
            🚨 Acessar Bicibot
          </a>
          <p className={`text-sm mt-4 p-3 rounded-lg ${darkMode ? "text-gray-300 bg-gray-800/50" : "text-gray-600 bg-white/50"}`}>
            <strong>Funciona no Brasil todo!</strong> Registre situações e ajude a mostrar onde o bicho pega para quem pedala.
          </p>
        </div>
      </div>
    </div>
  );
}
