import { useQuery } from '@tanstack/react-query';
import { Share2 } from 'lucide-react';
import { useCallback, useMemo, useState, type ReactNode } from 'react';
import type { PointInfo, PublicCharacteristics } from '@ameciclo/db';
import { Badge } from '@ameciclo/ui/components/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@ameciclo/ui/components/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@ameciclo/ui/components/tabs';
import { pointInfoQueryOptions, prefeituraCountsQueryOptions } from '~/queries/dados.ciclodados';
import { slugify } from '~/utils/slugify';
import { PromptAssistant } from './PromptAssistant';

// O resumo de um ponto clicado no mapa: tudo vem do banco (`getPointInfo`) e das contagens da Prefeitura (arquivo estático).
// Só agregados: nenhuma pessoa, chamado ou entrevista individual.

interface PointInfoPopupProps {
  lat: number;
  lng: number;
  onClose: () => void;
  // Aceita também os ids antigos das abas (a URL e o mapa ainda os usam).
  initialTab?: string;
}

// Cada aba tem a cor do assunto (a mesma do cartão do Resumo que leva até ela).
type TabId = 'resumo' | 'seguranca' | 'infraestrutura' | 'contagens' | 'perfil' | 'documento';
const TABS: { id: TabId; label: string; active: string; dot: string }[] = [
  { id: 'resumo', label: 'Resumo', active: 'data-[state=active]:text-blue-700', dot: 'bg-blue-500' },
  { id: 'seguranca', label: 'Segurança', active: 'data-[state=active]:text-red-700', dot: 'bg-red-500' },
  { id: 'infraestrutura', label: 'Infraestrutura', active: 'data-[state=active]:text-teal-700', dot: 'bg-teal-500' },
  { id: 'contagens', label: 'Contagens', active: 'data-[state=active]:text-green-700', dot: 'bg-green-500' },
  { id: 'perfil', label: 'Perfil', active: 'data-[state=active]:text-purple-700', dot: 'bg-purple-500' },
  { id: 'documento', label: 'Documento', active: 'data-[state=active]:text-amber-700', dot: 'bg-amber-500' },
];

const LEGACY_TAB: Record<string, TabId> = {
  overview: 'resumo', location: 'resumo', analysis: 'resumo', safety: 'seguranca', infrastructure: 'infraestrutura', counts: 'contagens', profile: 'perfil',
};

const n = (value: number) => value.toLocaleString('pt-BR');
const distance = (meters: number) => (meters < 1000 ? `${n(Math.round(meters))} m` : `${(meters / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} km`);

// ---- Contagens da Prefeitura (arquivo estático) --------------------------------------------------------------------

type NearbyCount = {
  id: string;
  slug?: string;
  source: 'Ameciclo' | 'Prefeitura';
  name: string;
  date: string;
  total: number;
  distance: number;
  characteristics: Partial<PublicCharacteristics>;
};

const CHARACTERISTICS: { key: keyof PublicCharacteristics; label: string }[] = [
  { key: 'women', label: 'Mulheres' },
  { key: 'helmet', label: 'Capacete' },
  { key: 'juveniles', label: 'Juvenis' },
  { key: 'wrong_way', label: 'Contramão' },
  { key: 'sidewalk', label: 'Calçada' },
  { key: 'cargo', label: 'Carga' },
  { key: 'service', label: 'Serviço' },
  { key: 'ride', label: 'Carona' },
  { key: 'shared_bike', label: 'Bike compartilhada' },
  { key: 'motor', label: 'Motorizada' },
];

// Distância aproximada em metros (plano local): basta para "a menos de 200 m".
function metersBetween(aLat: number, aLng: number, bLat: number, bLng: number) {
  return Math.hypot((aLat - bLat) * 111_320, (aLng - bLng) * 111_320 * Math.cos((aLat * Math.PI) / 180));
}

// ---- Peças visuais -------------------------------------------------------------------------------------------------

function Stat({ label, value, note, onClick, dot }: { label: string; value: string; note?: string; onClick?: () => void; dot?: string }) {
  const body = (
    <>
      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        {dot && <span className={`size-1.5 rounded-full ${dot}`} aria-hidden="true" />}
        {label}
      </p>
      <p className="text-2xl font-bold tabular-nums">{value}</p>
      {note && <p className="text-xs text-muted-foreground">{note}</p>}
    </>
  );
  // Com `onClick` o cartão é um botão que abre a aba do assunto.
  return onClick ? (
    <button type="button" onClick={onClick} className="rounded-lg border bg-card p-3 text-left transition-colors hover:bg-muted/50 focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none">
      {body}
    </button>
  ) : (
    <div className="rounded-lg border bg-card p-3">{body}</div>
  );
}

// O caminho para a página completa do assunto, no fim de cada aba.
function FullDataLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <p className="border-t pt-3 text-sm">
      <a href={href} className="font-medium text-ameciclo underline underline-offset-2 hover:opacity-80">
        {children} →
      </a>
    </p>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h4 className="mb-2 text-sm font-semibold">{title}</h4>
      {children}
    </section>
  );
}

// Barras horizontais com a largura proporcional ao maior valor; `percent` mostra a parte do total em vez do número.
function Bars({ rows, percent }: { rows: { label: string; value: number }[]; percent?: boolean }) {
  const max = Math.max(...rows.map((r) => r.value), 1);
  const total = rows.reduce((sum, r) => sum + r.value, 0) || 1;
  return (
    <ul className="space-y-1.5">
      {rows.map((r) => (
        <li key={r.label} className="grid grid-cols-[minmax(5rem,9rem)_1fr_3.5rem] items-center gap-2 text-xs">
          <span className="truncate text-muted-foreground" title={r.label}>{r.label}</span>
          <span className="h-2 rounded-full bg-muted">
            <span className="block h-2 rounded-full bg-ameciclo" style={{ width: `${(r.value / max) * 100}%` }} />
          </span>
          <span className="text-right tabular-nums">{percent ? `${Math.round((r.value / total) * 100)}%` : n(r.value)}</span>
        </li>
      ))}
    </ul>
  );
}

const entries = (record: Record<string, number>) => Object.entries(record).map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);
const Empty = ({ children }: { children: ReactNode }) => <p className="py-6 text-center text-sm text-muted-foreground">{children}</p>;

// ---- Abas ----------------------------------------------------------------------------------------------------------

function Resumo({ info, counts, go, onPickStreet, pickedStreet }: { info: PointInfo; counts: NearbyCount[]; go: (tab: TabId) => void; onPickStreet: (key: string | undefined) => void; pickedStreet: string | undefined }) {
  const calls = info.emergency_calls.annual_history.reduce((sum, y) => sum + y.total_calls, 0);
  const street = info.location.nearest_street;
  const [safety, infra, counting, profile] = [TABS[1], TABS[2], TABS[3], TABS[4]];
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <Stat label="Chamados do SAMU" value={n(calls)} note="nesta rua" dot={safety.dot} onClick={() => go('seguranca')} />
        <Stat label="Estacionamento" value={n(info.bike_racks.total)} note={info.bike_racks.total_capacity > 0 ? `bicicletários · ${n(info.bike_racks.total_capacity)} vagas` : 'bicicletários'} dot={infra.dot} onClick={() => go('infraestrutura')} />
        <Stat label="Estações Bike PE" value={n(info.shared_bike.stations.length)} note="a menos de 2 km" dot={infra.dot} onClick={() => go('infraestrutura')} />
        <Stat label="Contagens" value={n(counts.length)} note="por perto" dot={counting.dot} onClick={() => go('contagens')} />
        <Stat label="Infraestrutura" value={n(info.cycling_infra.existing.length)} note="trechos por perto" dot={infra.dot} onClick={() => go('infraestrutura')} />
        <Stat label="Entrevistas" value={n(info.cyclist_profile.total_profiles)} note="pesquisa de perfil" dot={profile.dot} onClick={() => go('perfil')} />
      </div>
      <Section title={info.nearby_streets.length > 1 ? 'Ruas aqui perto (escolha a rua dos dados)' : 'Rua mais próxima'}>
        {info.nearby_streets.length > 1 ? (
          <div role="radiogroup" aria-label="Rua dos dados" className="flex flex-wrap gap-2">
            {info.nearby_streets.map((s) => {
              const on = s.key === street.name;
              return (
                <button
                  key={s.key}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => onPickStreet(on && pickedStreet ? undefined : s.key)}
                  className={`rounded-full border px-3 py-1 text-xs transition-colors ${on ? 'border-red-500 bg-red-50 font-medium text-red-700' : 'hover:bg-muted'}`}
                >
                  {s.name} <span className="text-muted-foreground">· {distance(s.distance_meters)}</span>
                </button>
              );
            })}
          </div>
        ) : null}
        <p className="mt-2 text-sm">
          {street.official_name || street.name || 'Sem rua cadastrada por perto'}
          {street.total_length_meters > 0 && <span className="text-muted-foreground"> · {distance(street.total_length_meters)} de extensão · a {distance(street.distance_to_point_meters)} do ponto</span>}
        </p>
      </Section>
    </div>
  );
}

function Seguranca({ info }: { info: PointInfo }) {
  const calls = info.emergency_calls;
  const total = calls.annual_history.reduce((sum, y) => sum + y.total_calls, 0);
  if (total === 0) return <Empty>Sem chamados do SAMU registrados nesta rua.</Empty>;
  return (
    <div className="space-y-5">
      <p className="text-sm text-muted-foreground">
        {n(total)} chamados de sinistro de trânsito atendidos pelo SAMU em {info.location.nearest_street.official_name || info.location.nearest_street.name}.
        {calls.last_month_data.month && ` No último mês com registro (${calls.last_month_data.month}): ${n(calls.last_month_data.total_calls)}.`}
      </p>
      <Section title="Por ano">
        <Bars rows={[...calls.annual_history].reverse().map((y) => ({ label: String(y.year), value: y.total_calls }))} />
      </Section>
      <Section title="Por tipo de ocorrência">
        <Bars rows={calls.by_category.map((c) => ({ label: c.category || 'Não informado', value: c.count }))} />
      </Section>
      <div className="grid gap-5 md:grid-cols-2">
        <Section title="Por sexo">
          <Bars percent rows={calls.by_gender.map((g) => ({ label: g.gender || 'Não informado', value: g.count }))} />
        </Section>
        <Section title="Por faixa etária">
          <Bars percent rows={calls.by_age_group.map((a) => ({ label: a.age_group, value: a.count }))} />
        </Section>
      </div>
      <p className="text-xs text-muted-foreground">Fonte: SAMU Recife.</p>
      <FullDataLink href={`/dados/viasinseguras/${slugify(info.location.nearest_street.name)}`}>Ver os dados completos desta via</FullDataLink>
    </div>
  );
}

function Infraestrutura({ info }: { info: PointInfo }) {
  const { existing, planned_pdc: planned } = info.cycling_infra;
  const { items: racks, total, total_capacity } = info.bike_racks;
  const stations = info.shared_bike.stations;
  if (existing.length + planned.length + total + stations.length === 0) return <Empty>Nada de infraestrutura cicloviária mapeada por perto.</Empty>;
  return (
    <div className="space-y-5">
      {existing.length > 0 && (
        <Section title="Estrutura cicloviária existente">
          <ul className="space-y-1 text-sm">
            {existing.map((e) => (
              <li key={`${e.type}-${e.name}`}>
                <Badge variant="secondary" className="mr-2">{e.type}</Badge>
                {e.name} <span className="text-muted-foreground">· a {distance(e.distance_meters)}</span>
              </li>
            ))}
          </ul>
        </Section>
      )}
      {planned.length > 0 && (
        <Section title="Projetos do Plano Diretor Cicloviário por perto">
          <ul className="space-y-1 text-sm">
            {planned.map((p) => (
              <li key={p.id}>
                <span className="font-medium">{p.pdc_ref}</span> · {p.name} <span className="text-muted-foreground">({p.typology}{p.pdc_km > 0 ? `, ${p.pdc_km.toLocaleString('pt-BR')} km` : ''})</span>
              </li>
            ))}
          </ul>
        </Section>
      )}
      {total > 0 && (
        <Section title={`Bicicletários (${n(total)}${total_capacity > 0 ? `, ${n(total_capacity)} vagas` : ''})`}>
          <ul className="space-y-1 text-sm">
            {racks.map((r) => (
              <li key={r.id}>
                {r.name} <span className="text-muted-foreground">· {r.capacity === 'Não informada' ? 'vagas não informadas' : `${r.capacity} vagas`} · a {distance(r.distance_meters)}</span>
              </li>
            ))}
          </ul>
        </Section>
      )}
      {stations.length > 0 && (
        <Section title="Estações de Bike PE a menos de 2 km">
          <ul className="space-y-1 text-sm">
            {stations.map((s) => (
              <li key={s.id}>
                {s.name} <span className="text-muted-foreground">· {s.capacity > 0 ? `${s.capacity} vagas · ` : ''}a {distance(s.distance_meters)}</span>
              </li>
            ))}
          </ul>
        </Section>
      )}
      <p className="text-xs text-muted-foreground">Bicicletários e estações: OpenStreetMap.</p>
      <FullDataLink href="/dados/execucaocicloviaria">Ver os dados completos da infraestrutura cicloviária</FullDataLink>
    </div>
  );
}

function Contagens({ counts }: { counts: NearbyCount[] }) {
  if (counts.length === 0) return <Empty>Nenhuma contagem de ciclistas por perto.</Empty>;
  return (
    <div className="space-y-3">
      {counts.map((c, index) => {
        const rows = CHARACTERISTICS.map(({ key, label }) => ({ label, value: c.characteristics[key] ?? 0 })).filter((r) => r.value > 0);
        return (
          // O levantamento mais recente já abre aberto.
          <details key={c.id} open={index === 0} className="group rounded-lg border">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-3">
              <span className="flex items-center gap-2">
                <span className="font-medium">{c.name}</span>
                <Badge variant={c.source === 'Ameciclo' ? 'default' : 'secondary'}>{c.source}</Badge>
              </span>
              <span className="text-sm tabular-nums"><strong>{n(c.total)}</strong> ciclistas · {c.date.slice(0, 4)}</span>
            </summary>
            <div className="space-y-2 border-t p-3 text-sm">
              <p className="text-muted-foreground">{c.distance === 0 ? 'No ponto' : `A ${distance(c.distance)} do ponto`}</p>
              {rows.length > 0 && <Bars rows={rows.map((r) => ({ ...r, label: `${r.label} (${Math.round((r.value / c.total) * 100)}%)` }))} />}
              {c.slug && (
                <a href={`/dados/contagens/${c.slug}`} className="inline-block text-xs font-medium text-ameciclo underline underline-offset-2">
                  Ver todas as contagens deste ponto
                </a>
              )}
            </div>
          </details>
        );
      })}
      <p className="text-xs text-muted-foreground">Contagens da Ameciclo e da Prefeitura.</p>
      <FullDataLink href="/dados/contagens">Ver os dados completos das contagens</FullDataLink>
    </div>
  );
}

type Edition = PointInfo['cyclist_profile']['by_edition'][number];
const distributions = (e: Edition): [string, Record<string, number>][] => [
  ['Sexo', e.gender_distribution],
  ['Cor ou raça', e.race_distribution],
  ['Faixa etária', e.age_distribution],
  ['Escolaridade', e.education_distribution],
  ['Renda', e.income_distribution],
];

function Perfil({ info }: { info: PointInfo }) {
  const profile = info.cyclist_profile;
  if (profile.total_profiles === 0) return <Empty>Nenhuma entrevista da pesquisa de perfil por perto.</Empty>;
  return (
    <div className="space-y-5">
      <p className="text-sm text-muted-foreground">{n(profile.total_profiles)} entrevistas nesta região, em {profile.by_edition.map((e) => e.edition).join(' e ')}.</p>
      {[...profile.by_edition].reverse().map((e, index) => (
        // A edição mais recente já abre aberta.
        <details key={e.edition} open={index === 0} className="rounded-lg border p-3">
          <summary className="cursor-pointer list-none text-sm font-semibold">Edição {e.edition} · {n(e.total_profiles)} entrevistas</summary>
          <div className="mt-3 grid gap-4 md:grid-cols-2">
            {distributions(e).map(([title, distributionByLabel]) =>
              Object.keys(distributionByLabel).length > 0 ? (
                <div key={title}>
                  <p className="mb-1 text-xs font-medium text-muted-foreground">{title}</p>
                  <Bars percent rows={entries(distributionByLabel)} />
                </div>
              ) : null,
            )}
          </div>
        </details>
      ))}
      <FullDataLink href="/dados/perfil">Ver os dados completos da pesquisa de perfil</FullDataLink>
    </div>
  );
}

// ---- O popup -------------------------------------------------------------------------------------------------------

export function PointInfoPopup({ lat, lng, onClose, initialTab = 'resumo' }: PointInfoPopupProps) {
  const [shared, setShared] = useState(false);
  const [streetKey, setStreetKey] = useState<string | undefined>(undefined);
  const { data, isLoading } = useQuery({ ...pointInfoQueryOptions(lat, lng, 200, streetKey), placeholderData: (previous) => previous });
  const info = data?.info ?? null;

  // Contagens da Prefeitura: um arquivo estático, filtrado aqui para os pontos a até 200 m.
  const { data: prefeitura } = useQuery(prefeituraCountsQueryOptions());

  const counts = useMemo<NearbyCount[]>(() => {
    const own = (info?.cyclist_counts.counts ?? []).map<NearbyCount>((c) => ({
      id: `ameciclo-${c.id}`, slug: c.slug, source: 'Ameciclo', name: c.name, date: c.date, total: c.total_cyclists, distance: c.distance_meters, characteristics: c.characteristics,
    }));
    const city = (prefeitura ?? []).flatMap<NearbyCount>((p) => {
      const [pLat, pLng] = p.location.coordinates;
      const d = metersBetween(lat, lng, pLat, pLng);
      if (d > 200) return [];
      const total = p.summary?.total ?? 0;
      return [{
        id: `prefeitura-${p.name}-${p.date}`, source: 'Prefeitura', name: p.name, date: new Date(p.date).toISOString().slice(0, 10), total, distance: Math.round(d),
        characteristics: { cargo: Math.round((p.summary?.cargo_percent ?? 0) * total), wrong_way: Math.round((p.summary?.wrong_way_percent ?? 0) * total) },
      }];
    });
    return [...own, ...city].sort((a, b) => b.date.localeCompare(a.date));
  }, [info, prefeitura, lat, lng]);

  // O endereço guarda o ponto (para compartilhar) enquanto o popup está aberto; um callback de ref roda uma vez ao montar.
  const syncUrl = useCallback(
    (node: HTMLDivElement | null) => {
      if (!node) return;
      const url = new URL(window.location.href);
      url.searchParams.set('lat', lat.toFixed(6));
      url.searchParams.set('lon', lng.toFixed(6));
      url.searchParams.set('zoom', url.searchParams.get('zoom') ?? '16');
      url.searchParams.set('modal', 'open');
      window.history.pushState({}, '', url.toString());
    },
    [lat, lng],
  );

  const close = () => {
    const url = new URL(window.location.href);
    url.searchParams.delete('modal');
    window.history.pushState({}, '', url.toString());
    onClose();
  };

  const share = async () => {
    const link = `${window.location.origin}/dados/ciclodados?lat=${lat}&lon=${lng}&zoom=16`;
    try {
      if (navigator.share) await navigator.share({ title: 'Ponto no CicloDados - Ameciclo', url: link });
      else await navigator.clipboard.writeText(link);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    } catch {
      // Cancelou o compartilhamento ou a área de transferência não está disponível: nada a fazer.
    }
  };

  const startTab: TabId = LEGACY_TAB[initialTab] ?? (TABS.find((t) => t.id === initialTab)?.id ?? 'resumo');
  const [tab, setTab] = useState<TabId>(startTab);
  const isTab = (value: string): value is TabId => TABS.some((t) => t.id === value);

  return (
    <Dialog open onOpenChange={(open) => !open && close()}>
      <DialogContent className="max-w-3xl">
        <span ref={syncUrl} hidden />
        <DialogHeader className="pr-8 text-left">
          <DialogTitle className="flex items-center gap-2">
            {info?.location.nearest_street.official_name || info?.location.nearest_street.name || 'Ponto selecionado'}
            <button type="button" onClick={share} className="rounded-sm p-1 text-muted-foreground hover:text-foreground" title="Copiar link do ponto">
              <Share2 className="size-4" />
              <span className="sr-only">Compartilhar</span>
            </button>
            {shared && <span className="text-xs font-normal text-muted-foreground">Link copiado</span>}
          </DialogTitle>
          <DialogDescription>Dados da Ameciclo num raio de 200 m do ponto ({lat.toFixed(5)}, {lng.toFixed(5)}).</DialogDescription>
        </DialogHeader>

        {isLoading && <Empty>Carregando dados do ponto…</Empty>}
        {!isLoading && !info && <Empty>Os dados deste ponto estão indisponíveis no momento. Tente de novo em instantes.</Empty>}
        {info && (
          <Tabs value={tab} onValueChange={(value) => isTab(value) && setTab(value)} className="min-h-0 flex-1">
            <TabsList>
              {TABS.map((t) => (
                <TabsTrigger key={t.id} value={t.id} className={t.active}>
                  <span className={`size-1.5 rounded-full ${t.dot}`} aria-hidden="true" />
                  {t.label}
                </TabsTrigger>
              ))}
            </TabsList>
            <TabsContent value="resumo"><Resumo info={info} counts={counts} go={setTab} onPickStreet={setStreetKey} pickedStreet={streetKey} /></TabsContent>
            <TabsContent value="seguranca"><Seguranca info={info} /></TabsContent>
            <TabsContent value="infraestrutura"><Infraestrutura info={info} /></TabsContent>
            <TabsContent value="contagens"><Contagens counts={counts} /></TabsContent>
            <TabsContent value="perfil"><Perfil info={info} /></TabsContent>
            <TabsContent value="documento">
              <PromptAssistant
                info={info}
                lat={lat}
                lng={lng}
                radius={200}
                counts={counts.map((c) => ({ name: c.name, date: c.date, total: c.total, distance: c.distance, source: c.source }))}
              />
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}
