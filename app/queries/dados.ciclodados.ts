import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { COUNTINGS_ATLAS_LOCATIONS, PERFIL_SURVEY_LOCATIONS } from "~/servers";

const fetchCicloDados = createServerFn().handler(async () => {
  try {
    const [amecicloResponse, perfilResponse] = await Promise.all([
      fetch(COUNTINGS_ATLAS_LOCATIONS),
      fetch(PERFIL_SURVEY_LOCATIONS),
    ]);

    const amecicloData = amecicloResponse.ok
      ? await amecicloResponse.json()
      : [];
    const perfilData = perfilResponse.ok ? await perfilResponse.json() : null;

    return {
      contagemData: { ameciclo: amecicloData, prefeitura: [] as any[] },
      execucaoCicloviaria: null as any,
      perfilCiclistas: perfilData,
    };
  } catch (error) {
    console.error("Error loading ciclodados:", error);
    return {
      contagemData: { ameciclo: [] as any[], prefeitura: [] as any[] },
      execucaoCicloviaria: null as any,
      perfilCiclistas: null as any,
    };
  }
});

export const ciclodadosQueryOptions = () =>
  queryOptions({
    queryKey: ["dados", "ciclodados"],
    queryFn: () => fetchCicloDados(),
  });
