import { useState, useEffect } from "react";
import { ClientOnly } from "remix-utils/client-only";

const CALENDAR_VIEW_COOKIE = "ameciclo_calendar_view";

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

function setCookie(name: string, value: string, days: number = 365) {
  if (typeof document === "undefined") return;
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
}

function CalendarComponent({ googleCalendarApiKey, externalCalendarId, internalCalendarId }: any) {
  const [FullCalendar, setFullCalendar] = useState<any>(null);
  const [plugins, setPlugins] = useState<any[]>([]);
  const [locale, setLocale] = useState<any>(null);
  const [hasError, setHasError] = useState(false);
  const [initialView, setInitialView] = useState("listWeek");

  useEffect(() => {
    const savedView = getCookie(CALENDAR_VIEW_COOKIE);
    if (savedView) setInitialView(savedView);

    const loadCalendar = async () => {
      try {
        const [fcReact, dayGrid, googleCal, list, ptBr] = await Promise.all([
          import("@fullcalendar/react"),
          import("@fullcalendar/daygrid"),
          import("@fullcalendar/google-calendar"),
          import("@fullcalendar/list"),
          import("@fullcalendar/core/locales/pt-br")
        ]);
        
        setFullCalendar(() => fcReact.default);
        setPlugins([dayGrid.default, list.default, googleCal.default]);
        setLocale(ptBr.default);
      } catch (error) {
        console.error('Error loading calendar:', error);
        setHasError(true);
      }
    };
    
    loadCalendar();
  }, []);

  const handleEventClick = (e: any) => {
    e.jsEvent.preventDefault();
    if (typeof window !== "undefined" && e.event.url) {
      window.open(e.event.url);
    }
  };

  if (!googleCalendarApiKey || hasError || !FullCalendar) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <h3 className="text-lg font-medium text-red-800 mb-2">
            {hasError ? 'Erro ao carregar agenda' : 'Carregando agenda...'}
          </h3>
          <p className="text-red-600">
            {hasError ? 'Não foi possível carregar os eventos.' : 'Aguarde...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <FullCalendar
      plugins={plugins}
      googleCalendarApiKey={googleCalendarApiKey}
      eventSources={[
        {
          googleCalendarId: externalCalendarId,
          className: "agenda-externa",
          color: "red",
        },
        {
          googleCalendarId: internalCalendarId,
          className: "agenda-interna",
          color: "#008080",
        },
      ]}
      initialView={initialView}
      locale={locale}
      height={650}
      nowIndicator={true}
      headerToolbar={{
        left: "prev,next,today",
        center: "title",
        right: "dayGridMonth,dayGridWeek,listWeek",
      }}
      buttonText={{
        listWeek: "Agenda",
      }}
      eventTimeFormat={{
        hour: "numeric",
        minute: "2-digit",
        meridiem: false,
      }}
      eventClick={handleEventClick}
      eventSourceFailure={() => setHasError(true)}
      viewDidMount={(info) => setCookie(CALENDAR_VIEW_COOKIE, info.view.type)}
    />
  );
}

export default function EventCalendar(props: any) {
  return (
    <ClientOnly fallback={
      <div className="text-center py-12">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 max-w-md mx-auto">
          <h3 className="text-lg font-medium text-gray-800 mb-2">Carregando agenda...</h3>
          <p className="text-gray-600">Aguarde...</p>
        </div>
      </div>
    }>
      {() => <CalendarComponent {...props} />}
    </ClientOnly>
  );
}
