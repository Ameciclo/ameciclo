import { useLoaderData } from "@remix-run/react";
import { pointData } from "typings";
import Banner from "~/components/Commom/Banner";
import Breadcrumb from "~/components/Commom/Breadcrumb";
import { GeneralCountStatistics } from "~/components/Contagens/GeneralCountStatistics";
import { InfoCards } from "~/components/Contagens/InfoCards";
import { CountsMap } from "~/components/Contagens/CountsMap";
import { ExplanationBoxes } from "~/components/Dados/ExplanationBoxes";

import { loader } from "~/loader/dados.contagens";
import { IntlDateStr, IntlNumber } from "~/services/utils";
import { CountsTable } from "~/components/Contagens/CountsTable";
import { CardsSession } from "~/components/Dados/CardsSession";
export { loader };

export default function Contagens() {
    const { cover, description, objective, summaryData, cards, countsData, dataCounts, archives } = useLoaderData<typeof loader>();

    const allCountsStatistics = (summaryData: any) => {
        const { total_cyclists, number_counts, where_max_count, different_counts_points } = {
            ...summaryData,
        };
        return [
            {
                title: "Total de ciclistas",
                value: IntlNumber(total_cyclists),
            },
            {
                title: "Contagens Realizadas",
                value: IntlNumber(number_counts),
            },
            { title: "Pontos Monitorados", value: IntlNumber(different_counts_points) },
            {
                title: "Máximo em um ponto",
                value: IntlNumber(where_max_count.total_cyclists),
            },
        ];
    };

    let pointsData: pointData[] = countsData.map((d: any) => ({
        key: d.id,
        type: 'ameciclo',
        latitude: d.coordinates.x,
        longitude: d.coordinates.y,
        popup: {
            name: d.name,
            total: d.total_cyclists,
            date: IntlDateStr(d.date),
            url: `/contagens/${d.slug}`,
            obs: ""
        },
        size: Math.round(d.total_cyclists / 250) + 5,
        color: "#008888"
    }));

    const controlPanel = [{
        type: 'ameciclo',
        color: '#008888'
    }, {
        type: 'prefeitura',
        color: "#ef4444"
    }];

    const docs = archives.map((a: any) => {
        return {
            title: a.filename,
            description: a.description,
            src: a.image?.url,
            url: a.file.url,
        };
    });

    return (
        <>
            <Banner image={cover?.url} alt="Capa da página de contagens" />
            <Breadcrumb label="Contagens" slug="/contagens" routes={["/", "/dados"]} />
            <GeneralCountStatistics title={"Estatísticas Gerais"} boxes={allCountsStatistics(summaryData)} />
            <ExplanationBoxes boxes={[{ title: "O que é?", description: description, }, { title: "E o que mais?", description: objective },]} />
            <InfoCards cards={cards} />
            <CountsMap pointsData={pointsData} controlPanel={controlPanel} />
            <CountsTable data={dataCounts} />
            <CardsSession
                title={"Documentos para realizar contagens de ciclistas."}
                cards={docs}
            />
        </>
    );
}