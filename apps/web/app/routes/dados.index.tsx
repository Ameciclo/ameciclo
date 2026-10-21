import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import Banner from "~/components/Commom/Banner";
import Breadcrumb from "~/components/Commom/Breadcrumb";
import { CardsSession } from "~/components/Commom/CardsSession";
import { ExplanationBoxes } from "~/components/Dados/ExplanationBoxes";
import { ImagesGrid } from "~/components/Dados/ImagesGrid";
import { dadosQueryOptions } from "~/queries/dados";
import { seo } from "~/utils/seo";

export const Route = createFileRoute("/dados/")({
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(dadosQueryOptions()),
  head: () =>
    seo({
      title: "Dados - Ameciclo",
      description:
        "Plataforma de dados da Ameciclo sobre mobilidade ativa, infraestrutura cicloviária, sinistros e orçamento público no Recife.",
      pathname: "/dados",
    }),
  component: Dados,
});

const FEATURED_PAGES = [
  {
    title: "Contagens",
    src: "/icons/dados/contagem.svg",
    url: "/dados/contagens",
    description:
      "Contagens das viagens de bicicleta e suas caracteristicas observáveis",
    target: "",
  },
  {
    title: "Ideciclo",
    src: "/icons/dados/ideciclo.svg",
    url: "#",
    description: "Índice que mede a malha e qualidade da estrutura cicloviaria",
    target: "",
    comingSoon: true,
  },
  {
    title: "Estudos e Pesquisas",
    src: "/icons/dados/relatorio.svg",
    url: "/dados/documentos",
    description:
      "Nossos estudos, pesquisas e livros que participamos ou que fizeramos sobre nós.",
    target: "",
  },
  {
    title: "Perfil",
    src: "/icons/dados/perfil.svg",
    url: "/dados/perfil",
    description: "Dados socio-economicos dos ciclistas e suas percepções",
    target: "",
  },
  {
    title: "Execução Cicloviária",
    src: "/icons/dados/mapa.svg",
    url: "#",
    description:
      "Monitoramento das estruturas cicloviárias projetadas e executadas conforme PDC.",
    target: "",
    comingSoon: true,
  },
  {
    title: "Orçamento Estadual para o Clima",
    src: "/icons/home/logo2.1d0f07c6.png",
    url: "/dados/loa",
    description:
      "Monitoramento do orçamento estadual conforme sua contribuição climática.",
    target: "",
  },
  {
    title: "Orçamento Municipal para o Clima",
    src: "/icons/home/header-logo.4f44929c.png",
    url: "/dados/dom",
    description:
      "Monitoramento do orçamento municipal conforme sua contribuição climática.",
    target: "",
  },
  {
    title: "Chamados de Sinistros",
    src: "/icons/home/chamados_sinistros.svg",
    url: "/dados/samu",
    description:
      "Detalhamento dos dados de chamados de sinistros pela SAMU.",
    target: "",
  },
  {
    title: "Vias Inseguras",
    src: "/icons/home/vias-inseguras.svg",
    url: "#",
    description:
      "Ranking das vias com maior concentração de sinistros de trânsito no Recife baseado nos dados do SAMU.",
    target: "",
    comingSoon: true,
  },
  {
    title: "Sinistros Fatais",
    src: "/icons/home/sinistrosfatais.png",
    url: "/dados/sinistros-fatais",
    description:
      "Dados de mortalidade no trânsito extraídos do DATASUS para análise de segurança viária.",
    target: "",
  },
  {
    title: "CicloDados",
    src: "/icons/dados/ciclodados.svg",
    url: "/dados/ciclodados",
    description:
      "Plataforma integrada de dados sobre mobilidade urbana e infraestrutura cicloviária",
    target: "",
    isNew: true,
  },
];

function Dados() {
  const { data: { page } } = useSuspenseQuery(dadosQueryOptions());
  const partnerImages = (page.partners ?? []).flatMap((partner) => {
    const src = partner.image?.[0]?.url;
    if (!src) return [];
    return [
      {
        src,
        alt: partner.title ?? "",
        url: partner.link ?? "#",
      },
    ];
  });

  return (
    <>
      <Banner image={page.cover?.url ?? undefined} alt="Capa da plataforma de dados" />
      <Breadcrumb label="Dados" slug="/dados" routes={["/"]} />
      <ExplanationBoxes
        boxes={[{ title: "O que temos aqui?", description: page.description ?? null }]}
      />
      <CardsSession
        title="Navegue por nossas pesquisas"
        cards={FEATURED_PAGES}
      />
      <ImagesGrid
        title="Outras plataformas de dados de parceiras"
        images={partnerImages}
      />
    </>
  );
}
