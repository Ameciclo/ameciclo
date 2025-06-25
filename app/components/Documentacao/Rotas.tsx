import { RouteIcon } from "~/components/Commom/Icones/DocumentationIcons";
import { DocumentationComponentProps } from "./types";

export default function Rotas({ darkMode = true, fontSize = 16 }: DocumentationComponentProps) {
  return (
    <section id="rotas" className="mb-12">
      <h2 className={`text-2xl lg:text-3xl font-bold ${darkMode ? 'text-green-400' : 'text-green-700'} mb-4 lg:mb-6 flex items-center gap-3`} style={{ fontSize: fontSize + 8 }}>
        <RouteIcon className="w-6 h-6 lg:w-8 lg:h-8" />
        Rotas
      </h2>
      <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg p-4 lg:p-6 border`}>
        <p className="mb-6" style={{ fontSize: fontSize }}>O Remix utiliza roteamento baseado em arquivos. Cada arquivo em <code className={`${darkMode ? 'bg-gray-700' : 'bg-gray-200'} px-2 py-1 rounded`}>app/routes/</code> representa uma rota:</p>
        
        <div className="space-y-4">
          <div className={`${darkMode ? 'bg-gray-900 border-gray-600' : 'bg-gray-100 border-gray-300'} p-4 rounded border`}>
            <h4 className={`font-semibold ${darkMode ? 'text-green-400' : 'text-green-700'} mb-2`} style={{ fontSize: fontSize }}>Rotas principais:</h4>
            <code className={`${darkMode ? 'text-green-300' : 'text-green-700'} text-sm`} style={{ fontSize: fontSize - 2 }}>
              /_index.tsx                 → /
              <br />agenda.tsx                   → /agenda
              <br />dados._index.tsx             → /dados
              <br />dados.contagens.tsx          → /dados/contagens
              <br />contagens.$slug.tsx          → /contagens/:slug
              <br />projetos.$projeto.tsx        → /projetos/:projeto
            </code>
          </div>
          
          <div>
            <h4 className={`font-semibold ${darkMode ? 'text-green-400' : 'text-green-700'} mb-2`} style={{ fontSize: fontSize }}>Exemplo de rota com loader:</h4>
            <div className={`${darkMode ? 'bg-gray-900 border-gray-600' : 'bg-gray-100 border-gray-300'} p-4 rounded border`}>
              <code className={`${darkMode ? 'text-green-300' : 'text-green-700'} text-sm`} style={{ fontSize: fontSize - 2 }}>
{`// app/routes/contagens.$slug.tsx
import { LoaderFunctionArgs } from "@remix-run/node";
import { fetchWithTimeout } from "~/services/fetchWithTimeout";

export async function loader({ params }: LoaderFunctionArgs) {
  const { slug } = params;
  // Usando fetchWithTimeout para evitar timeouts
  const data = await fetchWithTimeout(
    "http://api.garfo.ameciclo.org/cyclist-counts",
    { cache: "no-cache" },
    5000,
    { counts: [] }
  );
  
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