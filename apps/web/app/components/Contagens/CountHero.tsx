import { changeSincePrevious } from "@ameciclo/db/derive";
import type { PublicCount, PublicLocation } from "@ameciclo/db/shared";
import { TrendingDown, TrendingUp } from "lucide-react";
import { Badge } from "@ameciclo/ui/components/badge";
import { countNote } from "~/services/counting-details.service";
import { IntlDateStr, IntlNumber } from "~/services/utils";

const percentFormat = new Intl.NumberFormat("pt-BR", { style: "percent", maximumFractionDigits: 0, signDisplay: "exceptZero" });

type CountHeroProps = { location: PublicLocation; selected: PublicCount };

// Header of a count's page: where, when, and the two numbers that matter most (total and
// the peak hour), plus how the total moved since the previous count of the same place.
export function CountHero({ location, selected }: CountHeroProps) {
  const note = countNote(selected);
  const change = changeSincePrevious(location.counts).get(selected.id) ?? null;
  const previous = location.counts
    .filter((c) => c.variant === selected.variant && c.date < selected.date)
    .sort((a, b) => b.date.localeCompare(a.date))[0];

  return (
    <section className="bg-ameciclo-dark text-white" aria-labelledby="titulo-contagem">
      <div className="container mx-auto px-4 py-8 md:py-10">
        <p className="text-sm font-semibold tracking-[0.2em] text-white/80 uppercase">Contagem de ciclistas</p>
        <h1 id="titulo-contagem" className="mt-2 text-3xl leading-tight font-bold sm:text-4xl md:text-5xl">
          {location.name}
          {selected.variant && <span className="block text-xl font-semibold text-white/85 sm:text-2xl">{selected.variant}</span>}
        </h1>
        <p className="mt-3 flex flex-wrap items-center gap-2 text-white/90">
          <time dateTime={selected.date}>{IntlDateStr(selected.date)}</time>
          {note && <Badge className="border-amber-300 bg-amber-100 text-amber-900">{note}</Badge>}
        </p>

        <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-6 md:grid-cols-3 md:divide-x md:divide-white/20">
          <div className="flex flex-col-reverse gap-1">
            <dt className="text-xs font-medium tracking-widest text-white/80 uppercase">Total de ciclistas</dt>
            <dd className="text-5xl leading-none font-bold tabular-nums sm:text-6xl">{IntlNumber(selected.total_cyclists)}</dd>
          </div>
          <div className="flex flex-col-reverse gap-1 md:pl-6">
            <dt className="text-xs font-medium tracking-widest text-white/80 uppercase">Pico em 1 hora</dt>
            <dd className="text-5xl leading-none font-bold tabular-nums sm:text-6xl">{IntlNumber(selected.max_hour_cyclists)}</dd>
          </div>
          <div className="col-span-2 flex flex-col-reverse gap-1 md:col-span-1 md:pl-6">
            <dt className="text-xs font-medium tracking-widest text-white/80 uppercase">
              {previous ? `Desde ${IntlDateStr(previous.date)}` : "Contagem anterior"}
            </dt>
            <dd className="text-3xl leading-none font-bold tabular-nums sm:text-4xl">
              {change === null ? (
                <span className="text-white/70">—</span>
              ) : (
                <span className={`inline-flex items-center gap-2 ${change >= 0 ? "text-green-200" : "text-red-200"}`}>
                  {change > 0 ? <TrendingUp className="size-7" aria-hidden /> : change < 0 ? <TrendingDown className="size-7" aria-hidden /> : null}
                  {change === 0 ? "0%" : percentFormat.format(change)}
                </span>
              )}
            </dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
