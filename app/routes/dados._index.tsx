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
    const { data } = useLoaderData<typeof loader>();
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
            url: "/dados/ideciclo",
            description: "Índice que mede a malha e qualidade da estrutura cicloviaria",
            target: "",
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
            url: "/dados/execucaocicloviaria",
            description:
                "Monitoramento das estruturas cicloviárias projetadas e executadas conforme PDC.",
            target: "",
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
            url: "/dados/vias-inseguras",
            description:
                "Ranking das vias com maior concentração de sinistros de trânsito no Recife baseado nos dados do SAMU.",
            target: "",
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
        },
        // {
        //     title: "Infrações de trânsito",
        //     src: "/icons/dados/mapa.svg",
        //     url: "/dados/observatorio/vias-inseguras",
        //     description:
        //         "Ranking das vias com maior concentração de sinistros de trânsito no Recife baseado nos dados do SAMU.",
        //     target: "",
        // },
        // {
        //     title: "Pedidos de Informação",
        //     src: "/icons/dados/mapa.svg",
        //     url: "/dados/observatorio/vias-inseguras",
        //     description:
        //         "Acesso à todos os os Pedidos de Acesso à Informação à Prefeitura do Recife.",
        //     target: "",
        // },
    ];
    return (
        <>
            <ApiStatusHandler apiDown={data.apiDown} />
            <Banner image={data.cover?.url} alt="Capa da plataforma de dados" />
            <Breadcrumb label="Dados" slug="/dados" routes={["/"]} />
            <ExplanationBoxes boxes={[{ title: "O que temos aqui?", description: data.description }]} />
            <CardsSession
                title="Navegue por nossas pesquisas"
                cards={FEATURED_PAGES}
            />
            <ImagesGrid 
                title="Outras plataformas de dados de parceiras" 
                images={data.partners.map((p: any) => ({
                    src: p.image.url,
                    alt: p.title,
                    url: p.link,
                }))}
            />
        </>
    );

}