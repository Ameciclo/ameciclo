import { countRows } from "@ameciclo/db/derive";
import type { PublicLocation } from "@ameciclo/db/shared";
import { CountsDataTable } from "./CountsDataTable";
import { CompareLink } from "./comparison/CompareLink";

type OtherCountsTableProps = {
  locations: PublicLocation[];
  // Slugs already on screen; they are left out of the table.
  shownSlugs: readonly string[];
  // The count the "compare only these two" shortcut pairs each row with.
  firstSlug: string;
};

// "Compare com outras contagens": the same table as the list, with a checkbox per row
// (select column) and a shortcut that compares the first count with just that row.
export function OtherCountsTable({ locations, shownSlugs, firstSlug }: OtherCountsTableProps) {
  const rows = countRows(locations, locations).filter((row) => !shownSlugs.includes(row.slug));

  return (
    <section className="bg-muted/60 py-10 md:py-14" aria-labelledby="outras-contagens">
      <div className="container mx-auto px-4">
        <h2 id="outras-contagens" className="text-2xl font-bold md:text-3xl">
          Compare com outras contagens
        </h2>
        <p className="mt-1 mb-6 text-muted-foreground">
          Marque de 2 a 5 contagens para compará-las lado a lado, ou use o atalho para comparar só com esta.
        </p>
        {rows.length === 0 ? (
          <p className="text-muted-foreground">Nenhuma outra contagem disponível para comparação no momento.</p>
        ) : (
          <CountsDataTable
            data={rows}
            label="Outras contagens para comparar"
            rowAction={(row) => (
              <CompareLink slugs={[firstSlug, row.slug]} className="text-xs font-medium text-primary underline-offset-4 hover:underline">
                Comparar só estas 2
              </CompareLink>
            )}
          />
        )}
      </div>
    </section>
  );
}
