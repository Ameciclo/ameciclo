import { InstallIcon } from "~/components/Commom/Icones/DocumentationIcons";
import { DocumentationComponentProps } from "./types";

interface InstalacaoProps extends DocumentationComponentProps {}

export default function Instalacao({ darkMode = true, fontSize = 16 }: InstalacaoProps) {
  return (
    <section id="instalacao" className="mb-12">
      <h2 className={`text-2xl lg:text-3xl font-bold ${darkMode ? 'text-green-400' : 'text-green-700'} mb-4 lg:mb-6 flex items-center gap-3`} style={{ fontSize: fontSize + 8 }}>
        <InstallIcon className="w-6 h-6 lg:w-8 lg:h-8" />
        Instalação
      </h2>
      <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg p-4 lg:p-6 border`}>
        <h3 className={`text-xl font-semibold mb-4`} style={{ fontSize: fontSize + 4 }}>Pré-requisitos</h3>
        <ul className="list-disc list-inside mb-6 space-y-2" style={{ fontSize: fontSize - 2 }}>
          <li>Node.js &ge; 20.0.0</li>
          <li>npm ou yarn</li>
          <li>Git</li>
        </ul>
        
        <h3 className={`text-xl font-semibold mb-4`} style={{ fontSize: fontSize + 4 }}>Passos para instalação</h3>
        <div className="space-y-4">
          <div>
            <p className="mb-2" style={{ fontSize: fontSize - 2 }}>1. Clone o repositório:</p>
            <div className={`${darkMode ? 'bg-gray-900 border-gray-600' : 'bg-gray-100 border-gray-300'} p-3 rounded border`}>
              <code className={`${darkMode ? 'text-green-300' : 'text-green-700'}`} style={{ fontSize: fontSize - 2 }}>git clone https://github.com/Ameciclo/ameciclo.git</code>
            </div>
          </div>
          
          <div>
            <p className="mb-2" style={{ fontSize: fontSize - 2 }}>2. Instale as dependências:</p>
            <div className={`${darkMode ? 'bg-gray-900 border-gray-600' : 'bg-gray-100 border-gray-300'} p-3 rounded border`}>
              <code className={`${darkMode ? 'text-green-300' : 'text-green-700'}`} style={{ fontSize: fontSize - 2 }}>npm install</code>
            </div>
          </div>
          
          <div>
            <p className="mb-2" style={{ fontSize: fontSize - 2 }}>3. Inicie o servidor de desenvolvimento:</p>
            <div className={`${darkMode ? 'bg-gray-900 border-gray-600' : 'bg-gray-100 border-gray-300'} p-3 rounded border`}>
              <code className={`${darkMode ? 'text-green-300' : 'text-green-700'}`} style={{ fontSize: fontSize - 2 }}>npm run dev</code>
            </div>
          </div>
          
          <div>
            <p className="mb-2" style={{ fontSize: fontSize - 2 }}>4. Acesse a aplicação:</p>
            <div className={`${darkMode ? 'bg-gray-900 border-gray-600' : 'bg-gray-100 border-gray-300'} p-3 rounded border`}>
              <code className={`${darkMode ? 'text-green-300' : 'text-green-700'}`} style={{ fontSize: fontSize - 2 }}>http://localhost:5173</code>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}