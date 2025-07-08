import { json, LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import Banner from "~/components/Commom/Banner";
import Breadcrumb from "~/components/Commom/Breadcrumb";
import { CardsSession } from "~/components/Commom/CardsSession";
import { ExplanationBoxes } from "~/components/Dados/ExplanationBoxes";
import { ImagesGrid } from "~/components/Dados/ImagesGrid";

import { loader } from "~/loader/dados";
export { loader };

export default function Observatorio() {
    const { cover, description, partners } = useLoaderData<typeof loader>();
    const dataPartners = partners.map((p: any) => {
        return {
            src: p.image.url,
            alt: p.title,
            url: p.link,
        };
    });

    const FEATURED_PAGES = [
        {
            title: "Execução Cicloviária",
            src: "/icons/dados/mapa.svg",
            url: "https://dados.ameciclo.org/observatorio",
            description:
                "Monitoramento das estruturas cicloviárias projetadas e executadas conforme PDC.",
            target: "_blank",
        },
        {
            title: "Orçamento Estadual para o Clima",
            src: "/icons/home/logo2.1d0f07c6.png",
            url: "/observatorio/loa",
            description:
                "Monitoramento do orçamento estadual conforme sua contribuição climática.",
            target: "_self",
        },
        {
            title: "Orçamento Municipal para o Clima",
            src: "/icons/home/header-logo.4f44929c.png",
            url: "/observatorio/dom",
            description:
                "Monitoramento do orçamento municipal conforme sua contribuição climática.",
            target: "_self",
        },
        {
            title: "Sinistros Fatais",
            src: "/icons/home/sinistrosfatais.png",
            url: "/dados/sinistros-fatais",
            description:
                "Dados de mortalidade no trânsito extraídos do DATASUS para análise de segurança viária.",
            target: "_self",
        },
    ];

    return (
        <>
            <Banner image={cover?.url} alt="Capa da página do Observatório" />
            <Breadcrumb label="Observatório" slug="/observatorio" routes={["/"]} />
            <ExplanationBoxes
                boxes={[{ title: "O que é?", description: description, }]}
            />
            <CardsSession
                title="Navegue por nosssos Observatórios"
                cards={FEATURED_PAGES}
            />
            <ImagesGrid title="Outras plataformas de dados de parceiras" images={dataPartners} />
        </>
    );
}