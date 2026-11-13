import { MAX_COMPARE } from "./constants";
import type { CompareItem } from "./selection";
import { compareSelection, isFull, useCompareSelection } from "./store";
import { IntlDateStr } from "~/services/utils";

// Checkbox that adds a count to (or removes it from) the comparison. Drop it into any
// table cell: it needs only the count's `slug`, `name`, `date` and `variant`.
export function CompareCheckbox({ item }: { item: CompareItem }) {
  const selection = useCompareSelection();
  const checked = selection.some((i) => i.slug === item.slug);
  const blocked = !checked && isFull(selection);
  const name = `${item.name}${item.variant ? ` (${item.variant})` : ""}, ${IntlDateStr(item.date)}`;

  return (
    <input
      type="checkbox"
      className="h-5 w-5 cursor-pointer accent-ameciclo disabled:cursor-not-allowed disabled:opacity-40"
      checked={checked}
      disabled={blocked}
      title={blocked ? `Você já escolheu ${MAX_COMPARE} contagens. Remova uma para escolher outra.` : checked ? "Remover da comparação" : "Adicionar à comparação"}
      aria-label={`Selecionar contagem de ${name}`}
      onChange={() => compareSelection.toggle(item)}
    />
  );
}
