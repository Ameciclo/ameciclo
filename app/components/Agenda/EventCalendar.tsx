import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import googleCalendarPlugin from "@fullcalendar/google-calendar";
import listPlugin from "@fullcalendar/list";
import locale from "@fullcalendar/core/locales/pt-br";

export default function EventCalendar({ googleCalendarApiKey }: any) {

    const handleEventClick = (e: {
        jsEvent: { preventDefault: () => void };
        event: { url: string | URL };
    }) => {
        e.jsEvent.preventDefault();

        if (typeof window !== "undefined" && e.event.url) {
            window.open(e.event.url);
        }
    };

    return (
        <FullCalendar
            plugins={[dayGridPlugin, listPlugin, googleCalendarPlugin]}
            googleCalendarApiKey={googleCalendarApiKey}
            eventSources={[
                {
                    googleCalendarId: "oj4bkgv1g6cmcbtsap4obgi9vc@group.calendar.google.com",
                    className: "agenda-externa",
                    color: "red",
                },
                {
                    googleCalendarId: "ameciclo@gmail.com",
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
        />
    );
}
