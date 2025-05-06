import { json, LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import Banner from "~/components/Commom/Banner";
import Breadcrumb from "~/components/Commom/Breadcrumb";
import { CardsSession } from "~/components/Dados/CardsSession";
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
            url: "/dados/observatorio",
            description:
                "Monitoramento das estruturas cicloviárias projetadas e executadas conforme PDC.",
            target: "_self",
        },
        {
            title: "LEI ORÇAMENTARIA ANUAL (LOA)",
            src: "/icons/dados/mapa.svg",
            url: "/dados/observatorio/dom",
            description:
                "Monitoramento da Lei Orçamentária Estadual",
            target: "_self",
        },
        {
            title: "DIAGNÓSTICO ORÇAMENTÁRIO MUNICIPAL (DOM)",
            src: "/icons/dados/mapa.svg",
            url: "/dados/observatorio/dom",
            description:
                "Monitoramento da Lei Orçamentária Municipal",
            target: "_self",
        },
    ];

    return (
        <>
            <Banner image={cover?.url} alt="Capa da página do Observatório" />
            <Breadcrumb label="Observatório" slug="/dados/observatorio" routes={["/", "/dados"]} />
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