import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import { Badge } from "@ameciclo/ui/components/badge";
import { Button } from "@ameciclo/ui/components/button";
import { Card } from "@ameciclo/ui/components/card";
import { ToggleGroup, ToggleGroupItem } from "@ameciclo/ui/components/toggle-group";
import { cn } from "@ameciclo/ui/lib/utils";
import { SourceSchema, type AgendaData, type AgendaEvent, type AgendaSource } from "~/queries/agenda";
import { AgendaEventDialog } from "./AgendaEventDialog";
import { AgendaSubscribe } from "./AgendaSubscribe";
import {
  capitalizeFirst,
  currentMonth,
  dayHeading,
  eventDays,
  formatTimeRange,
  isToday,
  todayKey,
  monthLabel,
  shiftMonth,
} from "./dates";
import { SOURCE_BAR, SOURCE_DOT, SOURCE_LABEL } from "./source";

const TODOS = "todos";

interface AgendaContentProps {
  mes: string;
  fonte: AgendaSource | undefined;
  eventoId: string | undefined;
  data: AgendaData;
  onFonteChange: (fonte: AgendaSource | undefined) => void;
  onCloseEvent: () => void;
}

function groupByDay(events: AgendaEvent[], mes: string): [string, AgendaEvent[]][] {
  const groups = new Map<string, AgendaEvent[]>();
  for (const event of events) {
    for (const day of eventDays(event)) {
      if (!day.startsWith(mes)) continue;
      groups.set(day, [...(groups.get(day) ?? []), event]);
    }
  }
  return [...groups.entries()].sort(([a], [b]) => a.localeCompare(b));
}

// Ref callback with a stable identity, so React calls it only when the element
// mounts — not on every render. Brings the next upcoming day into view below the
// sticky headers, unless the reader has already scrolled.
function scrollToUpcoming(element: HTMLLIElement | null) {
  if (element && window.scrollY === 0) element.scrollIntoView({ block: "start" });
}

export function AgendaContent({
  mes,
  fonte,
  eventoId,
  data,
  onFonteChange,
  onCloseEvent,
}: AgendaContentProps) {
  const visible = fonte ? data.events.filter((event) => event.source === fonte) : data.events;
  const days = groupByDay(visible, mes);
  const selected = data.events.find((event) => event.id === eventoId);
  const label = monthLabel(mes);
  const isCurrentMonth = mes === currentMonth();
  // First day that hasn't passed yet. Only worth scrolling to when past days precede it.
  const upcomingDay = isCurrentMonth
    ? days.find(([day]) => isToday(day) || day > todayKey())?.[0]
    : undefined;
  const skipsPastDays = upcomingDay !== undefined && upcomingDay !== days[0]?.[0];

  return (
    <div className="container mx-auto my-10 grid gap-8 px-4 lg:grid-cols-[1fr_20rem]">
      <div>
        {/* Stays in view while the list scrolls (the site navbar is h-14). */}
        <div className="sticky top-14 z-10 -mx-4 border-b bg-background px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-2xl font-bold">{capitalizeFirst(label)}</h1>
            <nav aria-label="Navegar entre meses" className="flex items-center gap-2">
              <Button asChild variant="outline" size="sm">
                <Link
                  to="/agenda"
                  resetScroll={false}
                  search={(prev) => ({ ...prev, mes: shiftMonth(mes, -1), evento: undefined })}
                  aria-label="Mês anterior"
                >
                  <ChevronLeft aria-hidden />
                  <span className="hidden sm:inline">Anterior</span>
                </Link>
              </Button>
              {isCurrentMonth ? (
                <Button variant="outline" size="sm" disabled aria-current="date">
                  Hoje
                </Button>
              ) : (
                <Button asChild variant="outline" size="sm">
                  <Link
                    to="/agenda"
                    resetScroll={false}
                    search={(prev) => ({ ...prev, mes: undefined, evento: undefined })}
                  >
                    Hoje
                  </Link>
                </Button>
              )}
              <Button asChild variant="outline" size="sm">
                <Link
                  to="/agenda"
                  resetScroll={false}
                  search={(prev) => ({ ...prev, mes: shiftMonth(mes, 1), evento: undefined })}
                  aria-label="Próximo mês"
                >
                  <span className="hidden sm:inline">Próximo</span>
                  <ChevronRight aria-hidden />
                </Link>
              </Button>
            </nav>
          </div>

          <ToggleGroup
            type="single"
            value={fonte ?? TODOS}
            // Radix reports "" when the active item is pressed again: that means "all".
            onValueChange={(value) => onFonteChange(SourceSchema.safeParse(value).data)}
            aria-label="Filtrar por tipo"
            className="mt-3"
          >
            <ToggleGroupItem value={TODOS}>Todos</ToggleGroupItem>
            {data.calendars.map((calendar) => (
              <ToggleGroupItem key={calendar.source} value={calendar.source}>
                <span className={`size-2.5 rounded-full ${SOURCE_DOT[calendar.source]}`} aria-hidden />
                {SOURCE_LABEL[calendar.source]}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>

        {data.unavailable.length > 0 && (
          <p
            role="status"
            className="mt-4 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
          >
            Não conseguimos carregar parte da agenda agora (
            {data.unavailable.map((source) => SOURCE_LABEL[source]).join(", ")}). Recarregue a página
            em instantes.
          </p>
        )}

        {days.length === 0 ? (
          <Card className="mt-8 items-center gap-3 border-dashed p-10 text-center shadow-none">
            <p className="text-gray-700">
              Nenhuma atividade em {label}
              {fonte ? ` (${SOURCE_LABEL[fonte].toLowerCase()})` : ""}.
            </p>
            <Button asChild variant="link" className="text-ameciclo">
              <Link
                to="/agenda"
                resetScroll={false}
                search={(prev) => ({ ...prev, mes: shiftMonth(mes, 1), evento: undefined })}
              >
                Ver o mês seguinte
              </Link>
            </Button>
            <div className="mt-2 flex flex-col items-center gap-2 border-t pt-4">
              <p className="text-sm text-gray-600">
                Adicione ao seu calendário para ver as próximas atividades assim que forem publicadas.
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {data.calendars.map((calendar) => (
                  <Button key={calendar.source} asChild variant="outline" size="sm">
                    <a href={calendar.addUrl} target="_blank" rel="noopener noreferrer">
                      <span
                        className={`size-2.5 rounded-full ${SOURCE_DOT[calendar.source]}`}
                        aria-hidden
                      />
                      {calendar.label}
                    </a>
                  </Button>
                ))}
              </div>
            </div>
          </Card>
        ) : (
          <ol className="mt-6 space-y-8">
            {days.map(([day, events]) => (
              <li
                key={day}
                ref={skipsPastDays && day === upcomingDay ? scrollToUpcoming : undefined}
                className="scroll-mt-44"
              >
                <h2
                  className={cn(
                    "flex items-center gap-2 text-sm font-semibold uppercase tracking-wide",
                    isToday(day) ? "text-ameciclo" : "text-gray-500",
                  )}
                >
                  {dayHeading(day)}
                  {isToday(day) && <Badge className="bg-ameciclo text-white">Hoje</Badge>}
                </h2>
                <ul className="mt-3 space-y-3">
                  {events.map((event) => (
                    <li key={`${day}-${event.id}`}>
                      <Link
                        to="/agenda"
                        resetScroll={false}
                        search={(prev) => ({ ...prev, evento: event.id })}
                        className="block rounded-md focus-visible:outline-2 focus-visible:outline-ameciclo"
                      >
                        <Card
                          className={cn(
                            "gap-1 rounded-md border-l-4 px-4 py-4 shadow-none transition-colors hover:bg-accent",
                            SOURCE_BAR[event.source],
                            isToday(day) && "bg-ameciclo/5 ring-1 ring-ameciclo/30",
                          )}
                        >
                          <p className="text-sm text-gray-600">
                            {formatTimeRange(event)} · {SOURCE_LABEL[event.source]}
                          </p>
                          <p className="font-semibold">{event.title || "Evento sem título"}</p>
                          {event.location && (
                            <p className="flex items-center gap-1 text-sm text-gray-600">
                              <MapPin className="size-3.5 shrink-0" aria-hidden />
                              <span className="line-clamp-1">{event.location}</span>
                            </p>
                          )}
                        </Card>
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        )}
      </div>

      <aside className="lg:sticky lg:top-20 lg:self-start">
        <AgendaSubscribe calendars={data.calendars} />
      </aside>

      <AgendaEventDialog event={selected} onClose={onCloseEvent} />
    </div>
  );
}
