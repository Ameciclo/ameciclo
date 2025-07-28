import { Await, useLoaderData } from "@remix-run/react";
import { pointData, CountEditionSummary, CountEdition, PcrCounting } from "typings";
import Banner from "~/components/Commom/Banner";
import Breadcrumb from "~/components/Commom/Breadcrumb";
import { GeneralCountStatistics } from "~/components/Contagens/GeneralCountStatistics";
import { InfoCards } from "~/components/Contagens/InfoCards";
import { AmecicloMap } from "~/components/Commom/Maps/AmecicloMap";
import { ExplanationBoxes } from "~/components/Dados/ExplanationBoxes";
import { CardsSession } from "~/components/Commom/CardsSession";

import { loader } from "~/loader/dados.contagens";
import { IntlDateStr, IntlNumber } from "~/services/utils";
import { CountsTable } from "~/components/Contagens/CountsTable";
import { MapLoading } from "~/components/ExecucaoCicloviaria/Loading/MapLoading";
import { Suspense } from "react";

export { loader };

export default function Contagens() {
    const { cover, description, objective, summaryData, cards, countsData, dataCounts, archives, pcrCounts } = useLoaderData<typeof loader>();

    const allCountsStatistics = (summaryData: CountEditionSummary) => {
        const { total_cyclists = 0, number_counts = 0, where_max_count = { total_cyclists: 0 }, different_counts_points = 0 } = summaryData || {};
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

    

    let pointsData: pointData[] = countsData.map((d: CountEdition) => ({
        key: d.id,
        type: 'ameciclo',
        latitude: d.coordinates?.latitude || -8.0584364,
        longitude: d.coordinates?.longitude || -34.945277,
        popup: {
            name: d.name,
            total: d.total_cyclists,
            date: IntlDateStr(d.date),
            url: `/contagens/${d.slug}`,
            obs: ""
        },
        size: Math.round((d.total_cyclists || 0) / 250) + 5,
        color: "#008888"
    })).filter((point: pointData) =>
        point.latitude >= -90 && point.latitude <= 90 &&
        point.longitude >= -180 && point.longitude <= 180 &&
        point.latitude !== -8.0584364 && point.longitude !== -34.945277
    );

    const pcrPointsData: pointData[] = pcrCounts.map((d: PcrCounting, index: number) => ({
        key: "pcr_" + index,
        type: 'prefeitura',
        latitude: d.location.coordinates[0],
        longitude: d.location.coordinates[1],
        popup: {
            name: d.name,
            total: d.summary.total,
            date: IntlDateStr(d.date),
            url: "",
            obs: "Contagem realizadas pela ocasião do Diagnóstico do Plano de Mobilidade (ICPS/PCR)."
        },
        size: Math.round((d.summary.total || 0) / 250) + 5,
        color: "#ef4444"
    }));

    pointsData = pointsData.concat(pcrPointsData);
    
    

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
            <Suspense fallback={<MapLoading />}>
                <Await resolve={""}>
                    {() => (
                        <AmecicloMap
                            pointsData={pointsData} 
                            controlPanel={controlPanel}
                        />
                    )}
                </Await>
            </Suspense>
            <CountsTable data={dataCounts} />
            <CardsSession
                title={"Documentos para realizar contagens de ciclistas."}
                cards={docs}
            />
        </>
    );
}