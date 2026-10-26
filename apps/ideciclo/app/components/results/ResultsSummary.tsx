import { AlertTriangle, Award, BarChart3, CheckCircle2, FileText } from "lucide-react";
import { Badge } from "@ameciclo/ui/components/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@ameciclo/ui/components/card";
import { Progress } from "@ameciclo/ui/components/progress";
import { cn } from "@ameciclo/ui/lib/utils";
import type { CityResultsBreakdown } from "~/lib/ideciclo/results";
import { formatCount, formatIndex, formatKm, formatPercent } from "~/lib/ideciclo/results-view";

const share = (part: number, total: number) => (total > 0 ? (part / total) * 100 : 0);

// The index (or its preview), how much of the city is evaluated, and what still needs attention.
export function ResultsSummary({ results }: { results: CityResultsBreakdown }) {
  const { city, summary } = results;
  const evaluatedProgress = share(summary.evaluatedStructures, summary.totalStructures);
  const evaluatedKmProgress = share(summary.evaluatedStructureKm, summary.totalStructureKm);

  return (
    <>
      <Card className={cn("border-2", summary.officialReady ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50")}>
        <CardContent className="flex flex-col gap-4 p-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {summary.officialReady ? <CheckCircle2 className="size-5 text-emerald-700" /> : <AlertTriangle className="size-5 text-amber-700" />}
              <Badge className={cn("border-transparent", summary.officialReady ? "bg-emerald-600 text-white" : "bg-amber-500 text-slate-950")}>
                {summary.officialReady ? "Cálculo oficial liberado" : "Prévia parcial"}
              </Badge>
            </div>
            <h3 className="text-2xl font-bold text-slate-900">
              {summary.officialReady
                ? `${city.name} já tem todas as estruturas necessárias para o cálculo do IDECICLO.`
                : `${city.name} ainda está em andamento, mas já dá para acompanhar a prévia do índice.`}
            </h3>
            <p className="max-w-3xl text-sm text-slate-700">
              A conta segue o manual nas páginas 62 a 66: cada trecho contribui com `extensão × nota / 100`, o Grau de Atendimento da Malha divide a soma das
              contribuições pela extensão total da malha viária, e o IDECICLO pondera estrutural, alimentadora e local.
            </p>
          </div>
          <div className="grid min-w-[260px] gap-2 rounded-[24px] border border-white/70 bg-white/80 p-5 shadow-sm">
            <div className="text-sm font-medium uppercase tracking-wide text-slate-500">{summary.officialReady ? "IDECICLO" : "Prévia do IDECICLO"}</div>
            <div className="text-5xl font-black text-slate-950">{formatIndex(summary.previewIdeciclo)}</div>
            <div className="text-sm text-slate-600">{formatPercent(summary.previewIdeciclo * 100)} de 100</div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Kpi icon={<Award className="size-5" />} label="Estruturas avaliadas" value={`${formatCount(summary.evaluatedStructures)}/${formatCount(summary.totalStructures)}`}>
          {formatPercent(evaluatedProgress)} concluído
        </Kpi>
        <Kpi icon={<BarChart3 className="size-5" />} label="Km avaliados" value={`${formatKm(summary.evaluatedStructureKm)}/${formatKm(summary.totalStructureKm)}`}>
          {formatPercent(evaluatedKmProgress)} da malha cicloviária baixada
        </Kpi>
        <Kpi icon={<CheckCircle2 className="size-5" />} label="Trechos válidos no cálculo" value={`${formatCount(summary.validStructures)}/${formatCount(summary.totalStructures)}`}>
          {formatKm(summary.validStructureKm)} km com contribuição positiva
        </Kpi>
        <Kpi icon={<FileText className="size-5" />} label="Pontos de atenção" value={formatCount(summary.pendingStructures + summary.unclassifiedStructures)}>
          {summary.pendingStructures} pendentes, {summary.unclassifiedStructures} sem hierarquia e {summary.incompatibleStructures} incompatíveis
        </Kpi>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Andamento das avaliações</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <ProgressRow label="Estruturas concluídas" value={`${formatCount(summary.evaluatedStructures)}/${formatCount(summary.totalStructures)}`} progress={evaluatedProgress} barClassName="[&>div]:bg-ideciclo-blue" large />
          <ProgressRow
            label="Extensão avaliada"
            value={`${formatKm(summary.evaluatedStructureKm)}/${formatKm(summary.totalStructureKm)} km`}
            progress={evaluatedKmProgress}
            barClassName="[&>div]:bg-ideciclo-teal"
            large
          />
          <div className="grid gap-4 md:grid-cols-3">
            <Count label="Pendentes" value={summary.pendingStructures}>
              Ainda não têm formulário salvo.
            </Count>
            <Count label="Sem hierarquia" value={summary.unclassifiedStructures}>
              Precisam voltar para o refinamento antes do cálculo final.
            </Count>
            <Count label="Incompatíveis" value={summary.incompatibleStructures}>
              Avaliadas com A1 = D, então entram com contribuição zero.
            </Count>
          </div>
        </CardContent>
      </Card>
    </>
  );
}

function Kpi({ icon, label, value, children }: { icon: React.ReactNode; label: string; value: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-3 text-slate-500">
          {icon}
          <span className="text-sm font-medium">{label}</span>
        </div>
        <div className="mt-4 text-3xl font-black text-slate-950">{value}</div>
        <p className="mt-2 text-sm text-slate-600">{children}</p>
      </CardContent>
    </Card>
  );
}

export function ProgressRow({ label, value, progress, barClassName, large = false }: { label: string; value: string; progress: number; barClassName: string; large?: boolean }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm font-medium text-slate-700">
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <Progress value={progress} className={cn("bg-slate-100", large ? "h-3" : "h-2.5", barClassName)} />
    </div>
  );
}

function Count({ label, value, children }: { label: string; value: number; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="text-sm font-semibold text-slate-700">{label}</div>
      <div className="mt-2 text-2xl font-black text-slate-950">{formatCount(value)}</div>
      <p className="mt-1 text-sm text-slate-600">{children}</p>
    </div>
  );
}
