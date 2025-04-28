import { json, LoaderFunction } from "@remix-run/node";

export const loader: LoaderFunction = async () => {
  // Busca o cover
  const res = await fetch("https://cms.ameciclo.org/contagens", {
    cache: "no-cache",
  });

  if (!res.ok) {
    throw new Response("Erro ao buscar os dados", { status: res.status });
  }

  const data = await res.json();
  const cover = data.cover;

  // Busca os dados adicionais (summary + page)
  const summaryDataRes = await fetch("http://api.garfo.ameciclo.org/cyclist-counts", {
    cache: "no-cache",
  });
  const summaryDataJson = await summaryDataRes.json();
  const summaryData = summaryDataJson.summary;
  const countsData = summaryDataJson.counts;

  const pageDataRes = await fetch("https://cms.ameciclo.org/contagens", { cache: "no-cache" });
  const pageData = await pageDataRes.json();

  // Retorna tudo junto
  return json({ 
    cover, 
    summaryData, 
    countsData, 
    pageData 
  });
};
