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
export function blast(input: Uint8Array, emit: (chunk: Uint8Array) => void): void {
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
