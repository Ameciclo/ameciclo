// Arquivos .dbc do DATASUS: um DBF (dBase) cujos registros foram comprimidos com o "implode" do PKWare.
// Layout: cabeçalho do DBF sem compressão, 4 bytes de CRC e, depois, os registros comprimidos.
import { blast } from "./blast";

const latin1 = new TextDecoder("latin1");

export type DbfField = { name: string; length: number };

/** Lê um .dbc e chama `onRecord` para cada registro (campos como texto, sem os espaços das pontas). */
export function readDbc(input: Uint8Array, onRecord: (record: Record<string, string>) => void): { records: number } {
  const view = new DataView(input.buffer, input.byteOffset, input.byteLength);
  const headerSize = view.getUint16(8, true);
  const recordSize = view.getUint16(10, true);

  const fields: DbfField[] = [];
  for (let offset = 32; input[offset] !== 0x0d && offset < headerSize; offset += 32) {
    const name = latin1.decode(input.subarray(offset, offset + 11)).split("\0")[0];
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
