import { CalendarPlus } from "lucide-react";
import type { AgendaCalendar } from "~/queries/agenda";
import { SOURCE_DOT } from "./source";

export function AgendaSubscribe({ calendars }: { calendars: AgendaCalendar[] }) {
  return (
    <section aria-labelledby="agenda-assinar" className="rounded-lg border border-gray-200 p-5">
      <h2 id="agenda-assinar" className="flex items-center gap-2 text-lg font-semibold">
        <CalendarPlus className="size-5" aria-hidden />
        Leve a agenda com você
      </h2>
      <p className="mt-1 text-sm text-gray-600">
        Adicione ao seu calendário e receba as atividades automaticamente.
      </p>
      <ul className="mt-4 space-y-3">
        {calendars.map((calendar) => (
          <li key={calendar.source} className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <span className="flex items-center gap-2 text-sm font-medium">
              <span className={`size-2.5 rounded-full ${SOURCE_DOT[calendar.source]}`} aria-hidden />
              {calendar.label}
            </span>
            <a
              href={calendar.addUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-ameciclo underline"
            >
              Google Agenda
            </a>
            <a href={calendar.icsUrl} className="text-sm text-ameciclo underline">
              Outros apps (.ics)
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
