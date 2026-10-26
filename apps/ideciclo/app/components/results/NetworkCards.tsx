import { Badge } from "@ameciclo/ui/components/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@ameciclo/ui/components/card";
import type { CityResultsBreakdown } from "~/lib/ideciclo/results";
import { formatCount, formatIndex, formatKm, formatPercent, NETWORK_KEYS } from "~/lib/ideciclo/results-view";
import { ProgressRow } from "./ResultsSummary";

const share = (part: number, total: number) => (total > 0 ? (part / total) * 100 : 0);

// One card per road network: its share of the plan, how far it is evaluated, its GAM and what it adds to the index.
export function NetworkCards({ networks }: { networks: CityResultsBreakdown["networks"] }) {
  return (
    <div className="grid gap-4 xl:grid-cols-3">
      {NETWORK_KEYS.map((key) => {
        const network = networks[key];
        return (
          <Card key={network.key} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-3">
                <CardTitle>{network.label}</CardTitle>
                <Badge className="border-slate-200 bg-slate-100 text-slate-700">Peso {formatPercent(network.weight * 100)}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Stat label="Malha viária total">{formatKm(network.totalRoadKm)} km</Stat>
                <Stat label="Estruturas mapeadas">{formatCount(network.structuresCount)}</Stat>
              </div>

              <ProgressRow
                label="Avaliações concluídas"
                value={`${formatCount(network.evaluatedCount)}/${formatCount(network.structuresCount)}`}
                progress={share(network.evaluatedCount, network.structuresCount)}
                barClassName="[&>div]:bg-ideciclo-blue"
              />
              <ProgressRow
                label="Km avaliados"
                value={`${formatKm(network.evaluatedKm)}/${formatKm(network.structureKm)} km`}
                progress={share(network.evaluatedKm, network.structureKm)}
                barClassName="[&>div]:bg-ideciclo-teal"
              />

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-2xl border border-slate-200 p-3">
                  <div className="text-slate-500">Contribuição total</div>
                  <div className="mt-2 text-xl font-bold text-slate-950">{formatKm(network.contributionSum)}</div>
                </div>
                <div className="rounded-2xl border border-slate-200 p-3">
                  <div className="text-slate-500">GAM</div>
                  <div className="mt-2 text-xl font-bold text-slate-950">{network.gam === null ? "-" : formatIndex(network.gam)}</div>
                </div>
              </div>

              <div className="rounded-2xl bg-slate-950 p-4 text-white">
                <div className="text-xs uppercase tracking-wide text-slate-300">Parcela atual no IDECICLO</div>
                <div className="mt-2 text-3xl font-black">{formatIndex(network.weightedContribution)}</div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function Stat({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-3">
      <div className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-2 text-2xl font-black text-slate-950">{children}</div>
    </div>
  );
}
