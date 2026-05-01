import { useState, useMemo, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Save, Info } from "lucide-react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Badge } from "~/components/ui/badge";
import {
  LocationCombobox,
  type LocationOption,
} from "~/components/Admin/LocationCombobox";
import { TopologyPicker } from "~/components/Admin/topology/TopologyPicker";
import { TopologyDiagram } from "~/components/Admin/topology/TopologyDiagram";
import { MovementMatrix } from "~/components/Admin/topology/MovementMatrix";
import {
  TOPOLOGY_DIRECTIONS,
  emptyMovements,
  totalCyclists,
  type Movements,
  type Topology,
} from "~/components/Admin/topology/types";
import { cn } from "~/lib/utils";

type Characteristics = {
  women: string;
  juveniles: string;
  ride: string;
  helmet: string;
  service: string;
  cargo: string;
  shared_bike: string;
  sidewalk: string;
  wrong_way: string;
  motor: string;
  rain: string;
  other_active_modes: string;
  other_behaviors: string;
  others: string;
};

const CHARACTERISTICS_FIELDS: Array<{
  key: keyof Characteristics;
  label: string;
  group: "perfil" | "comportamento" | "modal" | "ambiente";
}> = [
  { key: "women", label: "Mulheres", group: "perfil" },
  { key: "juveniles", label: "Crianças e adolescentes", group: "perfil" },
  { key: "ride", label: "Carona", group: "perfil" },
  { key: "helmet", label: "Capacete", group: "comportamento" },
  { key: "wrong_way", label: "Contramão", group: "comportamento" },
  { key: "sidewalk", label: "Calçada", group: "comportamento" },
  { key: "service", label: "Serviço", group: "modal" },
  { key: "cargo", label: "Cargueira", group: "modal" },
  { key: "shared_bike", label: "Compartilhada", group: "modal" },
  { key: "motor", label: "Motor / elétrica", group: "modal" },
  { key: "other_active_modes", label: "Outros modos ativos", group: "modal" },
  { key: "rain", label: "Sob chuva", group: "ambiente" },
  { key: "other_behaviors", label: "Outros comportamentos", group: "comportamento" },
  { key: "others", label: "Outros", group: "ambiente" },
];

const GROUP_LABELS: Record<string, string> = {
  perfil: "Perfil",
  comportamento: "Comportamento",
  modal: "Tipo de bicicleta",
  ambiente: "Ambiente / outros",
};

type LocationMode = "existing" | "new";

type FormState = {
  locationMode: LocationMode;
  existingLocationId: number | string | null;
  locationName: string;
  topology: Topology;
  approaches: string[];
  movements: Movements;
  date: string;
  start_time: string;
  end_time: string;
  max_hour_cyclists: string;
  weather_conditions: string;
  notes: string;
  characteristics: Characteristics;
};

const EMPTY_CHARACTERISTICS: Characteristics = {
  women: "",
  juveniles: "",
  ride: "",
  helmet: "",
  service: "",
  cargo: "",
  shared_bike: "",
  sidewalk: "",
  wrong_way: "",
  motor: "",
  rain: "",
  other_active_modes: "",
  other_behaviors: "",
  others: "",
};

function initialState(): FormState {
  const topology: Topology = "crossroad";
  const approachCount = TOPOLOGY_DIRECTIONS[topology].length;
  return {
    locationMode: "existing",
    existingLocationId: null,
    locationName: "",
    topology,
    approaches: Array.from({ length: approachCount }, () => ""),
    movements: emptyMovements(approachCount),
    date: "",
    start_time: "",
    end_time: "",
    max_hour_cyclists: "",
    weather_conditions: "",
    notes: "",
    characteristics: EMPTY_CHARACTERISTICS,
  };
}

function toIntOrZero(s: string): number {
  const n = Number(s);
  return Number.isFinite(n) ? Math.max(0, Math.trunc(n)) : 0;
}

export function NovaContagemForm({ locations }: { locations: LocationOption[] }) {
  const [form, setForm] = useState<FormState>(initialState);
  const [submitted, setSubmitted] = useState(false);

  // Keep approaches/movements arrays in sync when topology changes.
  useEffect(() => {
    const target = TOPOLOGY_DIRECTIONS[form.topology].length;
    if (form.approaches.length === target) return;
    setForm((s) => {
      const approaches = Array.from(
        { length: target },
        (_, i) => s.approaches[i] ?? "",
      );
      return { ...s, approaches, movements: emptyMovements(target) };
    });
  }, [form.topology, form.approaches.length]);

  const total = totalCyclists(form.movements);
  const charsSum = useMemo(
    () =>
      (Object.keys(form.characteristics) as Array<keyof Characteristics>).reduce(
        (acc, k) => acc + toIntOrZero(form.characteristics[k]),
        0,
      ),
    [form.characteristics],
  );

  const errors = useMemo(() => {
    const e: Partial<Record<string, string>> = {};
    if (!form.locationName.trim()) e.locationName = "Informe um nome para o ponto.";
    if (form.locationMode === "existing" && form.existingLocationId == null) {
      e.existingLocationId = "Selecione um ponto da lista.";
    }
    if (!form.date) e.date = "Informe a data.";
    if (!form.start_time) e.start_time = "Informe o horário de início.";
    if (!form.end_time) e.end_time = "Informe o horário de término.";
    if (form.start_time && form.end_time && form.end_time <= form.start_time) {
      e.end_time = "Deve ser depois do início.";
    }
    if (total === 0) e.movements = "A matriz precisa ter ao menos um movimento contado.";
    return e;
  }, [form, total]);

  const hasErrors = Object.keys(errors).length > 0;

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((s) => ({ ...s, [key]: value }));
  }

  function setApproach(i: number, value: string) {
    setForm((s) => {
      const approaches = [...s.approaches];
      approaches[i] = value;
      return { ...s, approaches };
    });
  }

  function setMovement(key: string, value: string) {
    setForm((s) => ({ ...s, movements: { ...s.movements, [key]: value } }));
  }

  function setChar(key: keyof Characteristics, value: string) {
    setForm((s) => ({
      ...s,
      characteristics: { ...s.characteristics, [key]: value },
    }));
  }

  function changeMode(mode: LocationMode) {
    setForm((s) => ({
      ...s,
      locationMode: mode,
      // Reset cross-mode fields so they don't leak between flows.
      existingLocationId: null,
      locationName: "",
    }));
  }

  function selectExisting(id: number | string | null) {
    const picked = locations.find((l) => String(l.id) === String(id));
    setForm((s) => ({
      ...s,
      existingLocationId: id,
      locationName: picked?.name ?? "",
    }));
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitted(true);
    if (hasErrors) {
      toast.error("Confira os campos destacados.");
      return;
    }

    const payload = {
      location: {
        mode: form.locationMode,
        existing_id: form.existingLocationId,
        name: form.locationName,
        topology: form.topology,
        approaches: form.approaches.map((a, i) => ({
          index: i,
          label: a,
          direction: TOPOLOGY_DIRECTIONS[form.topology][i],
        })),
      },
      session: {
        date: form.date,
        start_time: form.start_time,
        end_time: form.end_time,
      },
      results: {
        total_cyclists: total,
        max_hour_cyclists: toIntOrZero(form.max_hour_cyclists),
        movements: Object.fromEntries(
          Object.entries(form.movements).map(([k, v]) => [k, toIntOrZero(v)]),
        ),
      },
      characteristics: Object.fromEntries(
        (Object.keys(form.characteristics) as Array<keyof Characteristics>).map(
          (k) => [k, toIntOrZero(form.characteristics[k])],
        ),
      ),
      weather_conditions: form.weather_conditions || null,
      notes: form.notes || null,
    };

    console.info("[admin/contagens/nova] payload", payload);
    toast.success("Contagem pronta para envio", {
      description: "A camada de dados ainda não está conectada — payload no console.",
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      {/* Local */}
      <Card>
        <CardHeader>
          <CardTitle>Local</CardTitle>
          <CardDescription>
            Ponto onde a contagem foi realizada. Reaproveite um existente ou
            cadastre um novo.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div role="tablist" className="inline-flex rounded-md border bg-muted/40 p-1 text-sm">
            {(["existing", "new"] as const).map((m) => (
              <button
                key={m}
                type="button"
                role="tab"
                aria-selected={form.locationMode === m}
                onClick={() => changeMode(m)}
                className={cn(
                  "px-3 py-1.5 rounded-sm transition-colors",
                  form.locationMode === m
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {m === "existing" ? "Selecionar existente" : "Novo ponto"}
              </button>
            ))}
          </div>

          {form.locationMode === "existing" ? (
            <Field
              label="Ponto de contagem"
              htmlFor="existing-location"
              required
              error={submitted ? errors.existingLocationId : undefined}
            >
              <LocationCombobox
                options={locations}
                value={form.existingLocationId}
                onChange={selectExisting}
              />
            </Field>
          ) : (
            <Field
              label="Nome do ponto"
              htmlFor="location-name"
              required
              error={submitted ? errors.locationName : undefined}
              hint="Ex: 'Av. Caxangá com Rua Cosme Viana'"
            >
              <Input
                id="location-name"
                value={form.locationName}
                onChange={(e) => set("locationName", e.target.value)}
                placeholder="Cruzamento da Av. Caxangá com..."
                required
              />
            </Field>
          )}

          {form.locationMode === "existing" && form.locationName && (
            <div className="rounded-md bg-muted/40 px-3 py-2 text-sm">
              <span className="text-muted-foreground">Selecionado: </span>
              <span className="font-medium">{form.locationName}</span>
            </div>
          )}

          <div>
            <Label className="text-sm">Topologia</Label>
            <p className="mt-1 mb-3 text-xs text-muted-foreground">
              Define quantas aproximações o ponto possui e os movimentos possíveis.
            </p>
            <TopologyPicker
              value={form.topology}
              onChange={(t) => set("topology", t)}
            />
          </div>

          <TopologyDiagram
            topology={form.topology}
            approaches={form.approaches}
            movements={form.movements}
            onApproachChange={setApproach}
            onMovementChange={setMovement}
          />
        </CardContent>
      </Card>

      {/* Sessão */}
      <Card>
        <CardHeader>
          <CardTitle>Sessão de contagem</CardTitle>
          <CardDescription>Quando a contagem foi feita.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <Field label="Data" htmlFor="date" required error={submitted ? errors.date : undefined}>
            <Input
              id="date"
              type="date"
              value={form.date}
              onChange={(e) => set("date", e.target.value)}
              required
            />
          </Field>
          <Field
            label="Início"
            htmlFor="start_time"
            required
            error={submitted ? errors.start_time : undefined}
          >
            <Input
              id="start_time"
              type="time"
              value={form.start_time}
              onChange={(e) => set("start_time", e.target.value)}
              required
            />
          </Field>
          <Field
            label="Término"
            htmlFor="end_time"
            required
            error={submitted ? errors.end_time : undefined}
          >
            <Input
              id="end_time"
              type="time"
              value={form.end_time}
              onChange={(e) => set("end_time", e.target.value)}
              required
            />
          </Field>
        </CardContent>
      </Card>

      {/* Resultados */}
      <Card>
        <CardHeader>
          <CardTitle>Resultados</CardTitle>
          <CardDescription>
            Os movimentos são editados clicando nas setas do diagrama acima.
            Use a tabela quando precisar revisar todos os valores de uma vez.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-md border bg-muted/40 px-4 py-3 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total de ciclistas</span>
              <Badge className="text-base font-semibold tabular-nums" variant="secondary">
                {total.toLocaleString("pt-BR")}
              </Badge>
            </div>
            <Field
              label="Pico em 1 hora"
              htmlFor="max_hour_cyclists"
              hint="Maior contagem observada em uma janela de 60 min."
            >
              <Input
                id="max_hour_cyclists"
                type="number"
                inputMode="numeric"
                min={0}
                step={1}
                value={form.max_hour_cyclists}
                onChange={(e) => set("max_hour_cyclists", e.target.value)}
              />
            </Field>
          </div>

          {submitted && errors.movements && (
            <p className="text-xs text-destructive">{errors.movements}</p>
          )}

          <details className="rounded-md border bg-background group">
            <summary className="cursor-pointer px-4 py-2.5 text-sm font-medium text-foreground select-none flex items-center justify-between">
              <span>Ver matriz completa</span>
              <span className="text-xs text-muted-foreground group-open:hidden">expandir</span>
              <span className="text-xs text-muted-foreground hidden group-open:inline">recolher</span>
            </summary>
            <div className="px-4 pb-4 pt-2">
              <MovementMatrix
                approaches={form.approaches}
                movements={form.movements}
                onChange={setMovement}
              />
            </div>
          </details>
        </CardContent>
      </Card>

      {/* Características */}
      <Card>
        <CardHeader>
          <CardTitle>Características</CardTitle>
          <CardDescription className="flex items-start gap-2">
            <Info className="size-4 shrink-0 mt-0.5" />
            <span>
              Cada característica é a contagem de ciclistas observados naquele
              perfil/comportamento. Não precisam somar exatamente o total —
              uma mesma pessoa pode entrar em várias categorias.
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {(["perfil", "comportamento", "modal", "ambiente"] as const).map((group) => (
            <div key={group} className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {GROUP_LABELS[group]}
              </h3>
              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                {CHARACTERISTICS_FIELDS.filter((f) => f.group === group).map((f) => (
                  <Field key={f.key} label={f.label} htmlFor={`char-${f.key}`}>
                    <Input
                      id={`char-${f.key}`}
                      type="number"
                      inputMode="numeric"
                      min={0}
                      step={1}
                      placeholder="0"
                      value={form.characteristics[f.key]}
                      onChange={(e) => setChar(f.key, e.target.value)}
                    />
                  </Field>
                ))}
              </div>
            </div>
          ))}

          <div className="flex items-center justify-between rounded-md border bg-muted/40 px-4 py-3 text-sm">
            <span className="text-muted-foreground">Soma das características vs. total</span>
            <span className="flex items-center gap-2">
              <Badge variant="secondary" className="tabular-nums">
                {charsSum.toLocaleString("pt-BR")} / {total.toLocaleString("pt-BR")}
              </Badge>
              {total > 0 && charsSum > total && (
                <span className="text-xs text-amber-700">
                  Soma maior que o total — confira se é esperado.
                </span>
              )}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Observações */}
      <Card>
        <CardHeader>
          <CardTitle>Observações</CardTitle>
          <CardDescription>Contexto opcional sobre a contagem.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Condição climática"
            htmlFor="weather_conditions"
            hint="Ex: ensolarado, garoa, vento forte..."
          >
            <Input
              id="weather_conditions"
              value={form.weather_conditions}
              onChange={(e) => set("weather_conditions", e.target.value)}
              placeholder="Ensolarado, ~28 °C"
            />
          </Field>
          <Field label="Notas" htmlFor="notes" hint="Eventos, obras, particularidades...">
            <Textarea
              id="notes"
              rows={3}
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              placeholder="Obra na via lateral durante a contagem..."
            />
          </Field>
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <Button asChild type="button" variant="ghost">
          <Link to="/admin/contagens">
            <ArrowLeft className="size-4" />
            Voltar
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setForm(initialState());
              setSubmitted(false);
            }}
          >
            Limpar
          </Button>
          <Button type="submit">
            <Save className="size-4" />
            Salvar contagem
          </Button>
        </div>
      </div>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  required,
  error,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  const describedBy = [hint && `${htmlFor}-hint`, error && `${htmlFor}-error`]
    .filter(Boolean)
    .join(" ") || undefined;

  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor} className="text-sm">
        {label}
        {required && <span className="text-destructive ml-0.5" aria-hidden>*</span>}
      </Label>
      <div
        className={cn(
          error && "[&_input]:border-destructive [&_input]:focus-visible:ring-destructive/30",
        )}
        aria-describedby={describedBy}
      >
        {children}
      </div>
      {hint && !error && (
        <p id={`${htmlFor}-hint`} className="text-xs text-muted-foreground">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${htmlFor}-error`} className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
