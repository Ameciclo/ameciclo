import { json, LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import Banner from "~/components/Commom/Banner";
import Breadcrumb from "~/components/Commom/Breadcrumb";
import { CardsSession } from "~/components/Commom/CardsSession";
import { ExplanationBoxes } from "~/components/Dados/ExplanationBoxes";
import { ImagesGrid } from "~/components/Dados/ImagesGrid";
import { ApiStatusHandler } from "~/components/Commom/ApiStatusHandler";

import { loader } from "~/loader/dados";
export { loader };
export default function Dados() {
    const { cover, description, partners, apiDown } = useLoaderData<typeof loader>();
    const dataPartners = partners.map((p: any) => {
        return {
            src: p.image.url,
            alt: p.title,
            url: p.link,
        };
    });
    const FEATURED_PAGES = [
        {
            title: "Contagens",
            src: "/icons/dados/contagem.svg",
            url: "https://dados.ameciclo.org/contagens",
            description:
                "Contagens das viagens de bicicleta e suas caracteristicas observáveis",
            target: "_blank",
        },
        {
            title: "Ideciclo",
            src: "/icons/dados/ideciclo.svg",
            url: "https://dados.ameciclo.org/ideciclo",
            description: "Índice que mede a malha e qualidade da estrutura cicloviaria",
            target: "_blank",
        },
        {
            title: "Estudos e Pesquisas",
            src: "/icons/dados/relatorio.svg",
            url: "https://dados.ameciclo.org/documentos",
            description:
                "Nossos estudos, pesquisas e livros que participamos ou que fizeramos sobre nós.",
            target: "_blank",
        },
        {
            title: "Perfil",
            src: "/icons/dados/perfil.svg",
            url: "https://dados.ameciclo.org/perfil",
            description: "Dados socio-economicos dos ciclistas e suas percepções",
            target: "_blank",
        },
        {
            title: "Sinistros Fatais",
            src: "/icons/home/sinistrosfatais.png",
            url: "/dados/sinistros-fatais",
            description:
                "Dados de mortalidade no trânsito extraídos do DATASUS para análise de segurança viária.",
            target: "_blank",
        },
        {
            title: "Execução Cicloviariá",
            src: "/icons/dados/mapa.svg",
            url: "https://dados.ameciclo.org/observatorio",
            description:
                "Monitoramento das estruturas cicloviariás projetadas e executadas conforme PDC.",
            target: "_blank",
        },
        {
            title: "Orçamento Estadual para o Clima",
            src: "/icons/home/logo2.1d0f07c6.png",
            url: "/dados/loa",
            description:
                "Monitoramento do orçamento estadual conforme sua contribuição climática.",
            target: "_blank",
        },
        {
            title: "Orçamento Municipal para o Clima",
            src: "/icons/home/header-logo.4f44929c.png",
            url: "/dados/dom",
            description:
                "Monitoramento do orçamento municipal conforme sua contribuição climática.",
            target: "_blank",
        },
    ];
    return (
        <>
            <ApiStatusHandler apiDown={apiDown} />
            <Banner image={cover?.url} alt="Capa da plataforma de dados" />
            <Breadcrumb label="Dados" slug="/dados" routes={["/"]} />
            <ExplanationBoxes boxes={[{ title: "O que temos aqui?", description }]} />
            <CardsSession
                title="Navegue por nossas pesquisas"
                cards={FEATURED_PAGES}
            />
            <ImagesGrid title="Outras plataformas de dados de parceiras" images={dataPartners} />
        </>
    );

}