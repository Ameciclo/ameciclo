import type { PublicCount } from "@ameciclo/db/shared";
import type { Options } from "highcharts";
import { colors } from "~/components/Charts/FlowChart/FlowContainer";
import { countNote } from "~/services/counting-details.service";
import { IntlDateStr, IntlNumber } from "~/services/utils";
import { LazyChart } from "./LazyChart";

// Total cyclists of every count at a place, oldest first, so changes over the years are visible.
export function EvolutionChart({ counts, selectedId }: { counts: PublicCount[]; selectedId: number }) {
  const ordered = [...counts].sort((a, b) => a.date.localeCompare(b.date));

  const options: Options = {
    chart: { type: "column" },
    colors,
    title: { text: "Evolução ao longo dos anos" },
    legend: { enabled: false },
    xAxis: {
      categories: ordered.map((c) => (c.variant ? `${IntlDateStr(c.date)} · ${c.variant}` : IntlDateStr(c.date))),
    },
    yAxis: { title: { text: "Ciclistas" } },
    tooltip: {
      formatter() {
        const count = ordered[this.index];
        const note = countNote(count);
        return `<b>${this.key}</b><br/>${IntlNumber(count.total_cyclists)} ciclistas${note ? ` (${note.toLowerCase()})` : ""}`;
      },
    },
    series: [
      {
        type: "column",
        name: "Ciclistas",
        data: ordered.map((c) => ({
          y: c.total_cyclists,
          // The count being viewed stands out; estimated and partial ones are lighter.
          color: c.id === selectedId ? "#008080" : "#9bb5b5",
          opacity: countNote(c) ? 0.6 : 1,
        })),
      },
    ],
    credits: { enabled: false },
  };

  return (
    <section className="container mx-auto px-4 pb-10" aria-label="Evolução ao longo dos anos">
      <div className="overflow-x-auto rounded-xl border bg-card p-5 shadow-sm md:p-8">
        <div className="min-w-[500px]">
          <LazyChart options={options} />
        </div>
      </div>
    </section>
  );
}
