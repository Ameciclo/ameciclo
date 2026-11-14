import { CalendarDays, ExternalLink, MapPin } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@ameciclo/ui/components/dialog";
import type { AgendaEvent } from "~/queries/agenda";
import { capitalizeFirst, dayHeading, eventDays, formatTimeRange } from "./dates";
import { SOURCE_LABEL } from "./source";

interface AgendaEventDialogProps {
  event: AgendaEvent | undefined;
  onClose: () => void;
}

export function AgendaEventDialog({ event, onClose }: AgendaEventDialogProps) {
  return (
    <Dialog open={Boolean(event)} onOpenChange={(open) => !open && onClose()}>
      {event && (
        <DialogContent className="max-w-xl overflow-y-auto">
          <DialogHeader className="pr-6 text-left">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              {SOURCE_LABEL[event.source]}
            </p>
            <DialogTitle className="text-2xl">{event.title || "Evento sem título"}</DialogTitle>
            <DialogDescription className="flex items-center gap-2 text-base text-gray-700">
              <CalendarDays className="size-4 shrink-0" aria-hidden />
              <span>{capitalizeFirst(dayHeading(eventDays(event)[0]))}</span>
              <span aria-hidden>·</span>
              <span>{formatTimeRange(event)}</span>
            </DialogDescription>
          </DialogHeader>

          {event.location && (
            <p className="flex items-start gap-2 text-sm text-gray-700">
              <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden />
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-ameciclo"
              >
                {event.location}
              </a>
            </p>
          )}

          {event.description && (
            <p className="whitespace-pre-line text-sm leading-relaxed text-gray-800">
              {event.description}
            </p>
          )}

          {event.url && (
            <a
              href={event.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 self-start text-sm font-medium text-ameciclo underline"
            >
              Abrir no Google Agenda
              <ExternalLink className="size-4" aria-hidden />
            </a>
          )}
        </DialogContent>
      )}
    </Dialog>
  );
}
