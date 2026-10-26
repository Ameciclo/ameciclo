import type { IbgeCity } from "./types";

// The Distrito Federal has no municipalities besides Brasília; the evaluation
// works on its Regiões Administrativas, which the IBGE service does not list.
export const DF_STATE_ID = 53;

export const DF_REGIONS: IbgeCity[] = [
  { id: 53001080506, nome: "Plano Piloto" },
  { id: 53001080507, nome: "Gama" },
  { id: 53001080508, nome: "Taguatinga" },
  { id: 53001080509, nome: "Brazlândia" },
  { id: 53001080510, nome: "Sobradinho" },
  { id: 53001080511, nome: "Planaltina" },
  { id: 53001080512, nome: "Paranoá" },
  { id: 53001080514, nome: "Núcleo Bandeirante" },
  { id: 53001080515, nome: "Ceilândia" },
  { id: 53001080516, nome: "Guará" },
  { id: 53001080517, nome: "Cruzeiro" },
  { id: 53001080518, nome: "Samambaia" },
  { id: 53001080525, nome: "Santa Maria" },
  { id: 53001080530, nome: "São Sebastião" },
  { id: 53001080520, nome: "Recanto das Emas" },
  { id: 53001080523, nome: "Lago Sul" },
  { id: 53001080513, nome: "Riacho Fundo" },
  { id: 53001080521, nome: "Lago Norte" },
  { id: 53001080519, nome: "Candangolândia" },
  { id: 53001080536, nome: "Águas Claras" },
  { id: 53001080541, nome: "Riacho Fundo II" },
  { id: 53001080535, nome: "Sudoeste/Octogonal" },
  { id: 53001080543, nome: "Varjão" },
  { id: 53001080542, nome: "Park Way" },
  { id: 53001080534, nome: "SCIA" },
  { id: 53001080544, nome: "Sobradinho II" },
  { id: 53001080540, nome: "Jardim Botânico" },
  { id: 53001080538, nome: "Itapoã" },
  { id: 53001080533, nome: "SIA" },
  { id: 53001080537, nome: "Vicente Pires" },
  { id: 53001080539, nome: "Fercal" },
  { id: 53001080531, nome: "Sol Nascente/Pôr do Sol" },
  { id: 53001080532, nome: "Arniqueira" },
].sort((a, b) => a.nome.localeCompare(b.nome));

export function dfRegionName(cityId: string): string | undefined {
  return DF_REGIONS.find((region) => String(region.id) === cityId)?.nome;
}
