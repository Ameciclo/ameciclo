import type { PublicCount } from "@ameciclo/db/shared";
import { contagemSlug } from "@ameciclo/db/slug";
import { Link } from "@tanstack/react-router";
import { countLabel, countNote } from "~/services/counting-details.service";

// Pills to switch between the counts of one place; shown only when there are several.
export function CountSelector({ placeSlug, counts, selectedId }: { placeSlug: string; counts: PublicCount[]; selectedId: number }) {
  if (counts.length < 2) return null;
  return (
    <nav aria-label="Contagens deste local" className="container mx-auto my-6 flex flex-wrap items-center justify-center gap-2">
      <span className="text-sm text-gray-600">Contagem:</span>
      {counts.map((count) => {
        const note = countNote(count);
        const selected = count.id === selectedId;
        return (
          <Link
            key={count.id}
            to="/dados/contagens/$slug"
            params={{ slug: contagemSlug(placeSlug, count) }}
            replace
            aria-current={selected ? "true" : undefined}
            className={`rounded-full border px-3 py-1 text-sm transition-colors ${
              selected ? "border-ameciclo bg-ameciclo text-white" : "border-gray-300 text-gray-700 hover:border-ameciclo hover:text-ameciclo"
            }`}
          >
            {countLabel(count)}
            {note && <span className="ml-1 text-xs opacity-80">({note.toLowerCase()})</span>}
          </Link>
        );
      })}
    </nav>
  );
}
