// Date helpers for the agenda. Everything is evaluated in Recife's timezone so
// the server (UTC on Workers) and the browser agree on what "today" and "this
// month" mean. Brazil has no DST, so a fixed -03:00 offset is exact.
export const AGENDA_TIMEZONE = "America/Recife";
const RECIFE_OFFSET = "-03:00";

export const MES_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;

const dayFormatter = new Intl.DateTimeFormat("sv-SE", {
  timeZone: AGENDA_TIMEZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const timeFormatter = new Intl.DateTimeFormat("pt-BR", {
  timeZone: AGENDA_TIMEZONE,
  hour: "2-digit",
  minute: "2-digit",
});

// Calendar dates ("2026-11-22") carry no timezone: format them as UTC so they
// never shift a day.
const monthLabelFormatter = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "UTC",
  month: "long",
  year: "numeric",
});
const dayHeadingFormatter = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "UTC",
  weekday: "long",
  day: "numeric",
  month: "long",
});
const shortDateFormatter = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "UTC",
  day: "2-digit",
  month: "2-digit",
});

export interface AgendaDateFields {
  start: string;
  end?: string | null;
  allDay: boolean;
}

export function capitalizeFirst(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** "2026-11" for the month containing `now`, in Recife. */
export function currentMonth(now: Date = new Date()): string {
  return dayFormatter.format(now).slice(0, 7);
}

export function shiftMonth(mes: string, delta: number): string {
  const [year, month] = mes.split("-").map(Number);
  const shifted = new Date(Date.UTC(year, month - 1 + delta, 1));
  return shifted.toISOString().slice(0, 7);
}

/** [start of the month, start of the next month) as instants. */
export function monthRange(mes: string): { timeMin: string; timeMax: string } {
  const startOf = (m: string) => new Date(`${m}-01T00:00:00${RECIFE_OFFSET}`).toISOString();
  return { timeMin: startOf(mes), timeMax: startOf(shiftMonth(mes, 1)) };
}

export function monthLabel(mes: string): string {
  return monthLabelFormatter.format(new Date(`${mes}-01T00:00:00Z`));
}

/** Instant used to order events. All-day dates count from midnight in Recife. */
export function startsAtMs(event: AgendaDateFields): number {
  return Date.parse(event.allDay ? `${event.start}T00:00:00${RECIFE_OFFSET}` : event.start);
}

function addDays(day: string, days: number): string {
  return new Date(Date.parse(`${day}T00:00:00Z`) + days * 86_400_000).toISOString().slice(0, 10);
}

/** Every Recife calendar day the event touches, as "YYYY-MM-DD". */
export function eventDays(event: AgendaDateFields): string[] {
  if (!event.allDay) return [dayFormatter.format(new Date(event.start))];
  // An all-day event's end date is exclusive.
  const lastDay = event.end ? addDays(event.end, -1) : event.start;
  const days: string[] = [];
  for (let day = event.start; day <= lastDay && days.length < 31; day = addDays(day, 1)) {
    days.push(day);
  }
  return days.length > 0 ? days : [event.start];
}

export function dayHeading(day: string): string {
  return dayHeadingFormatter.format(new Date(`${day}T00:00:00Z`));
}

export function formatTimeRange(event: AgendaDateFields): string {
  if (event.allDay) {
    const days = eventDays(event);
    const last = days[days.length - 1];
    return days.length > 1
      ? `Dia inteiro · até ${shortDateFormatter.format(new Date(`${last}T00:00:00Z`))}`
      : "Dia inteiro";
  }
  const from = timeFormatter.format(new Date(event.start));
  if (!event.end) return from;
  return `${from} – ${timeFormatter.format(new Date(event.end))}`;
}

/** Today as "YYYY-MM-DD" in Recife. */
export function todayKey(now: Date = new Date()): string {
  return dayFormatter.format(now);
}

export function isToday(day: string, now: Date = new Date()): boolean {
  return todayKey(now) === day;
}
