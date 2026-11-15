import type { PublicCount } from "@ameciclo/db/shared";
import { contagemSlug } from "@ameciclo/db/slug";
import { Link } from "@tanstack/react-router";
import { cn } from "@ameciclo/ui/lib/utils";
import { countLabel, countNote } from "~/services/counting-details.service";

// Pills to switch between the counts of one place; shown only when there are several.
export function CountSelector({ placeSlug, counts, selectedId }: { placeSlug: string; counts: PublicCount[]; selectedId: number }) {
  if (counts.length < 2) return null;
  return (
    <nav aria-label="Contagens deste local" className="flex flex-wrap items-center gap-2">
      <span className="text-sm font-medium text-muted-foreground">Outras datas deste local</span>
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
            className={cn(
              "rounded-full border px-3 py-1 text-sm transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
              selected
                ? "border-primary bg-primary font-semibold text-primary-foreground"
                : "border-input bg-background text-foreground hover:border-primary hover:text-primary",
            )}
          >
            {countLabel(count)}
            {note && <span className="ml-1 text-xs opacity-80">({note.toLowerCase()})</span>}
          </Link>
        );
      })}
    </nav>
  );
}
