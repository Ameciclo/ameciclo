import Calendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/react/daygrid";
import listPlugin from "@fullcalendar/react/list";
import ptBrLocale from "@fullcalendar/react/locales/pt-br";
import type {
  EventClickInfo,
  EventInput,
  EventSourceFuncInfo,
  ViewDisplayInfo,
} from "@fullcalendar/react";
import "@fullcalendar/react/skeleton.css";
import "@fullcalendar/react/themes/classic/theme.css";
import "@fullcalendar/react/themes/classic/palette.css";
import type { AgendaEvent } from "~/queries/agenda";
import { fetchAgendaEvents } from "~/queries/agenda";

const CALENDAR_VIEW_COOKIE = "ameciclo_calendar_view";
const SOURCE_COLOR = {
  external: "red",
  internal: "#008080",
} as const;

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}=([^;]*)`),
  );
  return match ? decodeURIComponent(match[1]) : null;
}

function setCookie(name: string, value: string, days = 365): void {
  if (typeof document === "undefined") return;
  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires};path=/`;
}

function toFullCalendarEvent(event: AgendaEvent): EventInput {
  return {
    id: event.id,
    title: event.title,
    start: event.start,
    end: event.end ?? undefined,
    allDay: event.allDay,
    url: event.url ?? undefined,
    classNames: [`agenda-${event.source}`],
    color: SOURCE_COLOR[event.source],
  };
}

interface FullCalendarWidgetProps {
  initialEvents: AgendaEvent[];
}

export default function FullCalendarWidget(_props: FullCalendarWidgetProps) {
  const initialView = getCookie(CALENDAR_VIEW_COOKIE) ?? "listWeek";

  // Track the last view we've persisted so we only write the cookie when the
  // user actually changes the view type — not on every prev/next navigation.
  let lastPersistedView = initialView;

  const fetchEvents = async (
    info: EventSourceFuncInfo,
  ): Promise<EventInput[]> => {
    const result = await fetchAgendaEvents({
      data: {
        timeMin: info.start.toISOString(),
        timeMax: info.end.toISOString(),
      },
    });
    return result.events.map(toFullCalendarEvent);
  };

  const handleEventClick = (info: EventClickInfo): void => {
    if (!info.event.url) return;
    info.jsEvent.preventDefault();
    window.open(info.event.url, "_blank", "noopener,noreferrer");
  };

  const handleViewMount = (info: ViewDisplayInfo): void => {
    if (info.view.type !== lastPersistedView) {
      lastPersistedView = info.view.type;
      setCookie(CALENDAR_VIEW_COOKIE, info.view.type);
    }
  };

  return (
    <Calendar
      plugins={[dayGridPlugin, listPlugin]}
      events={fetchEvents}
      initialView={initialView}
      locale={ptBrLocale}
      height={650}
      nowIndicator
      headerToolbar={{
        left: "prev,next,today",
        center: "title",
        right: "dayGridMonth,dayGridWeek,listWeek",
      }}
      eventTimeFormat={{
        hour: "numeric",
        minute: "2-digit",
        meridiem: false,
      }}
      eventClick={handleEventClick}
      viewDidMount={handleViewMount}
    />
  );
}
