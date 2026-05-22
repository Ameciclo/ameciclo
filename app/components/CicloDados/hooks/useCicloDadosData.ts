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
    "Ultrapassar ciclista sem guardar a distância lateral mínima de 1,5 metro",
    "Deixar de dar preferência de passagem a pedestre e a ciclista",
    "Estacionar o veículo sobre ciclovia ou ciclofaixa",
    "Parar o veículo sobre ciclovia ou ciclofaixa",
    "Abrir a porta do veículo sem se certificar de que não causará perigo a outros usuários da via (incluindo ciclistas)",
    "Transitar com o veículo em ciclovias ou ciclofaixas",
    "Conduzir o veículo ameaçando os ciclistas (direção perigosa)"
  ];

  const sinistroOptions = [
    "Pedestres",
    "Ciclista",
    "Ocupante de moto",
    "Ocupante de carro",
    "Outro"
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

export const SINISTRO_CATEGORY_MAP: Record<string, string[]> = {
  "Pedestres": ["atropelamento_carro", "atropelamento_moto", "atropelamento_onibus_caminhao", "atropelamento_bicicleta"],
  "Ciclista": ["sinistro_bicicleta"],
  "Ocupante de moto": ["sinistro_moto"],
  "Ocupante de carro": ["sinistro_carro", "sinistro_onibus_caminhao"],
  "Outro": ["outro"]
};

const ALL_SINISTRO_CATEGORY_KEYS = Object.values(SINISTRO_CATEGORY_MAP).flat();

export function getSinistroTotal(properties: Record<string, any>): number {
  const cats = properties.accidents_by_category || {};
  const fromCategories = ALL_SINISTRO_CATEGORY_KEYS.reduce((sum, key) => sum + (cats[key] || 0), 0);
  return fromCategories > 0 ? fromCategories : (properties.accidents_count || 0);
}

export function getCategoryKeys(selectedOptions: string[]): string[] {
  return selectedOptions.flatMap(opt => SINISTRO_CATEGORY_MAP[opt] || []);
}