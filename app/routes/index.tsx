import { createFileRoute } from "@tanstack/react-router";
import SectionCarousel from "~/components/PaginaInicial/SectionCarousel";
import SectionData from "~/components/PaginaInicial/SectionData";
import bannerImage from "/backgroundImage.webp";
import { useSuspenseQuery } from "@tanstack/react-query";
import { homeQueryOptions } from "~/queries/home";
import { seo, organizationSchema } from "~/utils/seo";
import Apoie from "~/components/Commom/Icones/apoie";
import Associe from "~/components/Commom/Icones/associe";
import Participe from "~/components/Commom/Icones/participe";

export const Route = createFileRoute("/")({
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(homeQueryOptions()),
  head: () =>
    seo({
      title: "Ameciclo - Associação Metropolitana de Ciclistas do Recife",
      description:
        "Associação Metropolitana de Ciclistas do Recife — promovemos mobilidade ativa, cicloativismo e cidades mais humanas na Região Metropolitana do Recife.",
      pathname: "/",
      jsonLd: organizationSchema,
    }),
  component: Index,
});

function Index() {
  const { data } = useSuspenseQuery(homeQueryOptions());
  const { home, projects } = data;

  return (
    <>
      <section className="h-[70vh] w-full relative overflow-hidden py-[58px]">
        <img
          src={bannerImage}
          alt="Várias mulheres (11) de bicicleta andando na rua ocupando duas faixas e atravessando um cruzamento"
          className="absolute inset-0 w-full h-full object-cover"
        />
      </section>

      <section className="bg-ameciclo">
        <div className="container px-6 py-6 mx-auto">
          <div className="flex flex-col sm:flex-row justify-around items-center gap-4 sm:gap-0">
            {home.participation_url && (
              <a className="buttom-call-actions" href={home.participation_url} target="_blank" rel="noopener noreferrer"><Participe /></a>
            )}
            {home.association_url && (
              <a className="buttom-call-actions" href={home.association_url} target="_blank" rel="noopener noreferrer"><Associe /></a>
            )}
            {home.donate_url && (
              <a className="buttom-call-actions" href={home.donate_url} target="_blank" rel="noopener noreferrer"><Apoie /></a>
            )}
          </div>
        </div>
      </section>

      <SectionCarousel featuredProjects={home.projects} />
      <SectionData projects={projects} />
    </>
  );
}
