export function IdecicloDescription({ info }: any) {
  const formatDescriptionText = (text: string | null | undefined) => {
    if (!text || text.toUpperCase() === "N/A") {
      return "Não há registro";
    }
    const lowerCaseText = text.toLowerCase();
    return lowerCaseText.charAt(0).toUpperCase() + lowerCaseText.slice(1);
  };

  return (
    <div className="flex flex-col bg-white mx-4 md:mx-auto max-w-4xl divide-y md:divide-x divide-gray-100">
      <div className="flex flex-col justify-center w-full p-6 text-center tracking-widest">
        <h3>DESCRIÇÃO</h3>
        <h3 className="text-2xl mt-2">
          <strong>{formatDescriptionText(info.tipologia)}</strong>,{" "}
          <strong>{formatDescriptionText(info.fluxo)}</strong>
          {info.pavimento != null && info.pavimento.toUpperCase() !== "N/A" && (
            <>
              , com piso de{" "}
              <strong>{formatDescriptionText(info.pavimento?.replace(",", " e"))}</strong>
            </>
          )}
          {info.tipologia.toUpperCase() !== "CICLORROTA" && (
            <>
              , localizada <strong>{formatDescriptionText(info.localizacao)}</strong>
            </>
          )}
        </h3>
      </div>
      <div className="flex flex-col justify-center w-full p-6 text-center tracking-widest">
        <h3>LARGURA</h3>
        {info.largura_transitavel != null && info.largura_transitavel !== "N/A" && info.largura_transitavel >= 0 ? (
          <h3 className="text-3xl  mt-2">
            <strong>{("" + info.largura_total).replace(".", ",")}m</strong>,
            onde{" "}
            <strong>
              {("" + info.largura_transitavel).replace(".", ",")}m{" "}
            </strong>
            são transitáveis
          </h3>
        ) : (
          <h3 className="text-3xl font-bold mt-2">Não há registro</h3>
        )}
      </div>
      <div className="flex flex-col justify-center w-full p-6 text-center uppercase tracking-widest">
        <h3>Última avaliação</h3>
        <h3 className="text-3xl font-bold mt-2">{info.data}</h3>
      </div>
    </div>
  );
}
