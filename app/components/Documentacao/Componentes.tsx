import { ComponentIcon } from "~/components/Commom/Icones/DocumentationIcons";
import { DocumentationComponentProps } from "./types";

export default function Componentes({ darkMode = true, fontSize = 16 }: DocumentationComponentProps) {
  return (
    <section id="componentes" className="mb-12">
      <h2 className={`text-2xl lg:text-3xl font-bold ${darkMode ? 'text-green-400' : 'text-green-700'} mb-4 lg:mb-6 flex items-center gap-3`} style={{ fontSize: fontSize + 8 }}>
        <ComponentIcon className="w-6 h-6 lg:w-8 lg:h-8" />
        Componentes
      </h2>
      <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg p-4 lg:p-6 border`}>
        <p className="mb-6" style={{ fontSize: fontSize }}>Os componentes são organizados por funcionalidade e reutilizabilidade:</p>
        
        <div className="space-y-6">
          <div>
            <h3 className={`text-xl font-semibold ${darkMode ? 'text-green-400' : 'text-green-700'} mb-3`} style={{ fontSize: fontSize + 4 }}>Componentes Comuns</h3>
            <div className={`${darkMode ? 'bg-gray-900 border-gray-600' : 'bg-gray-100 border-gray-300'} p-4 rounded border`}>
              <code className={`${darkMode ? 'text-green-300' : 'text-green-700'}`} style={{ fontSize: fontSize - 2 }}>
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
            <h3 className={`text-xl font-semibold ${darkMode ? 'text-green-400' : 'text-green-700'} mb-3`} style={{ fontSize: fontSize + 4 }}>Exemplo de uso</h3>
            <div className={`${darkMode ? 'bg-gray-900 border-gray-600' : 'bg-gray-100 border-gray-300'} p-4 rounded border`}>
              <code className={`${darkMode ? 'text-green-300' : 'text-green-700'}`} style={{ fontSize: fontSize - 2 }}>
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