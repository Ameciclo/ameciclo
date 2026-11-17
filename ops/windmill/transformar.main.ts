
/** Aplica as regras de limpeza a cada registro e conta o que foi descartado e por quê. */
export async function main(linhas: Record<string, string>[]) {
  const obitos: DeathDraft[] = [];
  const descartadas: Record<string, number> = {};
  for (const linha of linhas) {
    const r = toDraft(linha);
    if ("skipped" in r) descartadas[r.skipped] = (descartadas[r.skipped] ?? 0) + 1;
    else obitos.push(r.draft);
  }
  return { recebidas: linhas.length, aceitas: obitos.length, descartadas, obitos };
}
