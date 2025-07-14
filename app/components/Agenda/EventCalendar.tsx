import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import googleCalendarPlugin from "@fullcalendar/google-calendar";
import listPlugin from "@fullcalendar/list";
import locale from "@fullcalendar/core/locales/pt-br";
import { useState } from "react";

function AgendaError() {
    return (
        <div className="text-center py-12">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
                <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <h3 className="text-lg font-medium text-red-800 mb-2">
                    Erro ao carregar agenda
                </h3>
                <p className="text-red-600 mb-4">
                    Não foi possível carregar os eventos do Google Calendar. Verifique sua conexão ou tente novamente mais tarde.
                </p>
                <a 
                    href="/contato" 
                    className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    Reportar problema
                </a>
            </div>
        </div>
    );
}

export default function EventCalendar({googleCalendarApiKey, externalCalendarId, internalCalendarId}: any) {
    const [hasError, setHasError] = useState(false);

    const handleEventClick = (e: {
        jsEvent: { preventDefault: () => void };
        event: { url: string | URL };
    }) => {
        e.jsEvent.preventDefault();

        if (typeof window !== "undefined" && e.event.url) {
            window.open(e.event.url);
        }
    };

    if (!googleCalendarApiKey || hasError) {
        return <AgendaError />;
    }

    return (
        <FullCalendar
            plugins={[dayGridPlugin, listPlugin, googleCalendarPlugin]}
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
            initialView="listWeek"
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
        />
    );
}
