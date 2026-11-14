import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import type { AgendaData, AgendaEvent, AgendaSource } from "~/queries/agenda";
import { AgendaEventDialog } from "./AgendaEventDialog";
import { AgendaSubscribe } from "./AgendaSubscribe";
import {
  capitalizeFirst,
  currentMonth,
  dayHeading,
  eventDays,
  formatTimeRange,
  isToday,
  monthLabel,
  shiftMonth,
} from "./dates";
import { SOURCE_BAR, SOURCE_DOT, SOURCE_LABEL } from "./source";

interface AgendaContentProps {
  mes: string;
  fonte: AgendaSource | undefined;
  eventoId: string | undefined;
  data: AgendaData;
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

const navLink =
  "inline-flex items-center gap-1 rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50";

export function AgendaContent({ mes, fonte, eventoId, data, onCloseEvent }: AgendaContentProps) {
  const visible = fonte ? data.events.filter((event) => event.source === fonte) : data.events;
  const days = groupByDay(visible, mes);
  const selected = data.events.find((event) => event.id === eventoId);
  const label = monthLabel(mes);

  return (
    <div className="container mx-auto my-10 grid gap-8 px-4 lg:grid-cols-[1fr_20rem]">
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold">{capitalizeFirst(label)}</h1>
          <nav aria-label="Navegar entre meses" className="flex items-center gap-2">
            <Link
              to="/agenda"
              search={(prev) => ({ ...prev, mes: shiftMonth(mes, -1), evento: undefined })}
              className={navLink}
              aria-label="Mês anterior"
            >
              <ChevronLeft className="size-4" aria-hidden />
              <span className="hidden sm:inline">Anterior</span>
            </Link>
            <Link
              to="/agenda"
              search={(prev) => ({ ...prev, mes: undefined, evento: undefined })}
              className={navLink}
              aria-current={mes === currentMonth() ? "date" : undefined}
            >
              Hoje
            </Link>
            <Link
              to="/agenda"
              search={(prev) => ({ ...prev, mes: shiftMonth(mes, 1), evento: undefined })}
              className={navLink}
              aria-label="Próximo mês"
            >
              <span className="hidden sm:inline">Próximo</span>
              <ChevronRight className="size-4" aria-hidden />
            </Link>
          </nav>
        </div>

        <nav aria-label="Filtrar por tipo" className="mt-4 flex flex-wrap gap-2">
          {[undefined, ...data.calendars.map((calendar) => calendar.source)].map((source) => {
            const active = fonte === source;
            return (
              <Link
                key={source ?? "todos"}
                to="/agenda"
                search={(prev) => ({ ...prev, fonte: source, evento: undefined })}
                aria-current={active ? "true" : undefined}
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm ${
                  active
                    ? "border-gray-900 bg-gray-900 text-white"
                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                {source && (
                  <span className={`size-2.5 rounded-full ${SOURCE_DOT[source]}`} aria-hidden />
                )}
                {source ? SOURCE_LABEL[source] : "Todos"}
              </Link>
            );
          })}
        </nav>

        {data.unavailable.length > 0 && (
          <p role="status" className="mt-4 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Não conseguimos carregar parte da agenda agora ({data.unavailable.map((source) => SOURCE_LABEL[source]).join(", ")}). Recarregue a página em instantes.
          </p>
        )}

        {days.length === 0 ? (
          <div className="mt-8 rounded-lg border border-dashed border-gray-300 p-10 text-center">
            <p className="text-gray-700">
              Nenhuma atividade em {label}
              {fonte ? ` (${SOURCE_LABEL[fonte].toLowerCase()})` : ""}.
            </p>
            <Link
              to="/agenda"
              search={(prev) => ({ ...prev, mes: shiftMonth(mes, 1), evento: undefined })}
              className="mt-3 inline-block text-sm font-medium text-ameciclo underline"
            >
              Ver o mês seguinte
            </Link>
          </div>
        ) : (
          <ol className="mt-6 space-y-8">
            {days.map(([day, events]) => (
              <li key={day}>
                <h2
                  className={`text-sm font-semibold uppercase tracking-wide ${
                    isToday(day) ? "text-ameciclo" : "text-gray-500"
                  }`}
                >
                  {dayHeading(day)}
                  {isToday(day) && " · hoje"}
                </h2>
                <ul className="mt-3 space-y-3">
                  {events.map((event) => (
                    <li key={`${day}-${event.id}`}>
                      <Link
                        to="/agenda"
                        search={(prev) => ({ ...prev, evento: event.id })}
                        resetScroll={false}
                        className={`block rounded-md border border-gray-200 border-l-4 p-4 hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-ameciclo ${SOURCE_BAR[event.source]}`}
                      >
                        <p className="text-sm text-gray-600">
                          {formatTimeRange(event)} · {SOURCE_LABEL[event.source]}
                        </p>
                        <p className="mt-1 font-semibold">{event.title || "Evento sem título"}</p>
                        {event.location && (
                          <p className="mt-1 flex items-center gap-1 text-sm text-gray-600">
                            <MapPin className="size-3.5 shrink-0" aria-hidden />
                            <span className="line-clamp-1">{event.location}</span>
                          </p>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        )}
      </div>

      <aside className="lg:sticky lg:top-6 lg:self-start">
        <AgendaSubscribe calendars={data.calendars} />
      </aside>

      <AgendaEventDialog event={selected} onClose={onCloseEvent} />
    </div>
  );
}
