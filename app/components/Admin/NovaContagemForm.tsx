import { Link, useRouter } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { ArrowLeft, Save, Info, Loader2, Upload, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";

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
import { MovementHourlyTable } from "~/components/Admin/topology/MovementHourlyTable";
import { CharacteristicsHourlyTable } from "~/components/Admin/topology/CharacteristicsHourlyTable";
import { TOPOLOGY_DIRECTIONS, type Topology } from "~/components/Admin/topology/types";
import { cn } from "~/lib/utils";
import { createContagem } from "~/admin/contagens/server/createContagem";
import {
  NovaFormSchema,
  CHARACTERISTIC_KEYS,
  CHARACTERISTIC_GROUPS,
  characteristicsInGroup,
  deriveBucketCount,
  emptyBucketArray,
  resizeBucketArray,
  sumStringArray,
  timeToMinutes,
  BUCKET_MINUTES_OPTIONS,
  type BucketMinutes,
  type CharacteristicKey,
  type NovaFormValues,
} from "~/admin/contagens/schema/nova-form";
import { CHARACTERISTICS } from "~/admin/contagens/schema/contagem-data";

/* ---------- defaults --------------------------------------------------- */

function emptyMovementBuckets(approachCount: number): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (let i = 0; i < approachCount; i++) {
    for (let j = 0; j < approachCount; j++) {
      if (i !== j) out[`${i}-${j}`] = [];
    }
  }
  return out;
}

function defaultValues(): NovaFormValues {
  const topology: Topology = "crossroad";
  const approachCount = TOPOLOGY_DIRECTIONS[topology].length;
  return {
    locationMode: "existing",
    existingLocationId: null,
    locationName: "",
    topology,
    approaches: Array.from({ length: approachCount }, () => ""),
    movements: emptyMovementBuckets(approachCount),
    date: "",
    startTime: "",
    endTime: "",
    bucketMinutes: "60",
    maxHourCyclists: "",
    weatherConditions: "",
    notes: "",
    characteristics: Object.fromEntries(
      CHARACTERISTIC_KEYS.map((k) => [k, [] as string[]]),
    ) as Record<CharacteristicKey, string[]>,
    outros: [],
  };
}

/* ---------- helpers ---------------------------------------------------- */

function toIntArray(arr: string[]): number[] {
  return arr.map((s) => {
    const n = Number(s);
    return Number.isFinite(n) ? Math.max(0, Math.trunc(n)) : 0;
  });
}

function bucketsToTotals(map: Record<string, string[]>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, arr] of Object.entries(map)) {
    const t = sumStringArray(arr);
    out[k] = t > 0 ? String(t) : "";
  }
  return out;
}

function approachVolumeFromBuckets(
  fromIdx: number,
  approachCount: number,
  movements: Record<string, string[]>,
): number {
  let total = 0;
  for (let to = 0; to < approachCount; to++) {
    if (to === fromIdx) continue;
    total += sumStringArray(movements[`${fromIdx}-${to}`]);
  }
  return total;
}

function totalCyclistsFromBuckets(movements: Record<string, string[]>): number {
  let t = 0;
  for (const arr of Object.values(movements)) t += sumStringArray(arr);
  return t;
}

/* ---------- component -------------------------------------------------- */

export function NovaContagemForm({ locations }: { locations: LocationOption[] }) {
  const router = useRouter();

  // UI-only state — view modes for the matrix and characteristics cards.
  const [movementsView, setMovementsView] = useState<"totals" | "hourly">("totals");
  const [characteristicsView, setCharacteristicsView] = useState<"totals" | "hourly">("totals");

  const form = useForm({
    defaultValues: defaultValues(),
    validators: { onSubmit: NovaFormSchema },
    onSubmit: async ({ value }) => {
      const startedAt = `${value.date}T${value.startTime}:00`;
      const bucketMin = Number(value.bucketMinutes);
      const bucketCount = deriveBucketCount(value.startTime, value.endTime, value.bucketMinutes);

      const movementsArrays: Record<string, number[]> = Object.fromEntries(
        Object.entries(value.movements).map(([k, arr]) => [
          k,
          toIntArray(resizeBucketArray(arr, bucketCount)),
        ]),
      );
      const characteristicsArrays: Record<string, number[]> = Object.fromEntries(
        Object.entries(value.characteristics)
          .map(([k, arr]) => [k, toIntArray(resizeBucketArray(arr, bucketCount))] as const)
          .filter(([, a]) => a.some((v) => v > 0)),
      );

      try {
        const result = await createContagem({
          data: {
            localName: value.locationName,
            startedAt,
            timezone: "America/Recife",
            bucketMinutes: bucketMin,
            bucketCount,
            latitude: null,
            longitude: null,
            topology: value.topology,
            notes: value.notes || null,
            data: {
              approaches: value.approaches,
              movements: movementsArrays,
              characteristics: characteristicsArrays,
              outros: value.outros
                .filter((o) => o.label.trim() && sumStringArray(o.counts) > 0)
                .map((o) => ({
                  label: o.label.trim(),
                  buckets: toIntArray(resizeBucketArray(o.counts, bucketCount)),
                })),
              bucketNotes: value.weatherConditions
                ? [{ fromBucket: 0, toBucket: 0, note: value.weatherConditions }]
                : [],
            },
          },
        });
        toast.success("Contagem registrada", {
          description: `ID ${result.id} · ${result.totals.cyclists.toLocaleString("pt-BR")} ciclistas`,
        });
        router.navigate({ to: "/admin/contagens" });
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erro ao salvar contagem.";
        toast.error("Não foi possível salvar.", { description: message });
      }
    },
  });

  /* ----- mode + topology change handlers ------------------------------- */

  function onModeChange(mode: NovaFormValues["locationMode"]) {
    form.setFieldValue("locationMode", mode);
    form.setFieldValue("existingLocationId", null);
    form.setFieldValue("locationName", "");
  }

  function onExistingSelect(id: number | string | null) {
    const picked = locations.find((l) => String(l.id) === String(id));
    form.setFieldValue("existingLocationId", id);
    form.setFieldValue("locationName", picked?.name ?? "");
  }

  function onTopologyChange(t: Topology) {
    const target = TOPOLOGY_DIRECTIONS[t].length;
    const current = form.getFieldValue("approaches") ?? [];
    const next = Array.from({ length: target }, (_, i) => current[i] ?? "");
    form.setFieldValue("topology", t);
    form.setFieldValue("approaches", next);
    // Movement keys reference approach indices, so they're invalidated.
    form.setFieldValue("movements", emptyMovementBuckets(target));
  }

  function onApproachChange(idx: number, value: string) {
    const next = [...(form.getFieldValue("approaches") ?? [])];
    next[idx] = value;
    form.setFieldValue("approaches", next);
  }

  /* ----- per-bucket vs totals writers ---------------------------------- */

  function getCurrentBucketCount(): number {
    return deriveBucketCount(
      form.getFieldValue("startTime"),
      form.getFieldValue("endTime"),
      form.getFieldValue("bucketMinutes"),
    );
  }

  function setMovementTotal(key: string, totalStr: string) {
    const bc = Math.max(getCurrentBucketCount(), 1);
    const arr = emptyBucketArray(bc);
    arr[0] = totalStr;
    const map = { ...(form.getFieldValue("movements") ?? {}) };
    map[key] = arr;
    form.setFieldValue("movements", map);
  }

  function setMovementBucket(key: string, b: number, value: string) {
    const map = { ...(form.getFieldValue("movements") ?? {}) };
    const bc = Math.max(getCurrentBucketCount(), b + 1);
    const next = resizeBucketArray(map[key], bc);
    next[b] = value;
    map[key] = next;
    form.setFieldValue("movements", map);
  }

  function setCharTotal(key: string, totalStr: string) {
    const bc = Math.max(getCurrentBucketCount(), 1);
    const arr = emptyBucketArray(bc);
    arr[0] = totalStr;
    const map = { ...(form.getFieldValue("characteristics") ?? {}) };
    map[key] = arr;
    form.setFieldValue("characteristics", map);
  }

  function setCharBucket(key: string, b: number, value: string) {
    const map = { ...(form.getFieldValue("characteristics") ?? {}) };
    const bc = Math.max(getCurrentBucketCount(), b + 1);
    const next = resizeBucketArray(map[key], bc);
    next[b] = value;
    map[key] = next;
    form.setFieldValue("characteristics", map);
  }

  function bucketLabel(b: number): string {
    const start = timeToMinutes(form.getFieldValue("startTime") || "06:00");
    const width = Number(form.getFieldValue("bucketMinutes")) || 60;
    const m = start + b * width;
    const h = Math.floor(m / 60).toString().padStart(2, "0");
    const mm = (m % 60).toString().padStart(2, "0");
    return `${h}:${mm}`;
  }

  /* ----- xlsx import --------------------------------------------------- */

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  async function handleImportFile(file: File) {
    const buffer = await file.arrayBuffer();
    try {
      const { parseContagemXlsx } = await import("~/admin/contagens/parser/xlsx-import");
      const { values, warnings } = parseContagemXlsx(buffer);
      const merged = { ...defaultValues(), ...values } as NovaFormValues;
      // form.reset(...) updates state but doesn't always rebroadcast to every
      // Subscribe in our setup; setting each field explicitly is bulletproof.
      (Object.keys(merged) as Array<keyof NovaFormValues>).forEach((key) => {
        form.setFieldValue(key, merged[key] as never);
      });
      // Auto-show hourly view when import brings per-bucket data.
      const movsAreHourly = Object.values(values.movements ?? {}).some(
        (arr) => Array.isArray(arr) && arr.length > 1,
      );
      if (movsAreHourly) {
        setMovementsView("hourly");
        setCharacteristicsView("hourly");
      }
      if (warnings.length > 0) {
        toast.warning("Importado com observações", { description: warnings.join(" · ") });
      } else {
        toast.success("Planilha importada", { description: "Revise os campos antes de salvar." });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao ler a planilha.";
      toast.error("Falha ao importar planilha", { description: message });
    }
  }

  /* ----- render -------------------------------------------------------- */

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
      className="space-y-6 max-w-5xl"
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleImportFile(file);
          e.target.value = "";
        }}
      />
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border bg-muted/30 px-4 py-3">
        <div className="text-sm">
          <p className="font-medium">Importar de planilha</p>
          <p className="text-muted-foreground text-xs">
            Carregue um arquivo .xlsx no template Ameciclo para preencher
            automaticamente o formulário. Você pode revisar antes de salvar.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="size-4" />
          Selecionar arquivo
        </Button>
      </div>

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
          <form.Subscribe selector={(s) => s.values.locationMode}>
            {(locationMode) => (
              <div role="tablist" className="inline-flex rounded-md border bg-muted/40 p-1 text-sm">
                {(["existing", "new"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    role="tab"
                    aria-selected={locationMode === m}
                    onClick={() => onModeChange(m)}
                    className={cn(
                      "px-3 py-1.5 rounded-sm transition-colors",
                      locationMode === m
                        ? "bg-background text-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {m === "existing" ? "Selecionar existente" : "Novo ponto"}
                  </button>
                ))}
              </div>
            )}
          </form.Subscribe>

          <form.Subscribe selector={(s) => s.values.locationMode}>
            {(locationMode) =>
              locationMode === "existing" ? (
                <form.Field
                  name="existingLocationId"
                  validators={{
                    onChange: z
                      .union([z.number(), z.string(), z.null()])
                      .refine((v) => v !== null, "Selecione um ponto da lista."),
                  }}
                >
                  {(field) => (
                    <Field
                      label="Ponto de contagem"
                      htmlFor="existing-location"
                      required
                      error={fieldError(field)}
                    >
                      <LocationCombobox
                        options={locations}
                        value={field.state.value}
                        onChange={onExistingSelect}
                      />
                    </Field>
                  )}
                </form.Field>
              ) : (
                <form.Field
                  name="locationName"
                  validators={{ onBlur: z.string().trim().min(1, "Informe o nome do local.") }}
                >
                  {(field) => (
                    <Field
                      label="Nome do ponto"
                      htmlFor="location-name"
                      required
                      error={fieldError(field)}
                      hint="Ex: 'Av. Caxangá com Rua Cosme Viana'"
                    >
                      <Input
                        id="location-name"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="Cruzamento da Av. Caxangá com..."
                      />
                    </Field>
                  )}
                </form.Field>
              )
            }
          </form.Subscribe>

          <form.Subscribe selector={(s) => [s.values.locationMode, s.values.locationName] as const}>
            {([locationMode, locationName]) =>
              locationMode === "existing" && locationName ? (
                <div className="rounded-md bg-muted/40 px-3 py-2 text-sm">
                  <span className="text-muted-foreground">Selecionado: </span>
                  <span className="font-medium">{locationName}</span>
                </div>
              ) : null
            }
          </form.Subscribe>

          <div>
            <Label className="text-sm">Topologia</Label>
            <p className="mt-1 mb-3 text-xs text-muted-foreground">
              Define quantas aproximações o ponto possui e os movimentos possíveis.
            </p>
            <form.Subscribe selector={(s) => s.values.topology}>
              {(topology) => <TopologyPicker value={topology} onChange={onTopologyChange} />}
            </form.Subscribe>
          </div>

          <form.Subscribe
            selector={(s) =>
              [s.values.topology, s.values.approaches, s.values.movements] as const
            }
          >
            {([topology, approaches, movements]) => (
              <TopologyDiagram
                topology={topology}
                approaches={approaches}
                movements={bucketsToTotals(movements)}
                onApproachChange={onApproachChange}
                onMovementChange={setMovementTotal}
              />
            )}
          </form.Subscribe>
        </CardContent>
      </Card>

      {/* Sessão */}
      <Card>
        <CardHeader>
          <CardTitle>Sessão de contagem</CardTitle>
          <CardDescription>
            Quando a contagem foi feita e em que granularidade os dados são
            registrados.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-4">
          <form.Field
            name="date"
            validators={{ onBlur: z.string().min(1, "Informe a data.") }}
          >
            {(field) => (
              <Field label="Data" htmlFor="date" required error={fieldError(field)}>
                <Input
                  id="date"
                  type="date"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </Field>
            )}
          </form.Field>
          <form.Field
            name="startTime"
            validators={{ onBlur: z.string().min(1, "Informe o início.") }}
          >
            {(field) => (
              <Field label="Início" htmlFor="start_time" required error={fieldError(field)}>
                <Input
                  id="start_time"
                  type="time"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </Field>
            )}
          </form.Field>
          <form.Field
            name="endTime"
            validators={{ onBlur: z.string().min(1, "Informe o término.") }}
          >
            {(field) => (
              <Field label="Término" htmlFor="end_time" required error={fieldError(field)}>
                <Input
                  id="end_time"
                  type="time"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </Field>
            )}
          </form.Field>
          <form.Field name="bucketMinutes">
            {(field) => (
              <Field label="Granularidade" htmlFor="bucket_minutes" hint="Largura de cada bucket.">
                <select
                  id="bucket_minutes"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value as BucketMinutes)}
                  className="flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                >
                  {BUCKET_MINUTES_OPTIONS.map((m) => (
                    <option key={m} value={m}>
                      {m === "60" ? "1 hora" : m === "120" ? "2 horas" : `${m} min`}
                    </option>
                  ))}
                </select>
              </Field>
            )}
          </form.Field>
        </CardContent>
      </Card>

      {/* Resultados */}
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-3">
          <div>
            <CardTitle>Resultados</CardTitle>
            <CardDescription>
              Edite movimentos clicando nas setas do diagrama ou — para fidelidade
              hora a hora — alterne para "Por hora".
            </CardDescription>
          </div>
          <ViewToggle value={movementsView} onChange={setMovementsView} />
        </CardHeader>
        <CardContent className="space-y-5">
          <form.Subscribe
            selector={(s) =>
              [
                s.values.movements,
                s.values.startTime,
                s.values.endTime,
                s.values.bucketMinutes,
              ] as const
            }
          >
            {([movements, startTime, endTime, bucketMinutes]) => {
              const total = totalCyclistsFromBuckets(movements);
              const bc = deriveBucketCount(startTime, endTime, bucketMinutes);
              return (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-md border bg-muted/40 px-4 py-3 flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total de ciclistas</span>
                    <Badge className="text-base font-semibold tabular-nums" variant="secondary">
                      {total.toLocaleString("pt-BR")}
                    </Badge>
                  </div>
                  <div className="rounded-md border bg-muted/40 px-4 py-3 flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Buckets</span>
                    <Badge className="tabular-nums" variant="secondary">
                      {bc > 0 ? `${bc} × ${bucketMinutes}min` : "—"}
                    </Badge>
                  </div>
                </div>
              );
            }}
          </form.Subscribe>

          {movementsView === "totals" ? (
            <details className="rounded-md border bg-background group" open>
              <summary className="cursor-pointer px-4 py-2.5 text-sm font-medium text-foreground select-none flex items-center justify-between">
                <span>Matriz de totais</span>
                <span className="text-xs text-muted-foreground group-open:hidden">expandir</span>
                <span className="text-xs text-muted-foreground hidden group-open:inline">recolher</span>
              </summary>
              <div className="px-4 pb-4 pt-2">
                <form.Subscribe
                  selector={(s) => [s.values.approaches, s.values.movements] as const}
                >
                  {([approaches, movements]) => (
                    <MovementMatrix
                      approaches={approaches}
                      movements={bucketsToTotals(movements)}
                      onChange={setMovementTotal}
                    />
                  )}
                </form.Subscribe>
              </div>
            </details>
          ) : (
            <form.Subscribe
              selector={(s) =>
                [
                  s.values.topology,
                  s.values.approaches,
                  s.values.movements,
                  s.values.startTime,
                  s.values.endTime,
                  s.values.bucketMinutes,
                ] as const
              }
            >
              {([topology, approaches, movements, startTime, endTime, bucketMinutes]) => {
                const bc = deriveBucketCount(startTime, endTime, bucketMinutes);
                return (
                  <MovementHourlyTable
                    topology={topology}
                    approaches={approaches}
                    movements={movements}
                    bucketCount={bc}
                    bucketMinutes={Number(bucketMinutes)}
                    bucketLabel={bucketLabel}
                    onBucketChange={setMovementBucket}
                  />
                );
              }}
            </form.Subscribe>
          )}

          <form.Field
            name="maxHourCyclists"
          >
            {(field) => (
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
                  className="max-w-xs"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </Field>
            )}
          </form.Field>
        </CardContent>
      </Card>

      {/* Características */}
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-3">
          <div>
            <CardTitle>Características</CardTitle>
            <CardDescription className="flex items-start gap-2">
              <Info className="size-4 shrink-0 mt-0.5" />
              <span>
                Cada característica é a contagem de ciclistas observados naquele
                perfil/comportamento. Não precisam somar exatamente o total — uma
                mesma pessoa pode entrar em várias categorias.
              </span>
            </CardDescription>
          </div>
          <ViewToggle value={characteristicsView} onChange={setCharacteristicsView} />
        </CardHeader>
        <CardContent className="space-y-6">
          {characteristicsView === "totals" ? (
            CHARACTERISTIC_GROUPS.map(({ group, label, rolledUpAs }) => {
              const keys = characteristicsInGroup(group);
              if (keys.length === 0) return null;
              return (
                <div key={group} className="space-y-3">
                  <div className="flex items-baseline justify-between">
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {label}
                    </h3>
                    {rolledUpAs && (
                      <form.Subscribe selector={(s) => s.values.characteristics}>
                        {(characteristics) => {
                          const sum = keys.reduce(
                            (acc, k) => acc + sumStringArray(characteristics[k]),
                            0,
                          );
                          return (
                            <span className="text-xs text-muted-foreground">
                              {rolledUpAs}{": "}
                              <Badge variant="secondary" className="tabular-nums">
                                {sum.toLocaleString("pt-BR")}
                              </Badge>
                            </span>
                          );
                        }}
                      </form.Subscribe>
                    )}
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                    {keys.map((k) => (
                      <form.Subscribe
                        key={k}
                        selector={(s) => s.values.characteristics[k]}
                      >
                        {(arr) => (
                          <Field label={CHARACTERISTICS[k as keyof typeof CHARACTERISTICS].label} htmlFor={`char-${k}`}>
                            <Input
                              id={`char-${k}`}
                              type="number"
                              inputMode="numeric"
                              min={0}
                              step={1}
                              placeholder="0"
                              value={sumStringArray(arr) > 0 ? String(sumStringArray(arr)) : ""}
                              onChange={(e) => setCharTotal(k, e.target.value)}
                            />
                          </Field>
                        )}
                      </form.Subscribe>
                    ))}
                  </div>
                </div>
              );
            })
          ) : (
            <form.Subscribe
              selector={(s) =>
                [
                  s.values.characteristics,
                  s.values.startTime,
                  s.values.endTime,
                  s.values.bucketMinutes,
                ] as const
              }
            >
              {([characteristics, startTime, endTime, bucketMinutes]) => {
                const bc = deriveBucketCount(startTime, endTime, bucketMinutes);
                return (
                  <CharacteristicsHourlyTable
                    keys={CHARACTERISTIC_KEYS}
                    characteristics={characteristics}
                    bucketCount={bc}
                    bucketLabel={bucketLabel}
                    onBucketChange={setCharBucket}
                  />
                );
              }}
            </form.Subscribe>
          )}
        </CardContent>
      </Card>

      {/* Outros */}
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-3">
          <div>
            <CardTitle>Outros</CardTitle>
            <CardDescription>
              Observações pontuais que não estão na taxonomia padrão (ex: "corte
              de caminho pela calçada do posto").
            </CardDescription>
          </div>
          <form.Field name="outros" mode="array">
            {(field) => (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => field.pushValue({ label: "", counts: [] })}
              >
                <Plus className="size-4" />
                Adicionar
              </Button>
            )}
          </form.Field>
        </CardHeader>
        <CardContent>
          <form.Field name="outros" mode="array">
            {(field) =>
              field.state.value.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Nenhuma observação adicional. Use o botão acima para registrar uma.
                </p>
              ) : (
                <div className="space-y-3">
                  {field.state.value.map((row, i) => (
                    <div
                      key={i}
                      className="grid grid-cols-[1fr_120px_auto] gap-2 items-end"
                    >
                      <form.Field name={`outros[${i}].label` as const}>
                        {(sub) => (
                          <Field
                            label={i === 0 ? "Descrição" : undefined}
                            htmlFor={`outro-label-${i}`}
                            error={fieldError(sub)}
                          >
                            <Input
                              id={`outro-label-${i}`}
                              value={sub.state.value}
                              onBlur={sub.handleBlur}
                              onChange={(e) => sub.handleChange(e.target.value)}
                              placeholder="Corte de caminho pela calçada do posto"
                            />
                          </Field>
                        )}
                      </form.Field>
                      <Field
                        label={i === 0 ? "Contagem" : undefined}
                        htmlFor={`outro-count-${i}`}
                      >
                        <Input
                          id={`outro-count-${i}`}
                          type="number"
                          inputMode="numeric"
                          min={0}
                          step={1}
                          value={sumStringArray(row.counts) > 0 ? String(sumStringArray(row.counts)) : ""}
                          onChange={(e) => {
                            const bc = Math.max(getCurrentBucketCount(), 1);
                            const arr = emptyBucketArray(bc);
                            arr[0] = e.target.value;
                            const all = form.getFieldValue("outros") ?? [];
                            const next = [...all];
                            next[i] = { ...next[i], counts: arr };
                            form.setFieldValue("outros", next);
                          }}
                        />
                      </Field>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="self-end mb-px"
                        onClick={() => field.removeValue(i)}
                        aria-label="Remover linha"
                      >
                        <Trash2 className="size-4 text-muted-foreground" />
                      </Button>
                    </div>
                  ))}
                </div>
              )
            }
          </form.Field>
        </CardContent>
      </Card>

      {/* Observações */}
      <Card>
        <CardHeader>
          <CardTitle>Observações</CardTitle>
          <CardDescription>Contexto opcional sobre a contagem.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <form.Field name="weatherConditions">
            {(field) => (
              <Field
                label="Condição climática"
                htmlFor="weather_conditions"
                hint="Ex: ensolarado, garoa, vento forte..."
              >
                <Input
                  id="weather_conditions"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Ensolarado, ~28 °C"
                />
              </Field>
            )}
          </form.Field>
          <form.Field name="notes">
            {(field) => (
              <Field label="Notas" htmlFor="notes" hint="Eventos, obras, particularidades...">
                <Textarea
                  id="notes"
                  rows={3}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Obra na via lateral durante a contagem..."
                />
              </Field>
            )}
          </form.Field>
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
              form.reset(defaultValues());
              setMovementsView("totals");
              setCharacteristicsView("totals");
            }}
          >
            Limpar
          </Button>
          <form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting] as const}>
            {([canSubmit, isSubmitting]) => (
              <Button type="submit" disabled={!canSubmit || isSubmitting}>
                {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                {isSubmitting ? "Salvando..." : "Salvar contagem"}
              </Button>
            )}
          </form.Subscribe>
        </div>
      </div>
    </form>
  );
}

/* ---------- bits ------------------------------------------------------- */

function ViewToggle({
  value,
  onChange,
}: {
  value: "totals" | "hourly";
  onChange: (v: "totals" | "hourly") => void;
}) {
  return (
    <div role="tablist" className="inline-flex rounded-md border bg-muted/40 p-1 text-xs shrink-0">
      {(["totals", "hourly"] as const).map((m) => (
        <button
          key={m}
          type="button"
          role="tab"
          aria-selected={value === m}
          onClick={() => onChange(m)}
          className={cn(
            "px-2.5 py-1 rounded-sm transition-colors",
            value === m
              ? "bg-background text-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {m === "totals" ? "Totais" : "Por hora"}
        </button>
      ))}
    </div>
  );
}

function fieldError(field: { state: { meta: { errors: unknown[] } } }): string | undefined {
  const errs = field.state.meta.errors;
  if (!errs || errs.length === 0) return undefined;
  const first = errs[0];
  if (!first) return undefined;
  if (typeof first === "string") return first;
  if (typeof first === "object" && first && "message" in first) {
    return String((first as { message?: unknown }).message ?? "");
  }
  return undefined;
}

function Field({
  label,
  htmlFor,
  required,
  error,
  hint,
  children,
}: {
  label?: string;
  htmlFor: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  const describedBy =
    [hint && `${htmlFor}-hint`, error && `${htmlFor}-error`].filter(Boolean).join(" ") ||
    undefined;

  return (
    <div className="space-y-1.5">
      {label && (
        <Label htmlFor={htmlFor} className="text-sm">
          {label}
          {required && (
            <span className="text-destructive ml-0.5" aria-hidden>
              *
            </span>
          )}
        </Label>
      )}
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
