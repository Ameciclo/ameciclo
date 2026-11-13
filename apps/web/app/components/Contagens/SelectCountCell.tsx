import type { CountRow } from "@ameciclo/db/derive";

// RESERVED SLOT for the "compare 2-5 counts" feature. The table already has a leading
// "select" column that renders this for every row (newest counts and expanded older ones).
// Replace the body with a checkbox wired to the comparison selection state; `row.countId`
// is the id of the specific count and `row.slug` its public slug.
export function SelectCountCell(_props: { row: CountRow }) {
  return null;
}
