import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { env } from "~/utils/env.server";

const getAgendaConfig = createServerFn().handler(async () => {
  return {
    googleCalendarApiKey: env.GOOGLE_CALENDAR_API_KEY,
    externalCalendarId: env.GOOGLE_CALENDAR_EXTERNAL_ID,
    internalCalendarId: env.GOOGLE_CALENDAR_INTERNAL_ID,
  };
});

export const agendaQueryOptions = () =>
  queryOptions({
    queryKey: ["agenda"],
    queryFn: async () => ({
      calendarConfig: await getAgendaConfig(),
      apiDown: false,
      apiErrors: [] as Array<{ url: string; error: string }>,
    }),
  });
