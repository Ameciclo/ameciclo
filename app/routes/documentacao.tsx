import Indice from "app/components/Documentacao/Indice"

export default function Docs() {
  return (
    <>
      <div className="p-6 mt-5 max-w-3xl mx-auto bg-gray-100 rounded shadow-lg">
        <h1 className="text-4xl text-center font-bold mb-4">Documentação do Projeto para Desenvolvedores</h1>
        <Indice />
      </div>
    </>
  );
}