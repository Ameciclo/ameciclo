import Titulo from "app/components/Documentacao/Titulo";
import Indice from "app/components/Documentacao/Indice";
import VisaoGeral from "~/components/Documentacao/VisaoGeral";
import EstruturaDoProjeto from "~/components/Documentacao/EstruturaDoProjeto";
import Conclusao from "~/components/Documentacao/Conclusao";
import Banner from "~/components/Commom/Banner";
import InstalacaoProjeto from "~/components/Documentacao/Instalacao";
import Instalacao from "~/components/Documentacao/Instalacao";
import DevelopingComponent from "~/components/Commom/DevelopingComponent";

export default function Docs() {
  return (
    <>
      <div className="p-6 mt-5 mb-5 max-w-5xl mx-auto bg-gray-100 rounded shadow-lg">
        <Titulo title="Documentação" />
        <Banner />
        <Instalacao />
        <VisaoGeral />
        <Indice />
        <EstruturaDoProjeto />
        <Conclusao />
        <DevelopingComponent title={""} subtitle=""/>
      </div>
    </>
  );
}