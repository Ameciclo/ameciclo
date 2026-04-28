import type { AgendaEvent } from "~/queries/agenda";

interface UpcomingEventsListProps {
  events: AgendaEvent[];
}

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  weekday: "long",
  day: "2-digit",
  month: "long",
  year: "numeric",
});

const timeFormatter = new Intl.DateTimeFormat("pt-BR", {
  hour: "2-digit",
  minute: "2-digit",
});

function formatWhen(event: AgendaEvent): string {
  const start = new Date(event.start);
  const date = dateFormatter.format(start);
  if (event.allDay) return date;
  return `${date} · ${timeFormatter.format(start)}`;
}

export function UpcomingEventsList({ events }: UpcomingEventsListProps) {
  const now = Date.now();
  const upcoming = events
    .filter((e) => new Date(e.start).getTime() >= now - 24 * 60 * 60 * 1000)
    .slice(0, 20);

  if (upcoming.length === 0) {
    return (
      <div className="text-center py-12 text-gray-600">
        Nenhum evento agendado para os próximos dias.
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-3 list-none p-0">
      {upcoming.map((event) => (
        <li
          key={event.id}
          className="flex flex-col gap-1 border-l-4 pl-4 py-2"
          style={{
            borderColor: event.source === "external" ? "#dc2626" : "#008080",
          }}
        >
          <span className="text-xs uppercase tracking-wide text-gray-500">
            {formatWhen(event)}
          </span>
          {event.url ? (
            <a
              href={event.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-lg font-semibold text-ameciclo underline underline-offset-2 hover:opacity-80"
            >
              {event.title}
            </a>
          ) : (
            <span className="text-lg font-semibold text-gray-900">
              {event.title}
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}
