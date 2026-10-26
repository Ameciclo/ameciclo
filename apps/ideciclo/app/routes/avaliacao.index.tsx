import { useMutation, useQuery, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Download, FileText, Loader2, MapPin, TrendingUp } from "lucide-react";
import { useState } from "react";
import { Button } from "@ameciclo/ui/components/button";
import { Label } from "@ameciclo/ui/components/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@ameciclo/ui/components/select";
import { type AssessmentSearch, validateAssessmentSearch } from "~/lib/assessment-search";
import {
  assessmentQueryKey,
  downloadCity,
  ibgeCitiesQueryOptions,
  type StoredCity,
  statesQueryOptions,
  storedCitiesQueryOptions,
} from "~/queries/assessment";

export const Route = createFileRoute("/avaliacao/")({
  validateSearch: validateAssessmentSearch,
  loader: ({ context: { queryClient } }) => queryClient.ensureQueryData(storedCitiesQueryOptions()),
  component: Avaliacao,
});

const formatDate = (iso: string) => new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(iso));

type Choice = { cityId: string; cityName: string; stateName: string };

function Avaliacao() {
  const { cidade } = Route.useSearch();
  const navigate = Route.useNavigate();
  const queryClient = useQueryClient();
  const { data: stored } = useSuspenseQuery(storedCitiesQueryOptions());
  const states = useQuery(statesQueryOptions());

  const [stateId, setStateId] = useState("");
  const [cityOption, setCityOption] = useState("");
  const ibgeCities = useQuery({ ...ibgeCitiesQueryOptions(Number(stateId)), enabled: stateId !== "" });

  const active = stored.find((c) => c.id === cidade) ?? null;
  const activate = (id: string | undefined) => navigate({ search: (previous): AssessmentSearch => ({ ...previous, cidade: id, trecho: undefined }) });

  const state = states.data?.find((s) => String(s.id) === stateId);
  const ibgeCity = ibgeCities.data?.find((c) => String(c.id) === cityOption);
  const choice: Choice | null = state && ibgeCity ? { cityId: cityOption, cityName: ibgeCity.nome, stateName: state.sigla } : null;
  const choiceStored = choice ? (stored.find((c) => c.id === choice.cityId) ?? null) : null;

  const download = useMutation({
    mutationFn: (c: Choice) => downloadCity({ data: { cityId: c.cityId, cityName: c.cityName, stateName: c.stateName, replace: false } }),
    onSuccess: async (_, c) => {
      await queryClient.invalidateQueries({ queryKey: assessmentQueryKey });
      await activate(c.cityId);
    },
  });

  const onCityChange = (value: string) => {
    setCityOption(value);
    const picked = ibgeCities.data?.find((c) => String(c.id) === value);
    const already = stored.find((c) => c.id === value);
    if (picked && already) void activate(already.id);
  };

  const steps = [
    { title: "Aprimorar Dados", subtitle: "Revise a cidade", icon: Download, color: "#EFC345", description: "Ajuste nomes, tipologias, classificações e a composição dos trechos antes da avaliação." },
    { title: "Selecionar um Trecho", subtitle: "Escolha a estrutura", icon: MapPin, color: "#5AC2E1", description: "Defina qual trecho será avaliado. O formulário só abre a partir dessa seleção." },
    { title: "Ver Resultados", subtitle: "Confira o índice", icon: TrendingUp, color: "#F59E0B", description: "Visualize a nota calculada, o IDECICLO da cidade e os trechos já avaliados." },
  ];

  const stepLink = (index: number, children: React.ReactNode, className: string, style: { backgroundColor: string }) => {
    // TODO(auth): the original sent people without the right role through the login here.
    if (!active)
      return (
        <div className={`${className} opacity-60`} style={style}>
          {children}
        </div>
      );
    if (index === 0)
      return (
        <Link to="/avaliacao/refinar-dados" search={{ cidade: active.id, trecho: undefined }} className={className} style={style}>
          {children}
        </Link>
      );
    if (index === 1)
      return (
        <Link to="/avaliacao/escolher-estrutura" search={{ cidade: active.id, trecho: undefined }} className={className} style={style}>
          {children}
        </Link>
      );
    return (
      <Link to="/avaliacao/resultados" search={{ cidade: active.id, trecho: undefined }} className={className} style={style}>
        {children}
      </Link>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold">Avaliação</h1>
          <p className="text-gray-600">Selecione a cidade aqui para seguir com as etapas de avaliação e edição.</p>
        </div>
        <Button asChild variant="outline">
          <Link to="/">Voltar ao Início</Link>
        </Button>
      </div>

      <div className="mb-8 rounded-[24px] bg-background-grey p-6 shadow-md">
        <h2 className="text-2xl font-semibold text-text-grey">Cidade da avaliação</h2>
        <p className="mt-2 max-w-3xl leading-7 text-gray-700">
          Primeiro escolha ou troque a cidade ativa aqui. Depois siga para aprimorar os dados, selecionar um trecho e ver os resultados da cidade.
        </p>

        {active ? (
          <div className="mt-4 max-w-md rounded-3xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-emerald-900 shadow-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-5" />
              <span className="text-sm font-semibold uppercase tracking-wide">Cidade ativa</span>
            </div>
            <p className="mt-2 text-xl font-bold text-emerald-950">{active.name}</p>
            <p className="text-sm text-emerald-800">{active.state}</p>
          </div>
        ) : (
          <div className="mt-4 max-w-md rounded-3xl border border-amber-200 bg-amber-50 px-4 py-4 text-amber-900 shadow-sm">
            <div className="flex items-center gap-2">
              <FileText className="size-5" />
              <span className="text-sm font-semibold uppercase tracking-wide">Nenhuma cidade ativa</span>
            </div>
            <p className="mt-2 text-sm leading-6">Escolha uma cidade já baixada ou baixe uma nova abaixo para ativar a avaliação.</p>
          </div>
        )}

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-text-grey">Cidades já baixadas</h3>
              <p className="text-sm text-gray-600">Clique em uma cidade para torná-la a cidade ativa imediatamente.</p>
            </div>
            <span className="text-sm text-gray-500">
              {stored.length} cidade{stored.length === 1 ? "" : "s"}
            </span>
          </div>

          {stored.length > 0 ? (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {stored.map((city: StoredCity) => (
                <button
                  key={city.id}
                  type="button"
                  onClick={() => void activate(city.id)}
                  className={`rounded-xl border p-4 text-left transition hover:border-ideciclo-blue hover:bg-white ${
                    active?.id === city.id ? "border-emerald-300 bg-emerald-50" : "border-slate-200 bg-slate-50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold text-slate-900">{city.name}</div>
                      <div className="text-sm text-slate-600">{city.state}</div>
                    </div>
                    <CheckCircle2 className={`size-4 ${active?.id === city.id ? "text-emerald-600" : "text-slate-400"}`} />
                  </div>
                  <div className="mt-3 text-xs text-slate-500">
                    {city.segments.toLocaleString("pt-BR")} trechos · {city.evaluated.toLocaleString("pt-BR")} avaliados
                  </div>
                  <div className="text-xs text-slate-500">Última atualização: {formatDate(city.updatedAt)}</div>
                  {active?.id === city.id && <div className="mt-3 text-xs font-semibold uppercase tracking-wide text-emerald-700">Cidade ativa</div>}
                </button>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">Nenhuma cidade foi baixada ainda.</div>
          )}

          <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h4 className="text-base font-semibold text-text-grey">Baixar nova cidade</h4>
                <p className="text-sm text-gray-600">Escolha estado e cidade. Se a cidade já estiver no banco, ela só será ativada.</p>
              </div>
              {active && (
                <Button variant="outline" onClick={() => void activate(undefined)}>
                  Limpar cidade ativa
                </Button>
              )}
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="estado-avaliacao">Estado</Label>
                <Select
                  value={stateId}
                  onValueChange={(value) => {
                    setStateId(value);
                    setCityOption("");
                  }}
                  disabled={states.isPending}
                >
                  <SelectTrigger id="estado-avaliacao">
                    <SelectValue placeholder={states.isPending ? "Carregando estados..." : "Selecione um estado"} />
                  </SelectTrigger>
                  <SelectContent>
                    {states.data?.map((s) => (
                      <SelectItem key={s.id} value={String(s.id)}>
                        {s.nome} - {s.sigla}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {states.error && <p className="text-xs text-destructive">Não foi possível carregar os estados agora.</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="cidade-avaliacao">Cidade</Label>
                <Select value={cityOption} onValueChange={onCityChange} disabled={stateId === "" || ibgeCities.isPending}>
                  <SelectTrigger id="cidade-avaliacao">
                    <SelectValue placeholder={ibgeCities.isFetching && stateId !== "" ? "Carregando cidades..." : "Selecione uma cidade"} />
                  </SelectTrigger>
                  <SelectContent>
                    {ibgeCities.data?.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {choice && !choiceStored && (
              <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Cidade nova selecionada</p>
                <h3 className="text-lg font-bold text-slate-900">{choice.cityName}</h3>
                <p className="text-sm text-slate-600">{choice.stateName} · essa cidade ainda não foi baixada.</p>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <Button onClick={() => download.mutate(choice)} disabled={download.isPending} className="bg-ideciclo-blue hover:bg-blue-600">
                    {download.isPending ? (
                      <>
                        <Loader2 className="mr-2 size-4 animate-spin" />
                        Baixando do OpenStreetMap…
                      </>
                    ) : (
                      "Selecionar e baixar dados"
                    )}
                  </Button>
                  {download.isPending && <span className="text-sm text-gray-600">Cidades grandes podem levar alguns minutos.</span>}
                </div>
                {download.error && <p className="mt-3 text-sm text-destructive">{download.error.message}</p>}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <div key={step.title}>
              {stepLink(
                index,
                <>
                  <p className="text-sm font-semibold uppercase tracking-wide">Etapa {index + 1}</p>
                  <Icon className="mt-3 size-9" />
                  <h3 className="mt-4 text-2xl font-bold">{step.title}</h3>
                  <p className="text-sm font-medium">{step.subtitle}</p>
                  <p className="mt-3 text-sm leading-6">{step.description}</p>
                </>,
                "block rounded-[32px] p-6 text-text-grey shadow-[0px_6px_8px_rgba(0,0,0,0.25)] transition-transform duration-200 hover:-translate-y-1",
                { backgroundColor: step.color },
              )}
            </div>
          );
        })}
      </div>
      {!active && <p className="mt-3 text-sm text-gray-600">Escolha uma cidade para liberar as etapas.</p>}
    </div>
  );
}
