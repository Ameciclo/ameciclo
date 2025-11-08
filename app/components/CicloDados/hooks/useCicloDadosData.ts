export function useCicloDadosData() {
  const infraOptions = [
    { name: "Ciclovia", color: "#EF4444", pattern: "solid" },
    { name: "Ciclofaixa", color: "#6B7280", pattern: "bordered" },
    { name: "Ciclorrota", color: "#9CA3AF", pattern: "arrows" },
    { name: "Calçada compartilhada", color: "#10B981", pattern: "solid" }
  ];

  const contagemOptions = [
    "Somente Mulheres",
    "Crianças e Adolescentes", 
    "Carona",
    "Serviço",
    "Cargueira",
    "Uso de Calçada",
    "Contramão"
  ];

  const pdcOptions = [
    { name: "Realizado dentro do PDF com infra designada", color: "#8B5CF6", pattern: "parallel" },
    { name: "Realizado dentro do PDF com infra não designada", color: "#8B5CF6", pattern: "parallel-dashed" },
    { name: "Realizado fora do PDC", color: "#F59E0B", pattern: "parallel-orange-dashed" },
    { name: "PDC não realizado", color: "#EC4899", pattern: "striped" }
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
    "Vítima ciclista",
    "Vítima motociclistas", 
    "Vítima motorista",
    "Vítima pedestre"
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