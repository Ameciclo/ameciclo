import type { PublicLocation } from "@ameciclo/db/shared";
import { contagemSlug } from "@ameciclo/db/slug";
import { MAX_COMPARE } from "./constants";
import type { CompareItem } from "./selection";
import { compareSelection, isFull, useCompareSelection } from "./store";

const buttonClass =
  "inline-flex items-center gap-2 rounded-lg px-5 py-3 font-medium shadow-md transition-colors disabled:cursor-not-allowed disabled:opacity-50";

export function itemsOf(location: Pick<PublicLocation, "name" | "slug" | "counts">): CompareItem[] {
  return location.counts.map((c) => ({ slug: contagemSlug(location.slug, c), name: location.name, date: c.date, variant: c.variant }));
}

// Buttons for a count's page: add (or remove) the count open on the page, and preselect the
// latest editions of its place. Neither one forces the open count into the comparison.
export function CompareActions({ item, location }: { item: CompareItem; location: Pick<PublicLocation, "name" | "slug" | "counts"> }) {
  const selection = useCompareSelection();
  const picked = selection.some((i) => i.slug === item.slug);
  const blocked = !picked && isFull(selection);

  // Oldest first, so the first count of the comparison is the baseline of the deltas.
  const latest = itemsOf(location)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, MAX_COMPARE)
    .reverse();

  return (
    <section className="container mx-auto mt-6 flex flex-wrap items-center justify-center gap-3 px-4">
      <button
        type="button"
        disabled={blocked}
        title={blocked ? `Você já escolheu ${MAX_COMPARE} contagens. Remova uma para escolher outra.` : undefined}
        onClick={() => compareSelection.toggle(item)}
        className={`${buttonClass} ${picked ? "border border-ameciclo bg-white text-ameciclo hover:bg-gray-50" : "bg-ameciclo text-white hover:bg-ameciclo/90"}`}
      >
        {picked ? "Remover da comparação" : "Adicionar à comparação"}
      </button>
      {latest.length > 1 && (
        <button
          type="button"
          onClick={() => compareSelection.replace(latest)}
          className={`${buttonClass} border border-ameciclo bg-white text-ameciclo hover:bg-gray-50`}
        >
          Comparar todas as edições deste ponto{location.counts.length > MAX_COMPARE ? ` (as ${MAX_COMPARE} mais recentes)` : ""}
        </button>
      )}
    </section>
  );
}

// For a comparison page: carry its counts over to the selection, to add or remove some.
export function EditSelectionButton({ items }: { items: readonly CompareItem[] }) {
  return (
    <button
      type="button"
      onClick={() => compareSelection.replace(items)}
      className="rounded-md border border-ameciclo bg-white px-4 py-2 text-sm font-medium text-ameciclo hover:bg-gray-50"
    >
      Editar esta seleção
    </button>
  );
}
