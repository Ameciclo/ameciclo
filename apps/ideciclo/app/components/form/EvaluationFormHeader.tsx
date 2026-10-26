import { AlertTriangle, CheckCircle2, Wifi, WifiOff, X } from "lucide-react";
import type { ChangeEvent } from "react";
import { Alert, AlertDescription, AlertTitle } from "@ameciclo/ui/components/alert";
import { Badge } from "@ameciclo/ui/components/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@ameciclo/ui/components/card";
import { type A1Decision, getA1FieldLabel } from "~/lib/ideciclo/assessment";
import type { IdecicloFormData } from "~/lib/ideciclo/form-types";

export function StatusCards({
  isOnline,
  total,
  eliminated,
  lastLocalSaveAt,
}: {
  isOnline: boolean;
  total: number;
  eliminated: boolean;
  lastLocalSaveAt: string | null;
}) {
  return (
    <div className="mb-6 grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Estado</CardTitle>
        </CardHeader>
        <div className="px-6 pb-6">
          <div className="flex items-center gap-2 font-medium">
            {isOnline ? (
              <>
                <Wifi className="size-4 text-emerald-600" />
                <span>Online</span>
              </>
            ) : (
              <>
                <WifiOff className="size-4 text-amber-600" />
                <span>Offline</span>
              </>
            )}
          </div>
          <p className="mt-2 text-sm text-muted-foreground">O preenchimento segue funcionando e fica salvo localmente.</p>
        </div>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Pontuação Atual</CardTitle>
        </CardHeader>
        <div className="px-6 pb-6">
          <div className="text-3xl font-bold">{total.toFixed(1)}/100</div>
          <p className="mt-2 text-sm text-muted-foreground">
            {eliminated ? "Estrutura eliminada pela regra A1." : "Atualizada conforme os parâmetros e overrides manuais."}
          </p>
        </div>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Rascunho Local</CardTitle>
        </CardHeader>
        <div className="px-6 pb-6">
          <Badge variant="outline">
            {lastLocalSaveAt ? `Último autosave: ${new Date(lastLocalSaveAt).toLocaleString("pt-BR")}` : "Ainda sem autosave"}
          </Badge>
          <p className="mt-2 text-sm text-muted-foreground">O rascunho fica preso a este trecho e a este aparelho.</p>
        </div>
      </Card>
    </div>
  );
}

const A1_TONE = {
  incompatible: "border-rose-300 bg-rose-50 text-rose-950",
  compatible: "border-emerald-300 bg-emerald-50 text-emerald-950",
  pending: "border-amber-300 bg-amber-50 text-amber-950",
} as const;

// The verdict on A.1. While it is pending or incompatible it sticks to the top
// of the screen, until the evaluator dismisses it.
export function A1Banner({ decision, sticky, onDismiss }: { decision: A1Decision; sticky: boolean; onDismiss: () => void }) {
  return (
    <div className={sticky ? "sticky top-4 z-40 mb-6 md:top-24" : "mb-6"}>
      <Alert className={`border pr-12 ${A1_TONE[decision.status]}`}>
        {decision.status === "compatible" ? <CheckCircle2 className="size-4" /> : <AlertTriangle className="size-4" />}
        {sticky ? (
          <button
            type="button"
            onClick={onDismiss}
            className="absolute right-3 top-3 rounded-full border border-current/20 p-1 opacity-70 transition hover:opacity-100"
            title="Desfixar aviso"
            aria-label="Desfixar aviso"
          >
            <X className="size-3.5" />
          </button>
        ) : null}
        <AlertTitle>{decision.headline}</AlertTitle>
        <AlertDescription>
          {decision.detail}
          {decision.missingFields.length > 0 ? ` Campos a verificar: ${decision.missingFields.map(getA1FieldLabel).join(", ")}.` : ""}
          {decision.status === "incompatible" ? " Você pode continuar a coleta, mas este trecho não será compatibilizado no IDECICLO." : ""}
        </AlertDescription>
      </Alert>
    </div>
  );
}

function HeaderField({
  label,
  value,
  name,
  type = "text",
  readOnly = false,
  onChange,
}: {
  label: string;
  value: string | number;
  name: keyof IdecicloFormData;
  type?: string;
  readOnly?: boolean;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div>
      <label htmlFor={`header-${name}`} className="mb-1 block text-sm font-medium text-foreground">
        {label}
      </label>
      <input
        id={`header-${name}`}
        className={`flex h-10 w-full rounded-md border border-input px-3 py-2 text-sm ${readOnly ? "bg-gray-100 text-muted-foreground" : "bg-background"}`}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        readOnly={readOnly}
        disabled={readOnly}
      />
    </div>
  );
}

export function EvaluationHeaderCard({
  data,
  onChange,
}: {
  data: IdecicloFormData;
  onChange: (partial: Partial<IdecicloFormData>) => void;
}) {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Cabeçalho da Avaliação</CardTitle>
        <CardDescription>Identificação do trecho e dados gerais antes dos blocos do formulário em papel.</CardDescription>
      </CardHeader>
      <div className="grid grid-cols-1 gap-4 px-6 pb-6 md:grid-cols-2 lg:grid-cols-3">
        {/* TODO(auth): the researcher is the signed-in user, read-only, once auth is ported. */}
        <HeaderField label="Pesquisador(a):" name="researcher" value={data.researcher} onChange={(event) => onChange({ researcher: event.target.value })} />
        <HeaderField label="Data:" name="date" type="date" value={data.date} onChange={(event) => onChange({ date: event.target.value })} />
        <HeaderField label="Cidade:" name="city" value={data.city} readOnly />
        <HeaderField label="ID:" name="id" value={data.id} readOnly />
        <HeaderField label="Nome Trecho:" name="segment_name" value={data.segment_name} readOnly />
        <HeaderField label="Extensão (m):" name="extension_m" type="number" value={data.extension_m || ""} readOnly />
        <HeaderField label="Início do trecho:" name="start_point" value={data.start_point} onChange={(event) => onChange({ start_point: event.target.value })} />
        <HeaderField label="Fim do trecho:" name="end_point" value={data.end_point} onChange={(event) => onChange({ end_point: event.target.value })} />
      </div>
    </Card>
  );
}

export function SaveStatusSummary({ incompleteCount, pinnedCount, isOnline }: { incompleteCount: number; pinnedCount: number; isOnline: boolean }) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
      <Badge variant={incompleteCount > 0 ? "secondary" : "outline"}>
        {incompleteCount} critério{incompleteCount === 1 ? "" : "s"} pendente{incompleteCount === 1 ? "" : "s"}
      </Badge>
      <Badge variant={pinnedCount > 0 ? "secondary" : "outline"}>
        {pinnedCount} fixado{pinnedCount === 1 ? "" : "s"}
      </Badge>
      <span>
        {incompleteCount > 0
          ? `O ${isOnline ? "envio da avaliação" : "salvamento do rascunho"} pode ficar incompleto.`
          : `Pronto para ${isOnline ? "enviar a avaliação" : "guardar o rascunho"}.`}
      </span>
    </div>
  );
}

export function AxisRibbon({ tone, title }: { tone: "a" | "b" | "c" | "d" | "e"; title: string }) {
  return (
    <div className={`ideciclo-axis-ribbon ideciclo-axis-ribbon-${tone}`}>
      <h3 className="text-xl font-bold tracking-tight text-black md:text-2xl">{title}</h3>
    </div>
  );
}
