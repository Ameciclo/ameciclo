import { createFileRoute } from "@tanstack/react-router";
import Breadcrumb from "~/components/Commom/Breadcrumb";
import Banner from "~/components/Commom/Banner";
import bannerSchedule from "/agenda.webp";
import { ApiStatusHandler } from "~/components/Commom/ApiStatusHandler";
import { AgendaContent } from "~/components/Agenda/AgendaContent";
import { useSuspenseQuery } from "@tanstack/react-query";
import { agendaQueryOptions } from "~/queries/agenda";
import { useReportApiErrors } from "~/hooks/useReportApiErrors";
import { seo } from "~/utils/seo";

export const Route = createFileRoute("/agenda/")({
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(agendaQueryOptions()),
  head: () =>
    seo({
      title: "Agenda - Ameciclo",
      description:
        "Agenda de eventos, atividades e encontros da Ameciclo — participe da comunidade cicloativista de Recife.",
      pathname: "/agenda",
    }),
  component: Agenda,
});

function Agenda() {
    const { data } = useSuspenseQuery(agendaQueryOptions());
    const { calendarConfig, apiDown } = data;
    useReportApiErrors(data);

    return (
        <>
            <Banner image={bannerSchedule} alt="Várias pessoas associadas ameciclo segurando uma faixa que diz Dia Mundial Sem Carro em cima de um barco no rio capibaribe" />
            <Breadcrumb label="Agenda" slug="/agenda" routes={["/"]} />
            <ApiStatusHandler apiDown={apiDown} />
            <AgendaContent calendarConfig={calendarConfig} />
        </>
    );
}
