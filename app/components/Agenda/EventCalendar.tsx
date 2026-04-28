import { lazy, Suspense } from "react";
import type { AgendaEvent } from "~/queries/agenda";
import { UpcomingEventsList } from "./UpcomingEventsList";

// FullCalendar v7's React binding supports SSR + StrictMode natively, so we
// no longer need a `<ClientOnly>` wrapper. We still code-split via lazy() so
// the calendar's JS lives in its own chunk and the upcoming-events list
// renders as a Suspense fallback during the brief hydration window.
const FullCalendarWidget = lazy(() => import("./FullCalendarWidget"));

interface EventCalendarProps {
  initialEvents: AgendaEvent[];
}

export default function EventCalendar({ initialEvents }: EventCalendarProps) {
  return (
    <Suspense fallback={<UpcomingEventsList events={initialEvents} />}>
      <FullCalendarWidget initialEvents={initialEvents} />
    </Suspense>
  );
}
