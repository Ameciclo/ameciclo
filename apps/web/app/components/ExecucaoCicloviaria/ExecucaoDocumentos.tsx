import { BookOpen, Bike, ExternalLink, FileText, FolderOpen, Map as MapIcon, Mic, type LucideIcon } from "lucide-react";

type Resource = { title: string; url: string; text: string; icon: string; type: string };

const ICONS: Record<string, LucideIcon> = {
  FileText,
  Map: MapIcon,
  FolderOpen,
  Bike,
  Mic,
  BookOpen,
};

// What the visitor wants from each: the plan itself, help to understand it, a way to keep watching.
const GROUPS = [
  { label: "O plano", types: ["document", "folder"] },
  { label: "Para entender", types: ["media", "wiki"] },
  { label: "Para acompanhar", types: ["external"] },
];

/** The documents and tools around the PDC, as a quiet list: each link says what it is and where it goes. */
export function ExecucaoDocumentos({ title, resources }: { title: string; resources: Resource[] }) {
  return (
    <section className="container mx-auto mb-12 mt-10 px-4" aria-labelledby="documentos">
      <h2 id="documentos" className="text-xl font-bold text-gray-800">
        {title}
      </h2>
      <div className="mt-4 max-w-3xl space-y-7">
        {GROUPS.map((group) => {
          const items = resources.filter((r) => group.types.includes(r.type));
          if (items.length === 0) return null;
          return (
            <div key={group.label}>
              <h3 className="mb-1 text-sm font-semibold uppercase tracking-wide text-ameciclo">{group.label}</h3>
              <ul>
                {items.map((r) => {
                  const Icon = ICONS[r.icon] ?? FileText;
                  return (
                    <li key={r.url}>
                      <a
                        href={r.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group -mx-2 flex items-start gap-3 rounded-md border-t border-gray-200 px-2 py-3 transition-colors hover:bg-gray-50"
                      >
                        <Icon className="mt-0.5 size-5 shrink-0 text-ameciclo" aria-hidden="true" />
                        <span className="min-w-0 flex-1">
                          <span className="block font-semibold text-gray-900 underline-offset-2 group-hover:underline">{r.title}</span>
                          <span className="mt-0.5 block text-sm leading-snug text-gray-600">{r.text}</span>
                        </span>
                        <ExternalLink className="mt-1 size-4 shrink-0 text-gray-400" aria-hidden="true" />
                        <span className="sr-only">(abre em outra aba)</span>
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
}
