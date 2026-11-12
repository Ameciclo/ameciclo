// Public identifiers for contagens. A place has a slug of its own (`local.slug`);
// a single count is that slug plus the date and, when a place has several counts on
// the same day, the variant: `av-rui-barbosa-x-r-amelia-2022-03-30-pista-leste`.
// Nothing here is stored: the unique index on (local, date, variant) already makes
// the composed slug unique.

export function slugify(name: string): string {
  return name
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export type CountSlugParts = { localSlug: string; date: string; variant: string | null };

export function contagemSlug(localSlug: string, count: { date: string; variant: string | null }): string {
  const variant = count.variant ? slugify(count.variant) : "";
  return [localSlug, count.date, variant].filter(Boolean).join("-");
}

// The date has a fixed shape, so it marks where the place slug ends. `variant` is the
// slugified text; compare it with `matchesCount`, never with the raw variant.
const COUNT_SLUG = /^(.+?)-(\d{4}-\d{2}-\d{2})(?:-(.+))?$/;

export function parseContagemSlug(slug: string): CountSlugParts | null {
  const m = COUNT_SLUG.exec(slug);
  return m ? { localSlug: m[1], date: m[2], variant: m[3] ?? null } : null;
}

export function matchesCount(parts: CountSlugParts, count: { date: string; variant: string | null }): boolean {
  return count.date === parts.date && (count.variant ? slugify(count.variant) : null) === parts.variant;
}

// Links shared before slugs existed carry the numeric id of the place.
export function legacyPlaceId(segment: string): number | null {
  return /^[1-9]\d*$/.test(segment) ? Number(segment) : null;
}
