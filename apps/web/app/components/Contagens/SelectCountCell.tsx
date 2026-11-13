import type { CountRow } from "@ameciclo/db/derive";
import { CompareCheckbox } from "~/components/Contagens/comparison/CompareCheckbox";

// Leading "select" cell of the counts table: adds the count to the comparison selection.
export function SelectCountCell({ row }: { row: CountRow }) {
  return <CompareCheckbox item={row} />;
}
