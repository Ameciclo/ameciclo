import React from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import googleCalendarPlugin from "@fullcalendar/google-calendar";
import listPlugin from "@fullcalendar/list";
import locale from "@fullcalendar/core/locales/pt-br";

const EventCalendar = (props) => {
  const handleEventClick = (e) => {
    e.jsEvent.preventDefault(); // don't let the browser navigate

    if (e.event.url) {
      window.open(e.event.url);
    }
  };

  return (
    <FullCalendar
      plugins={[dayGridPlugin, listPlugin, googleCalendarPlugin]}
      //Lembrar de passar a chave de API para o netlify
      googleCalendarApiKey="AIzaSyBo0qQ4MeIWRhkWzDFbz_-_F6oplkHI8KU"
      eventSources={[
        {
          googleCalendarId:
            "oj4bkgv1g6cmcbtsap4obgi9vc@group.calendar.google.com",
          className: "agenda-externa",
          color: "orange",
        },
        {
          googleCalendarId: "ameciclo@gmail.com",
          className: "agenda-interna",
          color: "red",
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
};

export default EventCalendar;
