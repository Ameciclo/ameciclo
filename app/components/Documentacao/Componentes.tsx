import { ComponentIcon } from "~/components/Commom/Icones/DocumentationIcons";

export default function Componentes() {
  return (
    <section id="componentes" className="mb-12">
      <h2 className="text-2xl lg:text-3xl font-bold text-green-400 mb-4 lg:mb-6 flex items-center gap-3">
        <ComponentIcon className="w-6 h-6 lg:w-8 lg:h-8" />
        Componentes
      </h2>
      <div className="bg-gray-800 rounded-lg p-4 lg:p-6 border border-gray-700">
        <p className="mb-6">Os componentes são organizados por funcionalidade e reutilizabilidade:</p>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold text-green-400 mb-3">Componentes Comuns</h3>
            <div className="bg-gray-900 p-4 rounded border border-gray-600">
              <code className="text-green-300">
                app/components/Commom/
                <br />├── Navbar.tsx          # Barra de navegação
                <br />├── Footer.tsx          # Rodapé
                <br />├── Banner.tsx          # Banner de páginas
                <br />├── Breadcrumb.tsx      # Navegação estrutural
                <br />└── GoogleAnalytics.tsx # Analytics
              </code>
            </div>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold text-green-400 mb-3">Exemplo de uso</h3>
            <div className="bg-gray-900 p-4 rounded border border-gray-600">
              <code className="text-green-300">
{`import Banner from "~/components/Commom/Banner";
import Breadcrumb from "~/components/Commom/Breadcrumb";

export default function MinhaPage() {
  return (
    <>
      <Banner image="/imagem.webp" alt="Descrição" />
      <Breadcrumb 
        label="Página Atual" 
        slug="/pagina-atual" 
        routes={["/", "/secao"]} 
      />
      {/* Conteúdo da página */}
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