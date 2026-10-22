const STOP = new Set([
  "av", "avenida", "r", "rua", "pc", "praca", "estrada", "dr", "doutor", "prof", "professor",
  "gov", "governador", "cons", "conselheiro", "eng", "engenheiro", "gal", "general", "pres",
  "presidente", "da", "de", "do", "dos", "das", "e", "ponte", "tv", "travessa",
]);

const SPELLING: Record<string, string> = { morais: "moraes", mascarenhas: "mascarenhas" };

function tokens(street: string): string[] {
  return street
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t && !STOP.has(t))
    .map((t) => SPELLING[t] ?? t);
}

export function splitVariant(rawName: string): { base: string; variant: string | null } {
  const name = rawName.replace(/[[\]]/g, "").trim();
  const m = name.match(/\s*[-–]\s*(pista\s+(leste|oeste))\s*$/i);
  if (!m) return { base: name, variant: null };
  const side = m[2].toLowerCase();
  return { base: name.slice(0, m.index).trim(), variant: `Pista ${side.charAt(0).toUpperCase()}${side.slice(1)}` };
}

// Same intersection spelled differently ("Rua Amélia x Rui Barbosa" vs
// "Av. Rui Barbosa x R. Amélia") maps to one key.
export function placeKey(name: string): string {
  const { base } = splitVariant(name);
  return base
    .split(/\s+[xX]\s+|\s*\|\s*/)
    .map((s) => tokens(s).sort().join(" "))
    .filter(Boolean)
    .sort()
    .join("|");
}

export function slugify(name: string): string {
  return name
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
