import { ContributeIcon } from "~/components/Commom/Icones/DocumentationIcons";

export default function Contribuicao() {
  return (
    <section id="contribuicao" className="mb-12">
      <h2 className="text-2xl lg:text-3xl font-bold text-green-400 mb-4 lg:mb-6 flex items-center gap-3">
        <ContributeIcon className="w-6 h-6 lg:w-8 lg:h-8" />
        Contribuição
      </h2>
      <div className="bg-gray-800 rounded-lg p-4 lg:p-6 border border-gray-700">
        <p className="mb-6">Contribuições são sempre bem-vindas! Siga este guia para contribuir com o projeto:</p>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold text-green-400 mb-4">Processo de Contribuição</h3>
            <div className="space-y-4">
              <div className="bg-gray-700 p-4 rounded">
                <h4 className="font-semibold text-green-400 mb-2">1. Fork e Clone</h4>
                <div className="bg-gray-900 p-2 rounded mt-2">
                  <code className="text-green-300 text-sm">
                    git clone https://github.com/SEU-USUARIO/ameciclo.git<br />
                    cd ameciclo
                  </code>
                </div>
              </div>
              
              <div className="bg-gray-700 p-4 rounded">
                <h4 className="font-semibold text-green-400 mb-2">2. Crie uma branch</h4>
                <div className="bg-gray-900 p-2 rounded mt-2">
                  <code className="text-green-300 text-sm">git checkout -b feature/nova-funcionalidade</code>
                </div>
                <p className="text-sm mt-2">Use nomes descritivos: <code className="bg-gray-600 px-1 rounded">feature/</code>, <code className="bg-gray-600 px-1 rounded">fix/</code>, <code className="bg-gray-600 px-1 rounded">docs/</code></p>
              </div>
              
              <div className="bg-gray-700 p-4 rounded">
                <h4 className="font-semibold text-green-400 mb-2">3. Desenvolva e Teste</h4>
                <div className="bg-gray-900 p-2 rounded mt-2">
                  <code className="text-green-300 text-sm">
                    npm install<br />
                    npm run dev<br />
                    npm run lint<br />
                    npm run typecheck
                  </code>
                </div>
              </div>
              
              <div className="bg-gray-700 p-4 rounded">
                <h4 className="font-semibold text-green-400 mb-2">4. Commit e Push</h4>
                <div className="bg-gray-900 p-2 rounded mt-2">
                  <code className="text-green-300 text-sm">
                    git add .<br />
                    git commit -m "feat: adiciona nova funcionalidade"<br />
                    git push origin feature/nova-funcionalidade
                  </code>
                </div>
              </div>
              
              <div className="bg-gray-700 p-4 rounded">
                <h4 className="font-semibold text-green-400 mb-2">5. Abra um Pull Request</h4>
                <p className="text-sm">Descreva claramente as alterações e inclua screenshots se necessário</p>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold text-green-400 mb-4">Padrões de Código</h3>
            <div className="space-y-3">
              <div className="bg-gray-700 p-3 rounded">
                <div className="font-semibold text-yellow-400 mb-1">Commits</div>
                <p className="text-sm">Use conventional commits: <code className="bg-gray-600 px-1 rounded">feat:</code>, <code className="bg-gray-600 px-1 rounded">fix:</code>, <code className="bg-gray-600 px-1 rounded">docs:</code></p>
              </div>
              <div className="bg-gray-700 p-3 rounded">
                <div className="font-semibold text-yellow-400 mb-1">TypeScript</div>
                <p className="text-sm">Sempre tipifique variáveis e funções</p>
              </div>
              <div className="bg-gray-700 p-3 rounded">
                <div className="font-semibold text-yellow-400 mb-1">Componentes</div>
                <p className="text-sm">Use nomes descritivos e organize por funcionalidade</p>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold text-green-400 mb-4">Tipos de Contribuição</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-gray-700 p-3 rounded">
                <div className="font-semibold text-blue-400 mb-1">Correção de Bugs</div>
                <p className="text-sm">Identifique e corrija problemas existentes</p>
              </div>
              <div className="bg-gray-700 p-3 rounded">
                <div className="font-semibold text-purple-400 mb-1">Novas Funcionalidades</div>
                <p className="text-sm">Adicione recursos que melhorem a plataforma</p>
              </div>
              <div className="bg-gray-700 p-3 rounded">
                <div className="font-semibold text-green-400 mb-1">Documentação</div>
                <p className="text-sm">Melhore ou adicione documentação</p>
              </div>
              <div className="bg-gray-700 p-3 rounded">
                <div className="font-semibold text-orange-400 mb-1">Design/UX</div>
                <p className="text-sm">Melhore a interface e experiência do usuário</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-blue-900 border border-blue-600 rounded">
          <p className="text-blue-200">
            <strong>Dica:</strong> Consulte os <a href="https://github.com/Ameciclo/ameciclo/issues" className="text-blue-300 underline" target="_blank" rel="noopener noreferrer">issues abertos</a> no GitHub para encontrar tarefas que precisam de ajuda.
          </p>
        </div>
      </div>
    </section>
  );
}