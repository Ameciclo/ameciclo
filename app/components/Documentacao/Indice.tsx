export default function Indice() {
  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-4">Índice</h1>
      <ul className="list-decimal pl-6 space-y-4">
        <li>
          <a href="#estrutura-do-projeto" className="text-blue-600 hover:text-blue-800">
            Estrutura do Projeto
          </a>
          <ul className="list-[disc] pl-6">
            <li><a href="#arvore-de-pastas" className="text-blue-600 hover:text-blue-800">Árvore de Pastas</a></li>
            <li><a href="#descricao-das-pastas" className="text-blue-600 hover:text-blue-800">Descrição das Pastas</a></li>
            <li><a href="#arquivos-de-configuracao" className="text-blue-600 hover:text-blue-800">Arquivos de Configuração</a></li>
            <li><a href="#componente-root" className="text-blue-600 hover:text-blue-800">Componente root.tsx</a></li>
            <li><a href="#arquivo-package-json" className="text-blue-600 hover:text-blue-800">Arquivo package.json</a></li>
          </ul>
        </li>
        <li>
          <a href="#conclusao" className="text-blue-600 hover:text-blue-800">
            Conclusão
          </a>
        </li>
      </ul>
    </div>
  );
};
