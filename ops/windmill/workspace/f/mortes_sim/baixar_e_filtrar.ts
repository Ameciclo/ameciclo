// GERADO por ops/windmill/build.sh (blast.ts + dbc.ts + o passo abaixo). Não edite aqui.
import { Client } from "basic-ftp";
import { readFileSync } from "node:fs";
// Descompactador do formato "implode" do PKWare (DCL), o que o DATASUS usa nos arquivos .dbc.
// Porte do blast.c de Mark Adler (zlib/contrib/blast), com a mesma estrutura, para conferência.
// A saída sai em pedaços de até 4 KiB (a janela do algoritmo), então dá para ler arquivos
// grandes sem guardar tudo na memória.

const MAXBITS = 13;
const MAXWIN = 4096;

type Huffman = { count: Int16Array; symbol: Int16Array };

// Comprimentos de código em forma compacta: cada byte é (repetições - 1) << 4 | comprimento.
const LITLEN = [
  11, 124, 8, 7, 28, 7, 188, 13, 76, 4, 10, 8, 12, 10, 12, 10, 8, 23, 8, 9, 7, 6, 7, 8, 7, 6, 55, 8, 23, 24, 12, 11, 7, 9, 11, 12, 6, 7,
  22, 5, 7, 24, 6, 11, 9, 6, 7, 22, 7, 11, 38, 7, 9, 8, 25, 11, 8, 11, 9, 12, 8, 12, 5, 38, 5, 38, 5, 11, 7, 5, 6, 21, 6, 10, 53, 8, 7,
  24, 10, 27, 44, 253, 253, 253, 252, 252, 252, 13, 12, 45, 12, 45, 12, 61, 12, 45, 44, 173,
];
const LENLEN = [2, 35, 36, 53, 38, 23];
const DISTLEN = [2, 20, 53, 230, 247, 151, 248];
const BASE = [3, 2, 4, 5, 6, 7, 8, 9, 10, 12, 16, 24, 40, 72, 136, 264];
const EXTRA = [0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 3, 4, 5, 6, 7, 8];

function construct(rep: number[], symbols: number): Huffman {
  const length: number[] = [];
  for (const r of rep) {
    const len = r & 15;
    for (let left = (r >> 4) + 1; left > 0; left--) length.push(len);
  }
  const count = new Int16Array(MAXBITS + 1);
  const symbol = new Int16Array(symbols);
  for (const len of length) count[len]++;
  const offs = new Int16Array(MAXBITS + 1);
  for (let len = 1; len < MAXBITS; len++) offs[len + 1] = offs[len] + count[len];
  length.forEach((len, sym) => {
    if (len !== 0) symbol[offs[len]++] = sym;
  });
  return { count, symbol };
}

const litcode = construct(LITLEN, 256);
const lencode = construct(LENLEN, 16);
const distcode = construct(DISTLEN, 64);

/** Descompacta `input` e entrega a saída, em pedaços, para `emit`. */
function blast(input: Uint8Array, emit: (chunk: Uint8Array) => void): void {
  let pos = 0;
  let bitbuf = 0;
  let bitcnt = 0;

  const next = (): number => {
    if (pos >= input.length) throw new Error("blast: fim inesperado da entrada");
    return input[pos++];
  };

  const bits = (need: number): number => {
    let val = bitbuf;
    while (bitcnt < need) {
      val |= next() << bitcnt;
      bitcnt += 8;
    }
    bitbuf = val >> need;
    bitcnt -= need;
    return val & ((1 << need) - 1);
  };

  const decode = (h: Huffman): number => {
    let code = 0;
    let first = 0;
    let index = 0;
    let len = 1;
    let nextCount = 1;
    let buf = bitbuf;
    let left = bitcnt;
    while (true) {
      while (left--) {
        code |= (buf & 1) ^ 1;
        buf >>= 1;
        const count = h.count[nextCount++];
        if (code < first + count) {
          bitbuf = buf;
          bitcnt = (bitcnt - len) & 7;
          return h.symbol[index + (code - first)];
        }
        index += count;
        first += count;
        first <<= 1;
        code <<= 1;
        len++;
      }
      left = MAXBITS + 1 - len;
      if (left === 0) break;
      buf = next();
      if (left > 8) left = 8;
    }
    throw new Error("blast: código inválido");
  };

  const out = new Uint8Array(MAXWIN);
  let nextOut = 0;
  let first = true;
  const flush = () => {
    emit(out.slice(0, nextOut));
    nextOut = 0;
    first = false;
  };

  const lit = bits(8);
  if (lit > 1) throw new Error("blast: cabeçalho inválido");
  const dict = bits(8);
  if (dict < 4 || dict > 6) throw new Error("blast: tamanho de dicionário inválido");

  while (true) {
    if (bits(1)) {
      let symbol = decode(lencode);
      let len = BASE[symbol] + bits(EXTRA[symbol]);
      if (len === 519) break; // fim
      symbol = len === 2 ? 2 : dict;
      let dist = decode(distcode) << symbol;
      dist += bits(symbol);
      dist++;
      if (first && dist > nextOut) throw new Error("blast: distância além do início");
      while (len > 0) {
        let from = nextOut - dist;
        let copy = MAXWIN;
        if (nextOut < dist) {
          from += copy;
          copy = dist;
        }
        copy -= nextOut;
        if (copy > len) copy = len;
        len -= copy;
        for (let i = 0; i < copy; i++) out[nextOut++] = out[from++];
        if (nextOut === MAXWIN) flush();
      }
    } else {
      out[nextOut++] = lit ? decode(litcode) : bits(8);
      if (nextOut === MAXWIN) flush();
    }
  }
  if (nextOut > 0) flush();
}
// Arquivos .dbc do DATASUS: um DBF (dBase) cujos registros foram comprimidos com o "implode" do PKWare.
// Layout: cabeçalho do DBF sem compressão, 4 bytes de CRC e, depois, os registros comprimidos.

const latin1 = new TextDecoder("latin1");

type DbfField = { name: string; length: number };

/** Lê um .dbc e chama `onRecord` para cada registro (campos como texto, sem os espaços das pontas). */
function readDbc(input: Uint8Array, onRecord: (record: Record<string, string>) => void): { records: number } {
  const view = new DataView(input.buffer, input.byteOffset, input.byteLength);
  const headerSize = view.getUint16(8, true);
  const recordSize = view.getUint16(10, true);

  const fields: DbfField[] = [];
  for (let offset = 32; input[offset] !== 0x0d && offset < headerSize; offset += 32) {
    const name = latin1.decode(input.subarray(offset, offset + 11)).replace(/\0.*$/, "");
    fields.push({ name, length: input[offset + 16] });
  }

  let pending = new Uint8Array(0);
  let records = 0;
  const consume = (chunk: Uint8Array) => {
    let buf: Uint8Array;
    if (pending.length === 0) buf = chunk;
    else {
      buf = new Uint8Array(pending.length + chunk.length);
      buf.set(pending);
      buf.set(chunk, pending.length);
    }
    let at = 0;
    for (; at + recordSize <= buf.length; at += recordSize) {
      // O primeiro byte marca registros apagados.
      if (buf[at] === 0x2a) continue;
      const record: Record<string, string> = {};
      let p = at + 1;
      for (const f of fields) {
        record[f.name] = latin1.decode(buf.subarray(p, p + f.length)).trim();
        p += f.length;
      }
      records += 1;
      onRecord(record);
    }
    pending = buf.slice(at);
  };

  // 4 bytes de CRC entre o cabeçalho e os dados comprimidos.
  blast(input.subarray(headerSize + 4), consume);
  return { records };
}

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
