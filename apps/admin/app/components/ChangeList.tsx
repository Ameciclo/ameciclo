import type { DocumentChange } from "@ameciclo/db/document";

const SECTION_TITLES: Record<DocumentChange["section"], string> = {
  header: "Dados da contagem",
  approaches: "Aproximações",
  movements: "Movimentos",
  observations: "Características",
  conditions: "Condições",
  notes: "Notas",
};

const LIMIT = 80;

export function ChangeList({ changes }: { changes: DocumentChange[] }) {
  if (changes.length === 0) return <p className="text-sm text-muted-foreground">Nenhuma alteração.</p>;

  const shown = changes.slice(0, LIMIT);
  const sections = (Object.keys(SECTION_TITLES) as DocumentChange["section"][]).filter((s) =>
    shown.some((c) => c.section === s),
  );

  return (
    <div className="space-y-4 text-sm">
      {sections.map((section) => (
        <div key={section}>
          <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {SECTION_TITLES[section]}
          </h4>
          <ul className="space-y-1">
            {shown
              .filter((c) => c.section === section)
              .map((c, i) => (
                <li key={`${c.label}-${i}`} className="flex flex-wrap items-baseline gap-x-2">
                  <span className="font-medium">{c.label}</span>
                  <span className="rounded bg-red-50 px-1.5 text-red-700 line-through decoration-red-300 dark:bg-red-950/40 dark:text-red-300">
                    {c.before ?? "vazio"}
                  </span>
                  <span className="text-muted-foreground">→</span>
                  <span className="rounded bg-green-50 px-1.5 text-green-700 dark:bg-green-950/40 dark:text-green-300">
                    {c.after ?? "vazio"}
                  </span>
                </li>
              ))}
          </ul>
        </div>
      ))}
      {changes.length > LIMIT && (
        <p className="text-muted-foreground">e mais {changes.length - LIMIT} alterações.</p>
      )}
    </div>
  );
}
