// Pure parsing of the OpenStreetMap-derived cycling data: the tags of a way
// and the description of a PDC route relation.

export const TYPOLOGIES = [
  { key: "ciclovia", label: "Ciclovia", color: "#0f766e", sortOrder: 1 },
  { key: "ciclofaixa", label: "Ciclofaixa", color: "#2563eb", sortOrder: 2 },
  { key: "ciclorrota", label: "Ciclorrota", color: "#d97706", sortOrder: 3 },
  { key: "calcada_compartilhada", label: "Calçada compartilhada", color: "#7c3aed", sortOrder: 4 },
] as const;

const TYPOLOGY_BY_LABEL = new Map<string, string>(TYPOLOGIES.map((t) => [t.label, t.key]));

/** "Ciclovia" → "ciclovia"; the atlas export writes "none" when there is no cycleway. */
export function typologyKey(label: string): string | null {
  return TYPOLOGY_BY_LABEL.get(label.trim()) ?? null;
}

export const RMR_CITIES = [
  2600054, 2601052, 2602902, 2603454, 2606804, 2607208, 2607604, 2607752, 2607901, 2609402, 2609600, 2610707,
  2611606, 2613701,
];

function yesNo(value: string | undefined): boolean | null {
  if (value === undefined) return null;
  if (["yes", "true", "1", "-1"].includes(value)) return true;
  if (["no", "false", "0"].includes(value)) return false;
  return null;
}

export type WayTags = {
  surface: string | null;
  oneway: boolean | null;
  maxspeedKmh: number | null;
  lit: boolean | null;
};

export function wayTags(tags: Record<string, string>): WayTags {
  const maxspeed = tags.maxspeed && /^\d{1,3}$/.test(tags.maxspeed) ? Number(tags.maxspeed) : null;
  return {
    surface: tags.surface ?? null,
    oneway: yesNo(tags.oneway),
    maxspeedKmh: maxspeed,
    lit: yesNo(tags.lit),
  };
}

const CITY_ALIASES = new Map([["Jaboatão", "Jaboatão dos Guararapes"]]);

function agencyName(part: string): string {
  const name = part.trim();
  if (/^Gov(\.|erno)/.test(name)) return "Governo do Estado";
  const city = name.replace(/^Pref(\.|eitura)\s+de\s+/, "");
  const canonical = CITY_ALIASES.get(city) ?? city;
  return name === city ? name : `Prefeitura de ${canonical}`;
}

/**
 * The agencies in the "Responsabilidade: …" (or "Resp.: …") part of a PDC
 * relation description. Joint projects list several: "Recife / Olinda",
 * "Recife e Jaboatão".
 */
export function agenciesFromDescription(description: string | undefined): string[] {
  const text = description?.match(/Resp(?:onsabilidade|\.):\s*([^|]+)/)?.[1]?.trim();
  if (!text) return [];
  // "Abreu e Lima" is a city, not two.
  const parts = text.replace("Abreu e Lima", "Abreu_e_Lima").split(/\s*\/\s*|\s+e\s+/);
  const prefecture = parts[0]?.match(/^Pref(\.|eitura)/);
  return [
    ...new Set(
      parts.map((part) => {
        const name = part.replaceAll("_", " ");
        // "Prefeitura de Recife e Olinda": the later parts are bare city names.
        return agencyName(prefecture && !/^(Pref|Gov)/.test(name) ? `Prefeitura de ${name}` : name);
      }),
    ),
  ];
}
