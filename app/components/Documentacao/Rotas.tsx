import { RouteIcon } from "~/components/Commom/Icones/DocumentationIcons";

export default function Rotas() {
  return (
    <section id="rotas" className="mb-12">
      <h2 className="text-2xl lg:text-3xl font-bold text-green-400 mb-4 lg:mb-6 flex items-center gap-3">
        <RouteIcon className="w-6 h-6 lg:w-8 lg:h-8" />
        Rotas
      </h2>
      <div className="bg-gray-800 rounded-lg p-4 lg:p-6 border border-gray-700">
        <p className="mb-6">O Remix utiliza roteamento baseado em arquivos. Cada arquivo em <code className="bg-gray-700 px-2 py-1 rounded">app/routes/</code> representa uma rota:</p>
        
        <div className="space-y-4">
          <div className="bg-gray-900 p-4 rounded border border-gray-600">
            <h4 className="font-semibold text-green-400 mb-2">Rotas principais:</h4>
            <code className="text-green-300 text-sm">
              /_index.tsx                 → /
              <br />agenda.tsx                   → /agenda
              <br />dados._index.tsx             → /dados
              <br />dados.contagens.tsx          → /dados/contagens
              <br />contagens.$slug.tsx          → /contagens/:slug
              <br />projetos.$projeto.tsx        → /projetos/:projeto
            </code>
          </div>
          
          <div>
            <h4 className="font-semibold text-green-400 mb-2">Exemplo de rota com loader:</h4>
            <div className="bg-gray-900 p-4 rounded border border-gray-600">
              <code className="text-green-300 text-sm">
{`// app/routes/contagens.$slug.tsx
import { LoaderFunctionArgs } from "@remix-run/node";

export async function loader({ params }: LoaderFunctionArgs) {
  const { slug } = params;
  const response = await fetch(\`http://api.garfo.ameciclo.org/cyclist-counts\`);
  const data = await response.json();
  
  const contagem = data.counts?.find((c: any) => c.slug === slug);
  
  if (!contagem) {
    throw new Response("Contagem não encontrada", { status: 404 });
  }
  
  return { contagem };
}`}
              </code>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}