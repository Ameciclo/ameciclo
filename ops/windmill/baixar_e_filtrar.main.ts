
// Municípios da RMR, com o código de 6 dígitos do SIM.
const RMR_SIM_CODES = [260005, 260105, 260290, 260345, 260680, 260720, 260760, 260775, 260790, 260940, 260960, 261070, 261160, 261370];

// Colunas que o passo seguinte usa; o resto do registro do SIM fica para trás.
const COLUNAS = ["DTOBITO", "CODMUNOCOR", "CODMUNRES", "LOCOCOR", "CAUSABAS", "LINHAA", "LINHAB", "LINHAC", "LINHAD", "LINHAII", "SEXO", "RACACOR", "IDADE"];

/**
 * Baixa do FTP do DATASUS os óbitos do SIM de um ano (todo o Brasil), descompacta o .dbc e devolve só
 * os de trânsito (causa básica V ou Y85) em que o município do óbito ou o de residência é da RMR.
 */
export async function main(ano: number) {
  const arquivo = `/tmp/DOBR${ano}.dbc`;
  const ftp = new Client(120_000);
  let versao = "";
  try {
    await ftp.access({ host: "ftp.datasus.gov.br" });
    for (const [pasta, nome] of [["CID10/DORES", "final"], ["PRELIM/DORES", "preliminar"]]) {
      try {
        await ftp.downloadTo(arquivo, `/dissemin/publicos/SIM/${pasta}/DOBR${ano}.dbc`);
        versao = nome;
        break;
      } catch {
        // Não existe nessa pasta.
      }
    }
  } finally {
    ftp.close();
  }
  if (!versao) throw new Error(`${ano}: arquivo não encontrado no DATASUS`);

  const rmr = new Set(RMR_SIM_CODES.map(String));
  const linhas: Record<string, string>[] = [];
  let transito = 0;
  const { records } = readDbc(readFileSync(arquivo), (r) => {
    const causa = (r.CAUSABAS ?? "").replace(/^\*/, "");
    if (!causa.startsWith("V") && !causa.startsWith("Y85")) return;
    transito += 1;
    if (!rmr.has((r.CODMUNOCOR ?? "").slice(0, 6)) && !rmr.has((r.CODMUNRES ?? "").slice(0, 6))) return;
    linhas.push(Object.fromEntries(COLUNAS.map((c) => [c, r[c] ?? ""])));
  });
  return { ano, versao, obitos_no_brasil: records, transito_no_brasil: transito, transito_na_rmr: linhas.length, linhas };
}
