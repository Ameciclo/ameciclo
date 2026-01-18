import { useLoaderData } from "@remix-run/react";
import { pointData, CountEditionSummary, CountEdition, PcrCounting } from "typings";
import Banner from "~/components/Commom/Banner";
import Breadcrumb from "~/components/Commom/Breadcrumb";
import { GeneralCountStatistics } from "~/components/Contagens/GeneralCountStatistics";
import { InfoCards } from "~/components/Contagens/InfoCards";
import { AmecicloMap } from "~/components/Commom/Maps/AmecicloMap";
import { ExplanationBoxes } from "~/components/Dados/ExplanationBoxes";
import { CardsSession } from "~/components/Commom/CardsSession";
import { PointDetailsModal } from "~/components/Contagens/PointDetailsModal";

import { loader } from "~/loader/dados.contagens";
import { IntlDateStr, IntlNumber } from "~/services/utils";
import { CountsTable } from "~/components/Contagens/CountsTable";
import { useState, useEffect } from "react";
import { ApiStatusHandler } from "~/components/Commom/ApiStatusHandler";
import { useApiStatus } from "~/contexts/ApiStatusContext";

export { loader };

export default function Contagens() {
    const { data, summaryData, pcrCounts, amecicloData, apiDown, apiErrors } = useLoaderData<typeof loader>();
    const { setApiDown, addApiError } = useApiStatus();
    const [showFilters, setShowFilters] = useState(false);
    const [selectedPoint, setSelectedPoint] = useState<pointData | null>(null);
    
    useEffect(() => {
        setApiDown(apiDown);
        if (apiErrors && apiErrors.length > 0) {
            apiErrors.forEach((error: {url: string, error: string}) => {
                addApiError(error.url, error.error, '/dados/contagens');
            });
        }
    }, [apiDown, apiErrors]);
    
    const hasAmecicloData = amecicloData && amecicloData.length > 0;
    const hasPcrData = pcrCounts && pcrCounts.length > 0;

    const allCountsStatistics = (summaryData: CountEditionSummary | null) => {
        if (!summaryData) {
            return [
                { title: "Total de ciclistas", value: "0" },
                { title: "Contagens Realizadas", value: "0" },
                { title: "Pontos Monitorados", value: "0" },
                { title: "Máximo em um ponto", value: "0" },
            ];
        }
        const { total_cyclists = 0, number_counts = 0, where_max_count = { total_cyclists: 0 }, different_counts_points = 0 } = summaryData;
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

    const controlPanel = [
        {
            type: 'ameciclo',
            color: '#008888',
            loading: !hasAmecicloData
        }, 
        {
            type: 'prefeitura',
            color: "#ef4444",
            loading: !hasPcrData
        }
    ];

    const calculateMarkerSize = (totalCyclists: number) => {
        if (totalCyclists === 0) return 8;
        const baseSize = 10;
        const maxSize = 40;
        const maxCyclists = 9000;
        const scaleFactor = (maxSize - baseSize) / maxCyclists;
        return Math.min(baseSize + (totalCyclists * scaleFactor), maxSize);
    };

    // Atlas Ameciclo data points (única fonte)
    const atlasAmecicloPoints: pointData[] = hasAmecicloData ? (amecicloData || []).map((ponto: any) => {
        const lat = parseFloat(ponto.latitude);
        const lng = parseFloat(ponto.longitude);
        const latestCount = ponto.counts?.[0];
        const totalCyclists = latestCount?.total_cyclists || 0;
        const calculatedSize = calculateMarkerSize(totalCyclists);
        
        return {
            key: `atlas_ameciclo_${ponto.id}`,
            type: 'ameciclo',
            latitude: lat,
            longitude: lng,
            popup: {
                name: ponto.name || 'Contagem Ameciclo',
                total: totalCyclists,
                date: latestCount?.date ? IntlDateStr(latestCount.date) : 'Sem data',
                url: `/dados/contagens/${ponto.id}`,
                obs: `As nossas contagens são registradas manualmente através da observação das pessoas voluntárias, registrando a direção do deslocamento e fatores qualitativos.`
            },
            size: calculatedSize,
            color: "#008888"
        };
    }).filter((point: pointData) =>
        point.latitude >= -90 && point.latitude <= 90 &&
        point.longitude >= -180 && point.longitude <= 180
    ) : [];

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

    // Combine all data points - PCR first, then Ameciclo on top
    const pointsData = [...pcrPointsData, ...atlasAmecicloPoints];
    


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
            <ApiStatusHandler apiDown={apiDown} />
            <GeneralCountStatistics title={"Estatísticas Gerais"} boxes={allCountsStatistics(summaryData.summaryData)} />
            <ExplanationBoxes boxes={[{ title: "O que é?", description: data?.description }, { title: "E o que mais?", description: data?.objective }]} />
            <InfoCards cards={summaryData.cards} />
            <AmecicloMap
                pointsData={pointsData} 
                controlPanel={controlPanel}
                onPointClick={(point) => {
                    setSelectedPoint(point);
                }}
            />
            
            <PointDetailsModal point={selectedPoint} onClose={() => setSelectedPoint(null)} />
            <CountsTable data={summaryData.countsData} showFilters={showFilters} setShowFilters={setShowFilters} />
            <CardsSession
                title={"Documentos para realizar contagens de ciclistas."}
                cards={docs}
            />
        </>
    );
}