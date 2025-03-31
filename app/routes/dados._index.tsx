import { json, LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import Banner from "~/components/Commom/Banner";
import Breadcrumb from "~/components/Commom/Breadcrumb";
import { CardsSession } from "~/components/Dados/CardsSession";
import { ExplanationBoxes } from "~/components/Dados/ExplanationBoxes";

export const loader: LoaderFunction = async () => {
    try {
        const res = await fetch("https://cms.ameciclo.org/plataforma-de-dados", {
            cache: "no-cache",
        });

        const data = await res.json();
        const { cover, description } = data;
        return json({ cover, description });
    } catch (error) {
        console.error("Erro no loader:", error);
        throw json({ message: "Strapi error - Erro ao buscar os dados" }, { status: 500 });
    }
};

export default function Dados() {
    const { cover, description } = useLoaderData<typeof loader>();
    const FEATURED_PAGES = [
        {
            title: "Contagens",
            src: "/icons/dados/contagem.svg",
            url: "/dados/contagens",
            description:
                "Contagens das viagens de bicicleta e suas caracteristicas observáveis",
            target: "_self",
        },
        {
            title: "Ideciclo",
            src: "/icons/dados/ideciclo.svg",
            url: "/dados/ideciclo",
            description: "Índice que mede a malha e qualidade da estrutura cicloviaria",
            target: "_self",
        },
        {
            title: "Estudos e Pesquisas",
            src: "/icons/dados/relatorio.svg",
            url: "/dados/documentos",
            description:
                "Nossos estudos, pesquisas e livros que participamos ou que fizeramos sobre nós.",
            target: "_self",
        },
        {
            title: "Perfil",
            src: "/icons/dados/perfil.svg",
            url: "/dados/perfil",
            description: "/Dados socio-economicos dos ciclistas e suas percepções",
            target: "_self",
        },
        {
            title: "Observatório Cicloviário",
            src: "/icons/dados/mapa.svg",
            url: "/dados/observatorio",
            description:
                "Monitoramento das estruturas cicloviárias projetadas e executadas conforme PDC.",
            target: "_self",
        },
        {
            title: "Observatório DOM",
            src: "/icons/dados/mapa.svg",
            url: "/dados/observatorio/dom",
            description:
                "Monitoramento do Diágnóstico de Orçamento Municipal",
            target: "_self",
        },
        {
            title: "Observatório LOA",
            src: "/icons/dados/mapa.svg",
            url: "/dados/observatorio/dom",
            description:
                "Monitoramento da Lei Orçamentária Anual",
            target: "_self",
        },
    ];

    return (
        <>
            <Banner image={cover?.url} alt="Capa da plataforma de dados" />
            <Breadcrumb label="Dados" slug="/dados" routes={["/"]} />
            <ExplanationBoxes boxes={[{ title: "O que temos aqui?", description }]} />
            <CardsSession
                title="Navegue por nossas pesquisas"
                cards={FEATURED_PAGES}
            />
        </>
    );

}