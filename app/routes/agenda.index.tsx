import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import Breadcrumb from "~/components/Commom/Breadcrumb";
import Banner from "~/components/Commom/Banner";
import bannerSchedule from "/agenda.webp";
import { AgendaContent } from "~/components/Agenda/AgendaContent";
import { agendaQueryOptions, getDefaultRange } from "~/queries/agenda";
import { seo } from "~/utils/seo";

export const Route = createFileRoute("/agenda/")({
  loader: async ({ context: { queryClient } }) => {
    const range = getDefaultRange();
    await queryClient.ensureQueryData(agendaQueryOptions(range));
    return { range };
  },
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
  const { range } = Route.useLoaderData();
  const { data } = useSuspenseQuery(agendaQueryOptions(range));

  return (
    <>
      <Banner
        image={bannerSchedule}
        alt="Várias pessoas associadas ameciclo segurando uma faixa que diz Dia Mundial Sem Carro em cima de um barco no rio capibaribe"
      />
      <Breadcrumb label="Agenda" slug="/agenda" routes={["/"]} />
      <AgendaContent events={data.events} configured={data.configured} />
    </>
  );
}
