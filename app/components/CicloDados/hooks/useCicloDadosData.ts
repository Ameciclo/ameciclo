export const TODAS_INFRACOES = "Todas infrações";

export function useCicloDadosData() {
  const infraOptions = [
    { name: "Ciclovia", color: "#EF4444", pattern: "solid" },
    { name: "Ciclofaixa", color: "#6B7280", pattern: "bordered" },
    { name: "Ciclorrota", color: "#D1D5DB", pattern: "arrows" },
    { name: "Calçada compartilhada", color: "#10B981", pattern: "solid" }
  ];

  const contagemOptions = [
    "Contagem da Ameciclo",
    "Contagem da Prefeitura"
  ];

  const pdcOptions = [
    { name: "PDC Realizado Designado", color: "#10B981", pattern: "parallel", apiKey: "pdc_realizado_designado" },
    { name: "PDC Realizado Não Designado", color: "#8B5CF6", pattern: "parallel-dashed", apiKey: "pdc_realizado_nao_designado" },
    { name: "Realizado Fora PDC", color: "#F59E0B", pattern: "parallel-orange-dashed", apiKey: "realizado_fora_pdc" },
    { name: "PDC Não Realizado", color: "#EC4899", pattern: "striped", apiKey: "pdc_nao_realizado" }
  ];

  const infracaoOptions = [
    "Ultrapassar ciclista sem guardar distância de 1,5m",
    "Estacionar sobre ciclovia ou ciclofaixa",
    "Parar sobre ciclovia ou ciclofaixa",
    "Transitar com veículo em ciclovia ou ciclofaixa",
    "Abrir porta com perigo a ciclistas",
    "Conduzir veículo ameaçando ciclistas"
  ];

  const sinistroOptions = [
    { name: "Alta severidade (≥150 acidentes)", color: "#DC2626", pattern: "solid" },
    { name: "Média severidade (50–149)", color: "#F59E0B", pattern: "solid" },
    { name: "Baixa severidade (<50)", color: "#FBBF24", pattern: "solid" }
  ];

  const estacionamentoOptions = [
    "Bicicletários",
    "Estações de Bike PE"
  ];

  return {
    infraOptions,
    contagemOptions,
    pdcOptions,
    infracaoOptions,
    sinistroOptions,
    estacionamentoOptions
  };
}

export function getSinistroTotal(properties: Record<string, any>): number {
  const cats = properties.accidents_by_category || {};
  const keys = Object.values(cats);
  if (keys.length > 0) {
    return keys.reduce((sum: number, v: any) => sum + (v || 0), 0);
  }
  return properties.accidents_count || 0;
}
