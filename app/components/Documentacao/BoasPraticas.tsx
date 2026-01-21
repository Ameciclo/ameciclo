import { CheckIcon } from "~/components/Commom/Icones/DocumentationIcons";
import { DocumentationComponentProps } from "./types";

export default function BoasPraticas({ darkMode = true, fontSize = 16 }: DocumentationComponentProps) {
  return (
    <section id="boas-praticas" className="mb-12">
      <h2 className={`text-2xl lg:text-3xl font-bold ${darkMode ? 'text-green-400' : 'text-green-700'} mb-4 lg:mb-6 flex items-center gap-3`} style={{ fontSize: fontSize + 8 }}>
        <CheckIcon className="w-6 h-6 lg:w-8 lg:h-8" />
        Boas Práticas
      </h2>
      <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg p-4 lg:p-6 border`}>
        
        <div className="space-y-6">
          <div>
            <h3 className={`text-xl font-semibold ${darkMode ? 'text-green-400' : 'text-green-700'} mb-3`} style={{ fontSize: fontSize + 4 }}>Requisições de Dados</h3>
            <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'} p-4 rounded mb-3`}>
              <h4 className={`font-semibold ${darkMode ? 'text-blue-400' : 'text-blue-700'} mb-2`} style={{ fontSize: fontSize }}>✓ Use Loaders para dados estáticos</h4>
              <p className="text-sm mb-2" style={{ fontSize: fontSize - 2 }}>Sempre busque dados no servidor usando loaders do Remix:</p>
              <div className={`${darkMode ? 'bg-gray-900' : 'bg-gray-200'} p-3 rounded`}>
                <code className={`${darkMode ? 'text-green-300' : 'text-green-700'} text-sm`} style={{ fontSize: fontSize - 2 }}>
{`// app/loader/minha-pagina.ts
export async function loader() {
  const data = await fetchWithTimeout(
    "http://api.garfo.ameciclo.org/endpoint",
    { cache: "no-cache" },
    5000,
    { fallback: [] }
  );
  return { data };
}`}
                </code>
              </div>
            </div>

            <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'} p-4 rounded`}>
              <h4 className={`font-semibold ${darkMode ? 'text-blue-400' : 'text-blue-700'} mb-2`} style={{ fontSize: fontSize }}>✓ Centralize URLs em arquivos server</h4>
              <p className="text-sm mb-2" style={{ fontSize: fontSize - 2 }}>Mantenha URLs de APIs em arquivos de serviço:</p>
              <div className={`${darkMode ? 'bg-gray-900' : 'bg-gray-200'} p-3 rounded`}>
                <code className={`${darkMode ? 'text-green-300' : 'text-green-700'} text-sm`} style={{ fontSize: fontSize - 2 }}>
{`// app/services/contagens.service.ts
const API_BASE = "http://api.garfo.ameciclo.org";

export async function getContagens() {
  return fetchWithTimeout(\`\${API_BASE}/cyclist-counts\`);
}`}
                </code>
              </div>
            </div>
          </div>

          <div>
            <h3 className={`text-xl font-semibold ${darkMode ? 'text-green-400' : 'text-green-700'} mb-3`} style={{ fontSize: fontSize + 4 }}>Padrão de Cores Ameciclo</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'} p-4 rounded`}>
                <h4 className={`font-semibold mb-3`} style={{ fontSize: fontSize }}>Cores Principais</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded" style={{ backgroundColor: '#008080' }}></div>
                    <div className="text-sm" style={{ fontSize: fontSize - 2 }}>
                      <strong>ameciclo:</strong> #008080<br />
                      <code className={`${darkMode ? 'bg-gray-600' : 'bg-gray-300'} px-1 rounded`}>text-ameciclo</code>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded" style={{ backgroundColor: '#5050aa' }}></div>
                    <div className="text-sm" style={{ fontSize: fontSize - 2 }}>
                      <strong>ideciclo:</strong> #5050aa<br />
                      <code className={`${darkMode ? 'bg-gray-600' : 'bg-gray-300'} px-1 rounded`}>text-ideciclo</code>
                    </div>
                  </div>
                </div>
              </div>

              <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'} p-4 rounded`}>
                <h4 className={`font-semibold mb-3`} style={{ fontSize: fontSize }}>Cores Sugeridas</h4>
                <ul className="text-sm space-y-1" style={{ fontSize: fontSize - 2 }}>
                  <li>• <strong>Sucesso:</strong> green-500, green-600</li>
                  <li>• <strong>Alerta:</strong> yellow-500, yellow-600</li>
                  <li>• <strong>Erro:</strong> red-500, red-600</li>
                  <li>• <strong>Info:</strong> blue-500, blue-600</li>
                  <li>• <strong>Neutro:</strong> gray-500, gray-600</li>
                </ul>
              </div>
            </div>
          </div>

          <div>
            <h3 className={`text-xl font-semibold ${darkMode ? 'text-green-400' : 'text-green-700'} mb-3`} style={{ fontSize: fontSize + 4 }}>Padrões de Estilo</h3>
            
            <div className="space-y-3">
              <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'} p-4 rounded`}>
                <h4 className={`font-semibold ${darkMode ? 'text-purple-400' : 'text-purple-700'} mb-2`} style={{ fontSize: fontSize }}>Cards</h4>
                <p className="text-sm mb-2" style={{ fontSize: fontSize - 2 }}>Padrão: bordas arredondadas, sombra sutil</p>
                <div className={`${darkMode ? 'bg-gray-900' : 'bg-gray-200'} p-3 rounded`}>
                  <code className={`${darkMode ? 'text-green-300' : 'text-green-700'} text-sm`} style={{ fontSize: fontSize - 2 }}>
                    className="rounded-lg shadow-md p-4 border"
                  </code>
                </div>
              </div>

              <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'} p-4 rounded`}>
                <h4 className={`font-semibold ${darkMode ? 'text-purple-400' : 'text-purple-700'} mb-2`} style={{ fontSize: fontSize }}>Bordas</h4>
                <ul className="text-sm space-y-1" style={{ fontSize: fontSize - 2 }}>
                  <li>• <code className={`${darkMode ? 'bg-gray-600' : 'bg-gray-300'} px-1 rounded`}>rounded</code> - 4px (padrão)</li>
                  <li>• <code className={`${darkMode ? 'bg-gray-600' : 'bg-gray-300'} px-1 rounded`}>rounded-lg</code> - 8px (cards)</li>
                  <li>• <code className={`${darkMode ? 'bg-gray-600' : 'bg-gray-300'} px-1 rounded`}>rounded-xl</code> - 12px (destaque)</li>
                </ul>
              </div>

              <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'} p-4 rounded`}>
                <h4 className={`font-semibold ${darkMode ? 'text-purple-400' : 'text-purple-700'} mb-2`} style={{ fontSize: fontSize }}>Sombras</h4>
                <ul className="text-sm space-y-1" style={{ fontSize: fontSize - 2 }}>
                  <li>• <code className={`${darkMode ? 'bg-gray-600' : 'bg-gray-300'} px-1 rounded`}>shadow-sm</code> - Sutil</li>
                  <li>• <code className={`${darkMode ? 'bg-gray-600' : 'bg-gray-300'} px-1 rounded`}>shadow-md</code> - Média (padrão cards)</li>
                  <li>• <code className={`${darkMode ? 'bg-gray-600' : 'bg-gray-300'} px-1 rounded`}>shadow-lg</code> - Destaque</li>
                </ul>
              </div>

              <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'} p-4 rounded`}>
                <h4 className={`font-semibold ${darkMode ? 'text-purple-400' : 'text-purple-700'} mb-2`} style={{ fontSize: fontSize }}>Fontes</h4>
                <ul className="text-sm space-y-1" style={{ fontSize: fontSize - 2 }}>
                  <li>• <strong>Família:</strong> Open Sans (font-custom)</li>
                  <li>• <strong>Títulos:</strong> text-2xl, text-3xl, font-bold</li>
                  <li>• <strong>Subtítulos:</strong> text-xl, font-semibold</li>
                  <li>• <strong>Corpo:</strong> text-base, text-sm</li>
                </ul>
              </div>
            </div>
          </div>

          <div>
            <h3 className={`text-xl font-semibold ${darkMode ? 'text-green-400' : 'text-green-700'} mb-3`} style={{ fontSize: fontSize + 4 }}>Estrutura de Arquivos</h3>
            
            <div className="space-y-3">
              <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'} p-4 rounded`}>
                <h4 className={`font-semibold ${darkMode ? 'text-orange-400' : 'text-orange-700'} mb-2`} style={{ fontSize: fontSize }}>Criando uma Nova Página</h4>
                <p className="text-sm mb-2" style={{ fontSize: fontSize - 2 }}>Use <code className={`${darkMode ? 'bg-gray-600' : 'bg-gray-300'} px-1 rounded`}>_index.tsx</code> para rotas sem segmento adicional:</p>
                <div className={`${darkMode ? 'bg-gray-900' : 'bg-gray-200'} p-3 rounded mb-2`}>
                  <code className={`${darkMode ? 'text-green-300' : 'text-green-700'} text-sm`} style={{ fontSize: fontSize - 2 }}>
                    app/routes/minha-secao._index.tsx → /minha-secao
                  </code>
                </div>
                <p className="text-sm" style={{ fontSize: fontSize - 2 }}>O <code className={`${darkMode ? 'bg-gray-600' : 'bg-gray-300'} px-1 rounded`}>_index</code> indica que é a rota raiz daquele segmento.</p>
              </div>

              <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'} p-4 rounded`}>
                <h4 className={`font-semibold ${darkMode ? 'text-orange-400' : 'text-orange-700'} mb-2`} style={{ fontSize: fontSize }}>Criando um Componente</h4>
                <ol className="text-sm space-y-2 ml-4" style={{ fontSize: fontSize - 2 }}>
                  <li>1. Crie em <code className={`${darkMode ? 'bg-gray-600' : 'bg-gray-300'} px-1 rounded`}>app/components/[Secao]/</code></li>
                  <li>2. Use PascalCase: <code className={`${darkMode ? 'bg-gray-600' : 'bg-gray-300'} px-1 rounded`}>MeuComponente.tsx</code></li>
                  <li>3. Export default function</li>
                  <li>4. Tipagem com TypeScript</li>
                </ol>
              </div>

              <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'} p-4 rounded`}>
                <h4 className={`font-semibold ${darkMode ? 'text-orange-400' : 'text-orange-700'} mb-2`} style={{ fontSize: fontSize }}>Organização de Pastas</h4>
                <ul className="text-sm space-y-1" style={{ fontSize: fontSize - 2 }}>
                  <li>• <strong>components/Commom/</strong> - Componentes globais reutilizáveis</li>
                  <li>• <strong>components/[Secao]/</strong> - Componentes específicos de seção</li>
                  <li>• <strong>routes/</strong> - Páginas (file-based routing)</li>
                  <li>• <strong>loader/</strong> - Funções de carregamento de dados</li>
                  <li>• <strong>services/</strong> - Lógica de negócio e APIs</li>
                  <li>• <strong>hooks/</strong> - Custom React hooks</li>
                  <li>• <strong>contexts/</strong> - React Context providers</li>
                  <li>• <strong>utils/</strong> - Funções utilitárias</li>
                </ul>
              </div>
            </div>
          </div>

          <div>
            <h3 className={`text-xl font-semibold ${darkMode ? 'text-green-400' : 'text-green-700'} mb-3`} style={{ fontSize: fontSize + 4 }}>Exemplo Completo</h3>
            <div className={`${darkMode ? 'bg-gray-900 border-gray-600' : 'bg-gray-100 border-gray-300'} p-4 rounded border`}>
              <code className={`${darkMode ? 'text-green-300' : 'text-green-700'} text-sm`} style={{ fontSize: fontSize - 2 }}>
{`// app/routes/minha-pagina._index.tsx
import { useLoaderData } from "@remix-run/react";
import { loader } from "~/loader/minha-pagina";
import Banner from "~/components/Commom/Banner";

export { loader };

export default function MinhaPagina() {
  const { data } = useLoaderData<typeof loader>();
  
  return (
    <>
      <Banner image="/banner.webp" alt="Minha Página" />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="rounded-lg shadow-md p-6 bg-white border">
          <h1 className="text-3xl font-bold text-ameciclo mb-4">
            Título
          </h1>
          {/* Conteúdo */}
        </div>
      </div>
    </>
  );
}`}
              </code>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
