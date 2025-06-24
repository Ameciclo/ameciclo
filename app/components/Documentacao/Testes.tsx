import { TestIcon } from "~/components/Commom/Icones/DocumentationIcons";

export default function Testes() {
  return (
    <section id="testes" className="mb-12">
      <h2 className="text-2xl lg:text-3xl font-bold text-green-400 mb-4 lg:mb-6 flex items-center gap-3">
        <TestIcon className="w-6 h-6 lg:w-8 lg:h-8" />
        Testes
      </h2>
      <div className="bg-gray-800 rounded-lg p-4 lg:p-6 border border-gray-700">
        <p className="mb-6">O projeto utiliza ferramentas de qualidade de código para garantir a confiabilidade:</p>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold text-green-400 mb-3">Linting e Type Checking</h3>
            <div className="space-y-3">
              <div>
                <p className="mb-2">Verificar qualidade do código:</p>
                <div className="bg-gray-900 p-3 rounded border border-gray-600">
                  <code className="text-green-300">npm run lint</code>
                </div>
              </div>
              
              <div>
                <p className="mb-2">Verificar tipos TypeScript:</p>
                <div className="bg-gray-900 p-3 rounded border border-gray-600">
                  <code className="text-green-300">npm run typecheck</code>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold text-green-400 mb-3">Configuração do ESLint</h3>
            <div className="bg-gray-900 p-4 rounded border border-gray-600">
              <code className="text-green-300 text-sm">
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
        
        <div className="mt-6 p-4 bg-blue-900 border border-blue-600 rounded">
          <p className="text-blue-200">
            <strong>Dica:</strong> Execute os testes antes de fazer commit para garantir a qualidade do código.
          </p>
        </div>
      </div>
    </section>
  );
}