import type { Ameciclista } from "~/queries/quemsomos";

// The CMS spells the fiscal council both ways (see the note in queries/quemsomos.ts).
export const isCoordination = (person: Ameciclista) => person.role === "coordenacao";
export const isFiscalCouncil = (person: Ameciclista) =>
  person.role === "conselhofiscal" || person.role === "concelhofiscal";

export function roleLabel(person: Ameciclista): string {
  if (isCoordination(person)) return "Coordenação";
  if (isFiscalCouncil(person)) return "Conselho Fiscal";
  return "Ameciclista";
}

export const initials = (name: string | null | undefined) =>
  (name ?? "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

/** Lowercase, accent-free text for forgiving name search ("jose" finds "José"). */
export const normalize = (text: string) =>
  text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
