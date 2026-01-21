import { TestIcon } from "~/components/Commom/Icones/DocumentationIcons";

import { DocumentationComponentProps } from "./types";

export default function Testes({ darkMode = true, fontSize = 16 }: DocumentationComponentProps) {
  return (
    <section id="testes" className="mb-12">
      <h2 className={`text-2xl lg:text-3xl font-bold ${darkMode ? "text-green-400" : "text-green-700"} mb-4 lg:mb-6 flex items-center gap-3`} style={{ fontSize: fontSize + 8 }}>
        <TestIcon className="w-6 h-6 lg:w-8 lg:h-8" />
        Testes
      </h2>
      <div className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} rounded-lg p-4 lg:p-6 border`}>
        <p className="mb-6" style={{ fontSize: fontSize }}>O projeto utiliza ferramentas de qualidade de código para garantir a confiabilidade:</p>
        
        <div className="space-y-6">
          <div>
            <h3 className={`text-xl font-semibold ${darkMode ? 'text-green-400' : 'text-green-700'} mb-3`} style={{ fontSize: fontSize + 4 }}>Linting e Type Checking</h3>
            <div className="space-y-3">
              <div>
                <p className="mb-2" style={{ fontSize: fontSize - 2 }}>Verificar qualidade do código:</p>
                <div className={`${darkMode ? "bg-gray-900 border-gray-600" : "bg-gray-100 border-gray-300"} p-3 rounded border`}>
                  <code className={`${darkMode ? "text-green-300" : "text-green-700"}`} style={{ fontSize: fontSize - 2 }}>npm run lint</code>
                </div>
              </div>
              
              <div>
                <p className="mb-2" style={{ fontSize: fontSize - 2 }}>Verificar tipos TypeScript:</p>
                <div className={`${darkMode ? "bg-gray-900 border-gray-600" : "bg-gray-100 border-gray-300"} p-3 rounded border`}>
                  <code className={`${darkMode ? "text-green-300" : "text-green-700"}`} style={{ fontSize: fontSize - 2 }}>npm run typecheck</code>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className={`text-xl font-semibold ${darkMode ? 'text-green-400' : 'text-green-700'} mb-3`} style={{ fontSize: fontSize + 4 }}>Configuração do ESLint</h3>
            <div className={`${darkMode ? 'bg-gray-900 border-gray-600' : 'bg-gray-100 border-gray-300'} p-4 rounded border`}>
              <code className={`${darkMode ? 'text-green-300' : 'text-green-700'} text-sm`} style={{ fontSize: fontSize - 2 }}>
{`// .eslintrc.cjs
module.exports = {
  extends: [
    "@remix-run/eslint-config",
    "@remix-run/eslint-config/node"
  ],
  rules: {
    // Regras personalizadas do projeto
  }
};`}
              </code>
            </div>
          </div>
        </div>
        
        <div className={`mt-6 p-4 ${darkMode ? 'bg-blue-900 border-blue-600' : 'bg-blue-50 border-blue-200'} border rounded`}>
          <p className="text-blue-200" style={{ fontSize: fontSize - 2 }}>
            <strong>Dica:</strong> Execute os testes antes de fazer commit para garantir a qualidade do código.
          </p>
        </div>
      </div>
    </section>
  );
}