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
    }, []);
    
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
                url: `/dados/contagens/${ponto.slug || `atlas-${ponto.id}`}`,
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
            
            {selectedPoint && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setSelectedPoint(null)}>
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
                        <div className={`px-6 py-4 text-white rounded-t-lg ${
                            selectedPoint.type === 'prefeitura' ? 'bg-gradient-to-r from-red-500 to-red-600' :
                            'bg-gradient-to-r from-teal-500 to-teal-600'
                        }`}>
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-lg">{selectedPoint.popup?.name}</h3>
                                <button 
                                    onClick={() => setSelectedPoint(null)}
                                    className="text-white hover:bg-black hover:bg-opacity-20 rounded-full p-1 transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                        
                        <div className="p-6">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className={`w-3 h-3 rounded-full ${
                                        selectedPoint.type === 'prefeitura' ? 'bg-red-500' : 'bg-teal-500'
                                    }`}></div>
                                    <span className="text-2xl font-bold text-gray-900">{selectedPoint.popup?.total} ciclistas</span>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-gray-50 p-3 rounded-lg">
                                        <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Data</div>
                                        <div className="font-medium text-gray-900">{selectedPoint.popup?.date}</div>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded-lg">
                                        <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Fonte</div>
                                        <div className="font-medium text-gray-900">{selectedPoint.type === 'prefeitura' ? 'PCR' : 'Ameciclo'}</div>
                                    </div>
                                </div>
                                
                                {selectedPoint.popup?.obs && (
                                    <div className="border-t pt-4">
                                        <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">Observações</div>
                                        <div className="text-sm text-gray-700">{selectedPoint.popup.obs}</div>
                                    </div>
                                )}
                                
                                {/* {selectedPoint.popup?.url && (
                                    <div className="border-t pt-4">
                                        <a 
                                            href={selectedPoint.popup.url}
                                            className="inline-flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                                        >
                                            Ver detalhes
                                            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                            </svg>
                                        </a>
                                    </div>
                                )} */}
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <CountsTable data={summaryData.countsData} showFilters={showFilters} setShowFilters={setShowFilters} />
            <CardsSession
                title={"Documentos para realizar contagens de ciclistas."}
                cards={docs}
            />
        </>
    );
}