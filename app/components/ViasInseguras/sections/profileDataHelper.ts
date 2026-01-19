export function processProfileData(evolucao: any[]) {
  const aggregatedData = {
    por_sexo: { masculino: 0, feminino: 0, nao_informado: 0 },
    por_faixa_etaria: {} as Record<string, number>,
    por_categoria: {} as Record<string, number>,
  };

  evolucao.forEach((year) => {
    if (year.por_sexo) {
      aggregatedData.por_sexo.masculino += year.por_sexo.masculino || 0;
      aggregatedData.por_sexo.feminino += year.por_sexo.feminino || 0;
      aggregatedData.por_sexo.nao_informado += year.por_sexo.nao_informado || 0;
    }

    if (year.por_faixa_etaria) {
      Object.entries(year.por_faixa_etaria).forEach(([key, value]) => {
        aggregatedData.por_faixa_etaria[key] = (aggregatedData.por_faixa_etaria[key] || 0) + (value as number);
      });
    }

    if (year.por_categoria) {
      Object.entries(year.por_categoria).forEach(([key, value]) => {
        aggregatedData.por_categoria[key] = (aggregatedData.por_categoria[key] || 0) + (value as number);
      });
    }
  });

  const genderTotal = aggregatedData.por_sexo.masculino + aggregatedData.por_sexo.feminino + aggregatedData.por_sexo.nao_informado;
  const genderData = genderTotal > 0 ? [
    {
      label: "Masculino",
      value: ((aggregatedData.por_sexo.masculino / genderTotal) * 100).toFixed(1),
      total: aggregatedData.por_sexo.masculino,
      color: "#3b82f6",
    },
    {
      label: "Feminino",
      value: ((aggregatedData.por_sexo.feminino / genderTotal) * 100).toFixed(1),
      total: aggregatedData.por_sexo.feminino,
      color: "#ec4899",
    },
    {
      label: "Não Informado",
      value: ((aggregatedData.por_sexo.nao_informado / genderTotal) * 100).toFixed(1),
      total: aggregatedData.por_sexo.nao_informado,
      color: "#6b7280",
    },
  ] : [];

  const ageTotal = Object.values(aggregatedData.por_faixa_etaria).reduce((sum, val) => sum + val, 0);
  const ageData = ageTotal > 0 ? Object.entries(aggregatedData.por_faixa_etaria).map(([key, value], index) => ({
    label: key.replace(/_/g, " "),
    value: ((value / ageTotal) * 100).toFixed(1),
    total: value,
    color: ["#10b981", "#3b82f6", "#f59e0b", "#8b5cf6", "#dc2626"][index % 5],
  })) : [];

  const categoryLabels: Record<string, string> = {
    sinistro_moto: "Sinistro de Moto",
    sinistro_carro: "Sinistro de Carro",
    atropelamento_carro: "Atropelamento por Carro",
    atropelamento_moto: "Atropelamento por Moto",
    sinistro_bicicleta: "Sinistro de Bicicleta",
    sinistro_onibus_caminhao: "Sinistro Ônibus/Caminhão",
    atropelamento_onibus_caminhao: "Atropelamento Ônibus/Caminhão",
    atropelamento_bicicleta: "Atropelamento de Bicicleta",
    outro: "Outro",
    nao_informado: "Não Informado",
  };

  const categoryTotal = Object.values(aggregatedData.por_categoria).reduce((sum, val) => sum + val, 0);
  const categoryData = categoryTotal > 0 ? Object.entries(aggregatedData.por_categoria)
    .sort(([, a], [, b]) => b - a)
    .map(([key, value], index) => ({
      label: categoryLabels[key] || key,
      value: ((value / categoryTotal) * 100).toFixed(1),
      total: value,
      color: ["#f59e0b", "#10b981", "#3b82f6", "#8b5cf6", "#dc2626", "#06b6d4", "#84cc16", "#f97316", "#6366f1"][index % 9],
    })) : [];

  return { genderData, ageData, categoryData };
}
