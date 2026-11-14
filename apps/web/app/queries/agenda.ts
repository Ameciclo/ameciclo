import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { MES_PATTERN, monthRange, startsAtMs } from "~/components/Agenda/dates";
import { env } from "~/utils/env.server";

export const SourceSchema = z.enum(["external", "internal"]);
export type AgendaSource = z.infer<typeof SourceSchema>;

// What we hand to the UI. We deliberately don't echo Google's full
// `events.list` response — only what the page uses, plus the `source`
// discriminator so the two calendars can be told apart.
const AgendaEventSchema = z.object({
  id: z.string(),
  title: z.string(),
  start: z.string(),
  end: z.string().nullish(),
  allDay: z.boolean(),
  url: z.string().nullish(),
  location: z.string().nullish(),
  description: z.string().nullish(),
  source: SourceSchema,
});
export type AgendaEvent = z.infer<typeof AgendaEventSchema>;

export interface AgendaCalendar {
  source: AgendaSource;
  label: string;
  /** Opens Google Calendar with a prompt to add this (public) calendar. */
  addUrl: string;
  /** Public iCal feed, for any other calendar app. */
  icsUrl: string;
}

export interface AgendaData {
  events: AgendaEvent[];
  /** Calendars that failed to load. The page still renders the others. */
  unavailable: AgendaSource[];
  calendars: AgendaCalendar[];
}

/**
 * The only message that ever reaches the browser when loading fails. The real
 * cause is logged server-side (Workers Logs), never shown to visitors.
 */
export const AGENDA_UNAVAILABLE = "Agenda indisponível";

const MesInputSchema = z.object({ mes: z.string().regex(MES_PATTERN) });

const GoogleDateSchema = z.object({
  date: z.string().optional(),
  dateTime: z.string().optional(),
});

const GoogleEventsSchema = z.object({
  items: z
    .array(
      z.object({
        id: z.string(),
        summary: z.string().nullish(),
        description: z.string().nullish(),
        location: z.string().nullish(),
        htmlLink: z.string().nullish(),
        start: GoogleDateSchema.optional(),
        end: GoogleDateSchema.optional(),
      }),
    )
    .default([]),
});

const CALENDAR_LABELS: Record<AgendaSource, string> = {
  internal: "Atividades da Ameciclo",
  external: "Eventos externos",
};

/** Google serves the description as HTML; the page renders it as plain text. */
function htmlToText(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|li)>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

class CalendarRequestError extends Error {
  constructor(readonly status: number) {
    super(`Google Calendar respondeu ${status}`);
  }
}

async function fetchCalendar(
  calendarId: string,
  source: AgendaSource,
  apiKey: string,
  timeMin: string,
  timeMax: string,
): Promise<AgendaEvent[]> {
  const url = new URL(
    `${env.GOOGLE_CALENDAR_API_URL}/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`,
  );
  url.searchParams.set("key", apiKey);
  url.searchParams.set("timeMin", timeMin);
  url.searchParams.set("timeMax", timeMax);
  url.searchParams.set("singleEvents", "true");
  url.searchParams.set("orderBy", "startTime");
  url.searchParams.set("maxResults", "250");

  // Public calendar: cache at Cloudflare's edge for a few minutes so visits
  // don't each spend Google quota. Failed responses are never cached.
  const res = await fetch(url, {
    cf: { cacheEverything: true, cacheTtlByStatus: { "200-299": 300, "400-599": 0 } },
  });
  if (!res.ok) throw new CalendarRequestError(res.status);

  const { items } = GoogleEventsSchema.parse(await res.json());

  return items.flatMap((item) => {
    const start = item.start?.dateTime ?? item.start?.date;
    if (!start) return [];
    return [
      {
        id: `${source}-${item.id}`,
        title: item.summary ?? "",
        start,
        end: item.end?.dateTime ?? item.end?.date ?? null,
        allDay: Boolean(item.start?.date) && !item.start?.dateTime,
        url: item.htmlLink ?? null,
        location: item.location?.trim() || null,
        description: item.description ? htmlToText(item.description) || null : null,
        source,
      },
    ];
  });
}

function describeFailure(reason: unknown): string {
  return reason instanceof Error ? `${reason.name}: ${reason.message}` : String(reason);
}

async function loadAgenda(mes: string): Promise<AgendaData> {
  const apiKey = env.GOOGLE_CALENDAR_API_KEY;
  if (!apiKey) throw new Error("GOOGLE_CALENDAR_API_KEY não está definida");

  const { timeMin, timeMax } = monthRange(mes);
  const sources = [
    { source: SourceSchema.enum.internal, id: env.GOOGLE_CALENDAR_INTERNAL_ID },
    { source: SourceSchema.enum.external, id: env.GOOGLE_CALENDAR_EXTERNAL_ID },
  ].filter((entry) => entry.id);

  const results = await Promise.allSettled(
    sources.map(({ id, source }) => fetchCalendar(id, source, apiKey, timeMin, timeMax)),
  );

  const events: AgendaEvent[] = [];
  const unavailable: AgendaSource[] = [];
  results.forEach((result, index) => {
    if (result.status === "fulfilled") {
      events.push(...result.value);
      return;
    }
    unavailable.push(sources[index].source);
    console.error("[agenda] calendário indisponível", {
      source: sources[index].source,
      mes,
      reason: describeFailure(result.reason),
    });
  });

  // Nothing at all to show: let the route's error boundary take over.
  if (sources.length === 0 || unavailable.length === sources.length) {
    throw new Error("nenhum calendário pôde ser carregado");
  }

  return {
    events: z
      .array(AgendaEventSchema)
      .parse(events)
      .sort((a, b) => startsAtMs(a) - startsAtMs(b)),
    unavailable,
    calendars: sources.map(({ id, source }) => ({
      source,
      label: CALENDAR_LABELS[source],
      addUrl: `https://calendar.google.com/calendar/render?cid=${encodeURIComponent(id)}`,
      icsUrl: `https://calendar.google.com/calendar/ical/${encodeURIComponent(id)}/public/basic.ics`,
    })),
  };
}

export const fetchAgenda = createServerFn({ method: "GET" })
  .inputValidator(MesInputSchema)
  .handler(async ({ data }): Promise<AgendaData> => {
    try {
      return await loadAgenda(data.mes);
    } catch (error) {
      console.error("[agenda] falha ao carregar a agenda", {
        mes: data.mes,
        reason: describeFailure(error),
      });
      throw new Error(AGENDA_UNAVAILABLE);
    }
  });

export const agendaQueryOptions = (mes: string) =>
  queryOptions({
    queryKey: ["agenda", mes],
    queryFn: () => fetchAgenda({ data: { mes } }),
  });
