import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { z } from "zod";
import Breadcrumb from "~/components/Commom/Breadcrumb";
import Banner from "~/components/Commom/Banner";
import { RouteLoading } from "~/components/Commom/RouteBoundaries";
import bannerSchedule from "/agenda.webp";
import { AgendaContent } from "~/components/Agenda/AgendaContent";
import { AgendaError } from "~/components/Agenda/AgendaError";
import { MES_PATTERN, currentMonth } from "~/components/Agenda/dates";
import { agendaQueryOptions, type AgendaData } from "~/queries/agenda";
import { SITE_URL, seo } from "~/utils/seo";

// ?mes=2026-12&fonte=internal&evento=<id>. Anything malformed falls back to the
// default (current month, every calendar, no event open), so shared links never break.
const SearchSchema = z.object({
  mes: z.string().regex(MES_PATTERN).optional().catch(undefined),
  fonte: z.enum(["internal", "external"]).optional().catch(undefined),
  evento: z.string().optional().catch(undefined),
});

function eventsJsonLd(data: AgendaData) {
  return data.events.slice(0, 25).map((event) => ({
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    startDate: event.start,
    ...(event.end ? { endDate: event.end } : {}),
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    ...(event.location ? { location: { "@type": "Place", name: event.location } } : {}),
    url: `${SITE_URL}/agenda`,
    organizer: { "@type": "Organization", name: "Ameciclo", url: SITE_URL },
  }));
}

export const Route = createFileRoute("/agenda/")({
  validateSearch: SearchSchema,
  // Only the month drives loading: choosing a filter or opening an event just
  // selects among data that is already here.
  loaderDeps: ({ search }) => ({ mes: search.mes ?? currentMonth() }),
  loader: ({ context: { queryClient }, deps }) =>
    queryClient.ensureQueryData(agendaQueryOptions(deps.mes)),
  head: ({ loaderData }) =>
    seo({
      title: "Agenda - Ameciclo",
      description:
        "Agenda de eventos, atividades e encontros da Ameciclo — participe da comunidade cicloativista de Recife.",
      pathname: "/agenda",
      jsonLd: loaderData ? eventsJsonLd(loaderData) : undefined,
    }),
  component: Agenda,
  pendingComponent: () => <RouteLoading label="Carregando a agenda..." />,
  pendingMs: 500,
  pendingMinMs: 800,
  errorComponent: AgendaError,
});

function Agenda() {
  const { fonte, evento } = Route.useSearch();
  const { mes } = Route.useLoaderDeps();
  const navigate = Route.useNavigate();
  const { data } = useSuspenseQuery(agendaQueryOptions(mes));

  return (
    <>
      <Banner
        image={bannerSchedule}
        alt="Várias pessoas associadas ameciclo segurando uma faixa que diz Dia Mundial Sem Carro em cima de um barco no rio capibaribe"
      />
      <Breadcrumb label="Agenda" slug="/agenda" routes={["/"]} />
      <AgendaContent
        mes={mes}
        fonte={fonte}
        eventoId={evento}
        data={data}
        onCloseEvent={() =>
          navigate({ search: (prev) => ({ ...prev, evento: undefined }), resetScroll: false })
        }
      />
    </>
  );
}
