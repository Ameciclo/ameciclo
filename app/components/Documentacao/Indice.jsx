export default function Indice() {
    return (
        <div className="p-6 bg-gray-100 rounded-lg shadow-md">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Índice</h2>
            <ul className="list-none pl-5 space-y-3 text-gray-700 text-xl font-bold">
                <li><span className="mr-2">1. </span><a href="#visao-geral" className="text-blue-600 hover:underline">Visão Geral</a></li>
                <li><span className="mr-2">2. </span><a href="#estrutura-do-projeto" className="text-blue-600 hover:underline">Estrutura do Projeto</a></li>
                <li><span className="mr-2">3. </span><a href="#explicacao-do-componente-root-tsx" className="text-blue-600 hover:underline">Explicação do Componente root.tsx</a></li>
                <li><span className="mr-2">4. </span><a href="#arquivo-package-json" className="text-blue-600 hover:underline">Arquivo package.json</a></li>
                <li><span className="mr-2">5. </span><a href="#recomendacao-de-nao-alteracao-do-package-lock-json" className="text-blue-600 hover:underline">Recomendação de Não Alteração do package-lock.json</a></li>
                <li><span className="mr-2">6. </span><a href="#conclusao" className="text-blue-600 hover:underline">Conclusão</a></li>
            </ul>
        </div>
    );
}