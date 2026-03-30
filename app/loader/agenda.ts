import { queryOptions } from "@tanstack/react-query";

export const agendaQueryOptions = () =>
  queryOptions({
    queryKey: ["agenda"],
    queryFn: async () => {
      return {
        calendarConfig: {
          googleCalendarApiKey: process.env.GOOGLE_CALENDAR_API_KEY,
          externalCalendarId: process.env.GOOGLE_CALENDAR_EXTERNAL_ID,
          internalCalendarId: process.env.GOOGLE_CALENDAR_INTERNAL_ID,
        },
      };
    },
  });

export const loader = async () => agendaQueryOptions().queryFn({} as any);
