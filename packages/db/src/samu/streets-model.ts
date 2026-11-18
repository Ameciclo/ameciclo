// Constantes do ranking de vias que o navegador também usa. Fica sem nenhuma dependência (nada de banco), para entrar
// no pacote do navegador: o leitor (./streets) puxa o driver do Postgres, que não roda lá.

// "Chamados por km" só vale para vias de alguma extensão e com chamados suficientes: numa via de 50 m, três chamados
// dariam 60 por km. Abaixo disso o valor é null e a via fica de fora de qualquer ordenação por km.
export const MIN_RATE_KM = 0.5;
export const MIN_RATE_CALLS = 20;

// ---- Concentração: quanto dos chamados cabe nas primeiras vias do ranking -----------------------------------

export type RankedStreet = { calls: number; lengthKm: number | null };
export type ConcentrationPoint = {
  // Quantas vias do ranking entram, da mais para a menos insegura.
  vias: number;
  // Soma da extensão dessas vias (só as que têm extensão na malha da Prefeitura).
  km: number;
  // Parte dos chamados com via identificada que elas reúnem, de 0 a 100.
  share: number;
};

// Pelo número de vias: todas as vias entram, com ou sem extensão.
export function concentrationByVia(streets: RankedStreet[], identified: number): ConcentrationPoint[] {
  let calls = 0;
  let km = 0;
  return streets.map((s, i) => {
    calls += s.calls;
    km += s.lengthKm ?? 0;
    return { vias: i + 1, km, share: identified > 0 ? (calls / identified) * 100 : 0 };
  });
}

// Pela extensão: só as vias com extensão conhecida, porque o eixo é quilômetro. A parcela continua sendo sobre
// todos os chamados com via identificada; por isso a curva fica abaixo da outra se há vias sem extensão.
export function concentrationByKm(streets: RankedStreet[], identified: number): ConcentrationPoint[] {
  let calls = 0;
  let km = 0;
  let vias = 0;
  const points: ConcentrationPoint[] = [];
  for (const s of streets) {
    if (s.lengthKm === null) continue;
    calls += s.calls;
    km += s.lengthKm;
    vias += 1;
    points.push({ vias, km, share: identified > 0 ? (calls / identified) * 100 : 0 });
  }
  return points;
}

// O ponto da curva ao fim das N primeiras vias (null se o ranking tem menos de N).
export const atVias = (points: ConcentrationPoint[], n: number) => (points.length >= n ? points[n - 1] : null);

// O último ponto cuja extensão ainda cabe em `km` quilômetros (null se o ranking não chega a tanto ou nenhuma via cabe).
export function atKm(points: ConcentrationPoint[], km: number): ConcentrationPoint | null {
  const total = points.at(-1)?.km ?? 0;
  if (total < km) return null;
  const inside = points.filter((p) => p.km <= km);
  return inside.at(-1) ?? null;
}
