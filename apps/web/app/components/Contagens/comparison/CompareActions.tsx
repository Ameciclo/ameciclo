import type { PublicLocation } from "@ameciclo/db/shared";
import { contagemSlug } from "@ameciclo/db/slug";
import { Button } from "@ameciclo/ui/components/button";
import { MAX_COMPARE } from "./constants";
import type { CompareItem } from "./selection";
import { compareSelection, isFull, useCompareSelection } from "./store";

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
    <div className="flex flex-wrap items-center gap-2">
      <Button
        variant={picked ? "outline" : "default"}
        disabled={blocked}
        title={blocked ? `Você já escolheu ${MAX_COMPARE} contagens. Remova uma para escolher outra.` : undefined}
        onClick={() => compareSelection.toggle(item)}
      >
        {picked ? "Remover da comparação" : "Adicionar à comparação"}
      </Button>
      {latest.length > 1 && (
        <Button variant="outline" onClick={() => compareSelection.replace(latest)}>
          Comparar todas as edições deste ponto{location.counts.length > MAX_COMPARE ? ` (as ${MAX_COMPARE} mais recentes)` : ""}
        </Button>
      )}
    </div>
  );
}

// For a comparison page: carry its counts over to the selection, to add or remove some.
export function EditSelectionButton({ items, onEdit }: { items: readonly CompareItem[]; onEdit?: () => void }) {
  return (
    <Button
      variant="outline"
      size="sm"
      className="text-foreground"
      onClick={() => {
        compareSelection.replace(items);
        onEdit?.();
      }}
    >
      Editar esta seleção
    </Button>
  );
}
