import { ExternalLink } from "lucide-react";
import { Card } from "@ameciclo/ui/components/card";
import type { LinksEntry } from "~/queries/quemsomos";

function hostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

// Links to our own site stay in the same tab; everything else opens a new one.
const isInternal = (url: string) => hostname(url) === "ameciclo.org";

export function Transparency({ links }: { links: LinksEntry[] }) {
  const items = links.filter((link) => link.link);
  if (items.length === 0) return null;

  return (
    <section aria-labelledby="transparencia" className="mt-16">
      <h2 id="transparencia" className="text-3xl font-bold">
        Transparência e documentos
      </h2>
      <p className="mt-2 max-w-3xl text-gray-600">
        Como a Ameciclo se organiza, o que já fez e o que oferece: tudo aberto para consulta.
      </p>
      <ul className="mt-6 grid gap-4 sm:grid-cols-3">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={item.link ?? undefined}
              {...(isInternal(item.link ?? "") ? {} : { target: "_blank", rel: "noopener noreferrer" })}
              className="block h-full rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ameciclo"
            >
              <Card className="h-full justify-between gap-6 p-6 shadow-none transition-colors hover:bg-accent">
                <span className="text-lg font-semibold">{item.title}</span>
                <span className="flex items-center gap-1.5 text-sm text-gray-500">
                  {hostname(item.link ?? "")}
                  <ExternalLink className="size-3.5" aria-hidden />
                </span>
              </Card>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
