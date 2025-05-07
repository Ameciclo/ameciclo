import Titulo from "app/components/Documentacao/Titulo";
import Indice from "app/components/Documentacao/Indice";
import VisaoGeral from "~/components/Documentacao/VisaoGeral";
import EstruturaDoProjeto from "~/components/Documentacao/EstruturaDoProjeto";
import Conclusao from "~/components/Documentacao/Conclusao";
import Banner from "~/components/Commom/Banner";

export default function Docs() {
  return (
    <>
      <div className="p-6 mt-5 mb-5 max-w-5xl mx-auto bg-gray-100 rounded shadow-lg">
        <Titulo title="Documentação do Projeto para Desenvolvedores" />
        <Banner />
        <VisaoGeral />
        <Indice />
        <EstruturaDoProjeto />
        <Conclusao />
      </div>
    </>
  );
}