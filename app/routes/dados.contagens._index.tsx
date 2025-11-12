import { useLoaderData } from "@remix-run/react";
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
import { useState } from "react";

export { loader };

export default function Contagens() {
    const { data, summaryData, pcrCounts } = useLoaderData<typeof loader>();
    const [showFilters, setShowFilters] = useState(false);

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

    const controlPanel = [{
        type: 'ameciclo',
        color: '#008888'
    }, {
        type: 'prefeitura',
        color: "#ef4444"
    }];

    const calculateMarkerSize = (totalCyclists: number) => {
        if (totalCyclists === 0) return 10;
        
        const baseSize = 12;
        const maxSize = 35;
        const scaleFactor = Math.log10(totalCyclists + 1) * 8;
        const calculatedSize = baseSize + scaleFactor;
        
        return Math.min(Math.max(baseSize, calculatedSize), maxSize);
    };

    let pointsData: pointData[] = summaryData.countsData.map((d: CountEdition) => {
        const totalCyclists = d.summary?.total_cyclists || d.total_cyclists || 0;
        
        return {
            key: String(d.id),
            type: 'ameciclo',
            latitude: d.coordinates?.[0]?.point?.y || d.coordinates?.latitude || -8.0584364,
            longitude: d.coordinates?.[0]?.point?.x || d.coordinates?.longitude || -34.945277,
            popup: {
                name: d.name || 'Contagem Ameciclo',
                total: totalCyclists,
                date: IntlDateStr(d.date),
                url: `/dados/contagens/${d.slug}`,
                obs: ""
            },
            size: calculateMarkerSize(totalCyclists),
            color: "#008888"
        };
    }).filter((point: pointData) =>
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
            name: d.name || 'Contagem PCR',
            total: d.summary?.total || 0,
            date: IntlDateStr(d.date),
            url: "",
            obs: "Contagem realizadas pela ocasião do Diagnóstico do Plano de Mobilidade (ICPS/PCR)."
        },
        size: calculateMarkerSize(d.summary?.total || 0),
        color: "#ef4444"
    })).filter((point: pointData) =>
        point.latitude >= -90 && point.latitude <= 90 &&
        point.longitude >= -180 && point.longitude <= 180
    );

    pointsData = pointsData.concat(pcrPointsData);
    


    const docs = (data?.archives || []).map((a: any) => {
        return {
            title: a.filename,
            description: a.description,
            src: a.image?.url,
            url: a.file.url,
        };
    });

    return (
        <>
            <Banner image={data?.cover?.url} alt="Capa da página de contagens" />
            <Breadcrumb label="Contagens" slug="/contagens" routes={["/", "/dados"]} />
            <GeneralCountStatistics title={"Estatísticas Gerais"} boxes={allCountsStatistics(summaryData.summaryData)} />
            <ExplanationBoxes boxes={[{ title: "O que é?", description: data?.description || "Dados de contagens", }, { title: "E o que mais?", description: data?.objective || "Monitorar fluxo de ciclistas" }]} />
            <InfoCards cards={summaryData.cards} />
            <AmecicloMap
                pointsData={pointsData} 
                controlPanel={controlPanel}
                onPointClick={(point) => {
                    // Navegar para a página de detalhes se houver URL
                    if (point.popup?.url) {
                        window.location.href = point.popup.url;
                    }
                }}
            />
            <CountsTable data={summaryData.countsData} showFilters={showFilters} setShowFilters={setShowFilters} />
            <CardsSession
                title={"Documentos para realizar contagens de ciclistas."}
                cards={docs}
            />
        </>
    );
}