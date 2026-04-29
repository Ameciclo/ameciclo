import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { env } from "~/utils/env.server";

// Source-of-truth shape we hand to the calendar component. We deliberately
// don't echo Google's full `events.list` response — only the bits the UI
// uses, plus the `source` discriminator so the two calendars can be styled
// differently (red for external, teal for internal).
const AgendaEventSchema = z.object({
  id: z.string(),
  title: z.string(),
  start: z.string(),
  end: z.string().nullish(),
  allDay: z.boolean(),
  url: z.string().nullish(),
  source: z.enum(["external", "internal"]),
});

export type AgendaEvent = z.infer<typeof AgendaEventSchema>;

const RangeSchema = z.object({
  timeMin: z.string(),
  timeMax: z.string(),
});

export type AgendaRange = z.infer<typeof RangeSchema>;

interface GoogleCalendarItem {
  id?: string;
  summary?: string;
  htmlLink?: string;
  start?: { date?: string; dateTime?: string };
  end?: { date?: string; dateTime?: string };
}

async function fetchCalendar(
  calendarId: string,
  source: AgendaEvent["source"],
  apiKey: string,
  timeMin: string,
  timeMax: string,
): Promise<AgendaEvent[]> {
  if (!calendarId) return [];

  const url = new URL(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`,
  );
  url.searchParams.set("key", apiKey);
  url.searchParams.set("timeMin", timeMin);
  url.searchParams.set("timeMax", timeMax);
  url.searchParams.set("singleEvents", "true");
  url.searchParams.set("orderBy", "startTime");
  url.searchParams.set("maxResults", "250");

  const res = await fetch(url.toString());
  if (!res.ok) return [];
  const json = (await res.json()) as { items?: GoogleCalendarItem[] };

  return (json.items ?? []).flatMap((item) => {
    const start = item.start?.dateTime ?? item.start?.date;
    if (!start || !item.id) return [];
    return [
      {
        id: `${source}-${item.id}`,
        title: item.summary ?? "",
        start,
        end: item.end?.dateTime ?? item.end?.date ?? null,
        allDay: Boolean(item.start?.date) && !item.start?.dateTime,
        url: item.htmlLink ?? null,
        source,
      },
    ];
  });
}

export const fetchAgendaEvents = createServerFn({ method: "GET" })
  .inputValidator(RangeSchema)
  .handler(async ({ data }) => {
    const apiKey = env.GOOGLE_CALENDAR_API_KEY;
    if (!apiKey) {
      return { events: [] as AgendaEvent[], configured: false };
    }

    const externalId = env.GOOGLE_CALENDAR_EXTERNAL_ID;
    const internalId = env.GOOGLE_CALENDAR_INTERNAL_ID;

    const [external, internal] = await Promise.all([
      fetchCalendar(externalId, "external", apiKey, data.timeMin, data.timeMax),
      fetchCalendar(internalId, "internal", apiKey, data.timeMin, data.timeMax),
    ]);

    const events = z
      .array(AgendaEventSchema)
      .parse([...external, ...internal])
      .sort((a, b) => a.start.localeCompare(b.start));

    return { events, configured: true };
  });

// Initial range pre-fetched by the route loader so the page has events to
// render server-side. The client-side FullCalendar refetches on its own as
// the user navigates to other ranges.
export function getDefaultRange(now: Date = new Date()): AgendaRange {
  const timeMin = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
  const timeMax = new Date(now.getFullYear(), now.getMonth() + 3, 0).toISOString();
  return { timeMin, timeMax };
}

export const agendaQueryOptions = (range: AgendaRange) =>
  queryOptions({
    queryKey: ["agenda", range.timeMin, range.timeMax],
    queryFn: () => fetchAgendaEvents({ data: range }),
  });
