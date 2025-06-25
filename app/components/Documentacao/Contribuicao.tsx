import { ContributeIcon } from "~/components/Commom/Icones/DocumentationIcons";

import { DocumentationComponentProps } from "./types";

export default function Contribuicao({ darkMode = true, fontSize = 16 }: DocumentationComponentProps) {
  return (
    <section id="contribuicao" className="mb-12">
      <h2 className={`text-2xl lg:text-3xl font-bold ${darkMode ? "text-green-400" : "text-green-700"} mb-4 lg:mb-6 flex items-center gap-3`} style={{ fontSize: fontSize + 8 }}>
        <ContributeIcon className="w-6 h-6 lg:w-8 lg:h-8" />
        Contribuição
      </h2>
      <div className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} rounded-lg p-4 lg:p-6 border`}>
        <p className="mb-6" style={{ fontSize: fontSize }}>Contribuições são sempre bem-vindas! Siga este guia para contribuir com o projeto:</p>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold text-green-400 mb-4">Processo de Contribuição</h3>
            <div className="space-y-4">
              <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'} p-4 rounded`}>
                <h4 className={`font-semibold ${darkMode ? 'text-green-400' : 'text-green-700'} mb-2`} style={{ fontSize: fontSize }}>1. Fork e Clone</h4>
                <div className={`${darkMode ? 'bg-gray-900' : 'bg-gray-200'} p-2 rounded mt-2`}>
                  <code className={`${darkMode ? 'text-green-300' : 'text-green-700'} text-sm`} style={{ fontSize: fontSize - 2 }}>
                    git clone https://github.com/SEU-USUARIO/ameciclo.git<br />
                    cd ameciclo
                  </code>
                </div>
              </div>
              
              <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'} p-4 rounded`}>
                <h4 className={`font-semibold ${darkMode ? 'text-green-400' : 'text-green-700'} mb-2`} style={{ fontSize: fontSize }}>2. Crie uma branch</h4>
                <div className={`${darkMode ? 'bg-gray-900' : 'bg-gray-200'} p-2 rounded mt-2`}>
                  <code className={`${darkMode ? 'text-green-300' : 'text-green-700'} text-sm`} style={{ fontSize: fontSize - 2 }}>git checkout -b feature/nova-funcionalidade</code>
                </div>
                <p className="text-sm mt-2" style={{ fontSize: fontSize - 2 }}>Use nomes descritivos: <code className={`${darkMode ? 'bg-gray-600' : 'bg-gray-300'} px-1 rounded`}>feature/</code>, <code className={`${darkMode ? 'bg-gray-600' : 'bg-gray-300'} px-1 rounded`}>fix/</code>, <code className={`${darkMode ? 'bg-gray-600' : 'bg-gray-300'} px-1 rounded`}>docs/</code></p>
              </div>
              
              <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'} p-4 rounded`}>
                <h4 className={`font-semibold ${darkMode ? 'text-green-400' : 'text-green-700'} mb-2`} style={{ fontSize: fontSize }}>3. Desenvolva e Teste</h4>
                <div className={`${darkMode ? 'bg-gray-900' : 'bg-gray-200'} p-2 rounded mt-2`}>
                  <code className={`${darkMode ? 'text-green-300' : 'text-green-700'} text-sm`} style={{ fontSize: fontSize - 2 }}>
                    npm install<br />
                    npm run dev<br />
                    npm run lint<br />
                    npm run typecheck
                  </code>
                </div>
              </div>
              
              <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'} p-4 rounded`}>
                <h4 className={`font-semibold ${darkMode ? 'text-green-400' : 'text-green-700'} mb-2`} style={{ fontSize: fontSize }}>4. Commit e Push</h4>
                <div className={`${darkMode ? 'bg-gray-900' : 'bg-gray-200'} p-2 rounded mt-2`}>
                  <code className={`${darkMode ? 'text-green-300' : 'text-green-700'} text-sm`} style={{ fontSize: fontSize - 2 }}>
                    git add .<br />
                    git commit -m "feat: adiciona nova funcionalidade"<br />
                    git push origin feature/nova-funcionalidade
                  </code>
                </div>
              </div>
              
              <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'} p-4 rounded`}>
                <h4 className={`font-semibold ${darkMode ? 'text-green-400' : 'text-green-700'} mb-2`} style={{ fontSize: fontSize }}>5. Abra um Pull Request</h4>
                <p className="text-sm" style={{ fontSize: fontSize - 2 }}>Descreva claramente as alterações e inclua screenshots se necessário</p>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold text-green-400 mb-4">Padrões de Código</h3>
            <div className="space-y-3">
              <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'} p-3 rounded`}>
                <div className={`font-semibold ${darkMode ? 'text-yellow-400' : 'text-yellow-700'} mb-1`} style={{ fontSize: fontSize - 2 }}>Commits</div>
                <p className="text-sm" style={{ fontSize: fontSize - 4 }}>Use conventional commits: <code className={`${darkMode ? 'bg-gray-600' : 'bg-gray-300'} px-1 rounded`}>feat:</code>, <code className={`${darkMode ? 'bg-gray-600' : 'bg-gray-300'} px-1 rounded`}>fix:</code>, <code className={`${darkMode ? 'bg-gray-600' : 'bg-gray-300'} px-1 rounded`}>docs:</code></p>
              </div>
              <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'} p-3 rounded`}>
                <div className={`font-semibold ${darkMode ? 'text-yellow-400' : 'text-yellow-700'} mb-1`} style={{ fontSize: fontSize - 2 }}>TypeScript</div>
                <p className="text-sm" style={{ fontSize: fontSize - 4 }}>Sempre tipifique variáveis e funções</p>
              </div>
              <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'} p-3 rounded`}>
                <div className={`font-semibold ${darkMode ? 'text-yellow-400' : 'text-yellow-700'} mb-1`} style={{ fontSize: fontSize - 2 }}>Componentes</div>
                <p className="text-sm" style={{ fontSize: fontSize - 4 }}>Use nomes descritivos e organize por funcionalidade</p>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold text-green-400 mb-4">Tipos de Contribuição</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'} p-3 rounded`}>
                <div className={`font-semibold ${darkMode ? 'text-blue-400' : 'text-blue-700'} mb-1`} style={{ fontSize: fontSize - 2 }}>Correção de Bugs</div>
                <p className="text-sm" style={{ fontSize: fontSize - 4 }}>Identifique e corrija problemas existentes</p>
              </div>
              <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'} p-3 rounded`}>
                <div className={`font-semibold ${darkMode ? 'text-purple-400' : 'text-purple-700'} mb-1`} style={{ fontSize: fontSize - 2 }}>Novas Funcionalidades</div>
                <p className="text-sm" style={{ fontSize: fontSize - 4 }}>Adicione recursos que melhorem a plataforma</p>
              </div>
              <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'} p-3 rounded`}>
                <div className={`font-semibold ${darkMode ? 'text-green-400' : 'text-green-700'} mb-1`} style={{ fontSize: fontSize - 2 }}>Documentação</div>
                <p className="text-sm" style={{ fontSize: fontSize - 4 }}>Melhore ou adicione documentação</p>
              </div>
              <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'} p-3 rounded`}>
                <div className={`font-semibold ${darkMode ? 'text-orange-400' : 'text-orange-700'} mb-1`} style={{ fontSize: fontSize - 2 }}>Design/UX</div>
                <p className="text-sm" style={{ fontSize: fontSize - 4 }}>Melhore a interface e experiência do usuário</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-blue-900 border border-blue-600 rounded">
          <p className="text-blue-200" style={{ fontSize: fontSize - 2 }}>
            <strong>Dica:</strong> Consulte os <a href="https://github.com/Ameciclo/ameciclo/issues" className="text-blue-300 underline" target="_blank" rel="noopener noreferrer">issues abertos</a> no GitHub para encontrar tarefas que precisam de ajuda.
          </p>
        </div>
      </div>
    </section>
  );
}