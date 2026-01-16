import { json } from "@remix-run/node";
import { SAMU_CALLS_API } from "~/servers";
import { fetchWithTimeout } from "~/services/fetchWithTimeout";

export async function fetchCityDataServer(city: string) {
  try {
    const data = await fetchWithTimeout(
      `${SAMU_CALLS_API}?municipality=${encodeURIComponent(city)}&limit=10000`,
      { cache: "force-cache" },
      30000,
      null,
      () => {},
      1
    );
    
    if (!data?.data || data.data.length === 0) return null;

    const yearMap = new Map();
    
    data.data.forEach((call: any) => {
      const year = new Date(call.date).getFullYear();
      
      if (!yearMap.has(year)) {
        yearMap.set(year, {
          ano: year,
          total: 0,
          atendimento_concluido: 0,
          removido_particulares: 0,
          removido_bombeiros: 0,
          obito_local: 0,
          por_sexo: { masculino: 0, feminino: 0, nao_informado: 0 },
          por_faixa_etaria: {},
          por_categoria: {}
        });
      }
      
      const yearData = yearMap.get(year);
      yearData.total++;
      
      const outcome = call.outcome_category?.toLowerCase() || '';
      if (outcome.includes('atendimento')) yearData.atendimento_concluido++;
      else if (outcome.includes('particulares')) yearData.removido_particulares++;
      else if (outcome.includes('bombeiros')) yearData.removido_bombeiros++;
      else if (outcome.includes('óbito')) yearData.obito_local++;
      
      const gender = call.gender?.toLowerCase() || 'nao_informado';
      if (gender.includes('masculino')) yearData.por_sexo.masculino++;
      else if (gender.includes('feminino')) yearData.por_sexo.feminino++;
      else yearData.por_sexo.nao_informado++;
      
      const age = call.age || 0;
      let faixa = 'nao_informado';
      if (age > 0 && age <= 17) faixa = '0_17_anos';
      else if (age >= 18 && age <= 29) faixa = '18_29_anos';
      else if (age >= 30 && age <= 49) faixa = '30_49_anos';
      else if (age >= 50 && age <= 64) faixa = '50_64_anos';
      else if (age >= 65) faixa = '65_mais_anos';
      yearData.por_faixa_etaria[faixa] = (yearData.por_faixa_etaria[faixa] || 0) + 1;
      
      const category = call.category || 'outro';
      yearData.por_categoria[category] = (yearData.por_categoria[category] || 0) + 1;
    });
    
    return {
      historico_anual: Array.from(yearMap.values()).sort((a, b) => a.ano - b.ano)
    };
  } catch (e) {
    console.error('Erro ao buscar dados da cidade:', e);
    return null;
  }
}
