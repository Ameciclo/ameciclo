import { TechIcon, InfoIcon } from "~/components/Commom/Icones/ParticipeIcons";

interface OpenSourceSectionProps {
  darkMode: boolean;
}

export function OpenSourceSection({ darkMode }: OpenSourceSectionProps) {
  return (
    <div className={`border-2 rounded-xl shadow-lg p-8 ${darkMode ? "bg-gradient-to-br from-gray-800 to-gray-700 border-gray-600" : "bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-100"} mt-16`}>
      <div className="flex items-center justify-center gap-4 mb-8">
        <TechIcon className="w-8 h-8 text-purple-600" />
        <h2 className={`text-2xl sm:text-3xl font-bold ${darkMode ? "text-white" : "text-gray-800"}`}>
          Contribua com Nossos Projetos Open Source
        </h2>
      </div>
      <p className={`text-center mb-6 sm:mb-8 px-4 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
        Nossos projetos são desenvolvidos de forma aberta e colaborativa. Você pode contribuir com código, documentação, testes ou ideias!
      </p>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/80 backdrop-blur p-6 rounded-lg border border-purple-100">
          <div className="flex items-center gap-2 mb-3">
            <TechIcon className="w-5 h-5 text-purple-600" />
            <h4 className="font-semibold text-purple-600">Como Contribuir</h4>
          </div>
          <ul className={`space-y-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
            <li>
              • Acesse nosso <a href="https://github.com/Ameciclo" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline font-semibold">GitHub</a>
            </li>
            <li>• Escolha um projeto que te interesse</li>
            <li>• Leia a documentação e issues abertas</li>
            <li>• Faça fork, implemente e envie pull request</li>
          </ul>
        </div>
        <div className="bg-white/80 backdrop-blur p-6 rounded-lg border border-purple-100">
          <div className="flex items-center gap-2 mb-3">
            <InfoIcon className="w-5 h-5 text-purple-600" />
            <h4 className="font-semibold text-purple-600">Áreas de Contribuição</h4>
          </div>
          <ul className={`space-y-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
            <li>• Desenvolvimento web (React, TypeScript)</li>
            <li>• Análise de dados e visualizações</li>
            <li>• Design e UX/UI</li>
            <li>• Documentação e testes</li>
          </ul>
        </div>
      </div>
      <div className="text-center mt-6">
        <a
          href="https://github.com/Ameciclo"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-8 py-4 rounded-lg hover:from-purple-600 hover:to-indigo-700 transition-all duration-300 inline-block font-semibold shadow-lg"
        >
          🚀 Ver Projetos no GitHub
        </a>
      </div>
    </div>
  );
}
