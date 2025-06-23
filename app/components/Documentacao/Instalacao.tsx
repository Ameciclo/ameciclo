import { InstallIcon } from "~/components/Commom/Icones/DocumentationIcons";

export default function Instalacao() {
  return (
    <section id="instalacao" className="mb-12">
      <h2 className="text-2xl lg:text-3xl font-bold text-green-400 mb-4 lg:mb-6 flex items-center gap-3">
        <InstallIcon className="w-6 h-6 lg:w-8 lg:h-8" />
        Instalação
      </h2>
      <div className="bg-gray-800 rounded-lg p-4 lg:p-6 border border-gray-700">
        <h3 className="text-xl font-semibold mb-4">Pré-requisitos</h3>
        <ul className="list-disc list-inside mb-6 space-y-2">
          <li>Node.js &ge; 20.0.0</li>
          <li>npm ou yarn</li>
          <li>Git</li>
        </ul>
        
        <h3 className="text-xl font-semibold mb-4">Passos para instalação</h3>
        <div className="space-y-4">
          <div>
            <p className="mb-2">1. Clone o repositório:</p>
            <div className="bg-gray-900 p-3 rounded border border-gray-600">
              <code className="text-green-300">git clone https://github.com/Ameciclo/ameciclo.git</code>
            </div>
          </div>
          
          <div>
            <p className="mb-2">2. Instale as dependências:</p>
            <div className="bg-gray-900 p-3 rounded border border-gray-600">
              <code className="text-green-300">npm install</code>
            </div>
          </div>
          
          <div>
            <p className="mb-2">3. Inicie o servidor de desenvolvimento:</p>
            <div className="bg-gray-900 p-3 rounded border border-gray-600">
              <code className="text-green-300">npm run dev</code>
            </div>
          </div>
          
          <div>
            <p className="mb-2">4. Acesse a aplicação:</p>
            <div className="bg-gray-900 p-3 rounded border border-gray-600">
              <code className="text-green-300">http://localhost:5173</code>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}