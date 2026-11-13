import type { CountRow } from "@ameciclo/db/derive";
import { z } from "zod";
import { MAX_COMPARE, MIN_COMPARE } from "./constants";

// What the selection needs to know about a count; every row of the public tables has it.
export type CompareItem = Pick<CountRow, "slug" | "name" | "date" | "variant">;

export const CompareItemSchema = z.object({
  slug: z.string().min(1),
  name: z.string(),
  date: z.string(),
  variant: z.string().nullable(),
});

// "Local · Pista Oeste (2019)": the year tells editions of one place apart, the variant
// tells apart counts of the same day (e.g. the lanes of one avenue).
export function compareLabel({ name, variant, date }: Pick<CompareItem, "name" | "variant" | "date">): string {
  return `${name}${variant ? ` · ${variant}` : ""} (${date.slice(0, 4)})`;
}

// Table rows carry more than the selection needs; keep only what it stores.
const pick = ({ slug, name, date, variant }: CompareItem): CompareItem => ({ slug, name, date, variant });

export type AddResult = { items: readonly CompareItem[]; changed: boolean };

export function addItem(items: readonly CompareItem[], item: CompareItem, max = MAX_COMPARE): AddResult {
  if (items.some((i) => i.slug === item.slug) || items.length >= max) return { items, changed: false };
  return { items: [...items, pick(item)], changed: true };
}

export function removeItem(items: readonly CompareItem[], slug: string): readonly CompareItem[] {
  return items.some((i) => i.slug === slug) ? items.filter((i) => i.slug !== slug) : items;
}

// Unique by slug, cut at the cap, order kept.
export function normalizeItems(items: readonly CompareItem[], max = MAX_COMPARE): readonly CompareItem[] {
  return [...new Map(items.map((i) => [i.slug, pick(i)])).values()].slice(0, max);
}

// `?c=a&c=b` parses to an array, `?c=a` to a plain value, and a number-looking value to a
// number. Anything else is dropped, repeated slugs collapse into one.
export function parseCompareParam(value: unknown): string[] {
  const list: unknown[] = Array.isArray(value) ? value : value === undefined ? [] : [value];
  const slugs = list.flatMap((v) => (typeof v === "string" && v ? [v] : typeof v === "number" ? [String(v)] : []));
  return [...new Set(slugs)];
}

export const isComparable = (count: number) => count >= MIN_COMPARE && count <= MAX_COMPARE;

// The address of a comparison. Written by hand because the router would JSON-encode the array.
export function compareHref(slugs: readonly string[]): string {
  const query = slugs.map((s) => `c=${encodeURIComponent(s)}`).join("&");
  return `/dados/contagens/comparar?${query}`;
}

// Change of a value against the first count; null when there is nothing to compare with.
export function deltaAgainst(value: number, base: number): number | null {
  return base > 0 ? (value - base) / base : null;
}
