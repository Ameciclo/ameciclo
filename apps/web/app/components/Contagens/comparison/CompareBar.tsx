import { MAX_COMPARE, MIN_COMPARE, colorAt } from "./constants";
import { CompareLink } from "./CompareLink";
import { compareLabel } from "./selection";
import { compareSelection, useCompareSelection } from "./store";

// Sticky bar with the counts picked so far. Render it once per page that has checkboxes;
// it takes no props and stays out of the way (renders nothing) while nothing is picked.
export function CompareBar() {
  const selection = useCompareSelection();
  if (selection.length === 0) return null;

  const missing = MIN_COMPARE - selection.length;
  const ready = missing <= 0;

  return (
    <>
      {/* Keeps the end of the page reachable behind the fixed bar. */}
      <div aria-hidden className="h-36 md:h-24" />
      <section
        aria-label="Contagens escolhidas para comparar"
        className="fixed inset-x-0 bottom-0 z-40 border-t-2 border-primary bg-background shadow-[0_-6px_20px_rgba(0,64,64,0.18)]"
      >
        <div className="container mx-auto flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 md:flex-nowrap">
          <p className="order-1 text-sm font-semibold text-foreground md:shrink-0" aria-live="polite">
            {selection.length}/{MAX_COMPARE} contagens
          </p>

          <ul className="order-3 flex min-w-0 basis-full gap-2 overflow-x-auto pb-1 md:order-2 md:basis-auto md:flex-1" aria-label="Contagens escolhidas">
            {selection.map((item, index) => {
              const label = compareLabel(item);
              return (
                <li
                  key={item.slug}
                  className="flex shrink-0 items-center gap-2 rounded-full border border-input bg-muted py-1 pl-3 pr-1 text-sm text-foreground"
                >
                  <span aria-hidden className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: colorAt(index).hex }} />
                  <span className="whitespace-nowrap">{label}</span>
                  <button
                    type="button"
                    onClick={() => compareSelection.remove(item.slug)}
                    aria-label={`Remover ${label} da comparação`}
                    className="flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  >
                    <span aria-hidden>×</span>
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="order-2 ml-auto flex items-center gap-3 md:order-3 md:shrink-0">
            <button type="button" onClick={compareSelection.clear} className="text-sm text-muted-foreground underline hover:text-foreground">
              Limpar
            </button>
            {ready ? (
              <CompareLink
                slugs={selection.map((i) => i.slug)}
                className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow hover:bg-primary/90"
              >
                Comparar
              </CompareLink>
            ) : (
              <span className="flex items-center gap-2">
                <span className="hidden text-xs text-muted-foreground sm:inline">escolha mais {missing}</span>
                <button
                  type="button"
                  disabled
                  title={`Escolha mais ${missing} para comparar`}
                  className="cursor-not-allowed rounded-md bg-muted px-4 py-2 text-sm font-semibold text-muted-foreground"
                >
                  Comparar
                </button>
              </span>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
