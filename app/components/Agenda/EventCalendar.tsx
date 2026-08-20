import type { AgendaEvent } from "~/queries/agenda";
import FullCalendarWidget from "./FullCalendarWidget";

// FullCalendar v7's React binding renders a real calendar grid on the
// server, so we mount the widget directly — no lazy() / Suspense /
// ClientOnly wrappers. The agenda route's own chunk still keeps the
// calendar JS out of the home/landing bundle.
interface EventCalendarProps {
  initialEvents: AgendaEvent[];
}

export default function EventCalendar({ initialEvents }: EventCalendarProps) {
  return <FullCalendarWidget initialEvents={initialEvents} />;
}
