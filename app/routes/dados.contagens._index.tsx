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

export { loader };

export default function Contagens() {
    const { data, summaryData, pcrCounts, amecicloData } = useLoaderData<typeof loader>();
    const [showFilters, setShowFilters] = useState(false);
    const [selectedPoint, setSelectedPoint] = useState<pointData | null>(null);

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
        if (totalCyclists === 0) return 8;
        const baseSize = 10;
        const maxSize = 40;
        const maxCyclists = 9000;
        const scaleFactor = (maxSize - baseSize) / maxCyclists;
        return Math.min(baseSize + (totalCyclists * scaleFactor), maxSize);
    };

    // Generate slugs for Atlas points and save to localStorage
    useEffect(() => {
        if (amecicloData && amecicloData.length > 0) {
            const atlasWithSlugs = amecicloData.map((ponto: any) => ({
                ...ponto,
                slug: ponto.slug || `atlas-${ponto.id}-${ponto.name?.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')}`
            }));
            localStorage.setItem('atlasAmecicloWithSlugs', JSON.stringify(atlasWithSlugs));
        }
    }, [amecicloData]);

    // Get Atlas data with slugs from localStorage
    const getAtlasDataWithSlugs = () => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('atlasAmecicloWithSlugs');
            return stored ? JSON.parse(stored) : amecicloData;
        }
        return amecicloData;
    };

    // Atlas Ameciclo data points
    const atlasAmecicloPoints: pointData[] = (getAtlasDataWithSlugs() || []).map((ponto: any) => {
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
                url: `/dados/contagens/${ponto.slug}`,
                obs: `As nossas contagens são registradas manualmente através da observação das pessoas voluntárias, registrando a direção do deslocamento e fatores qualitativos.`
            },
            size: calculatedSize,
            color: "#008888"
        };
    }).filter((point: pointData) =>
        point.latitude >= -90 && point.latitude <= 90 &&
        point.longitude >= -180 && point.longitude <= 180
    );

    // Legacy Garfo API data points
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
                obs: `As nossas contagens são registradas manualmente através da observação das pessoas voluntárias, registrando a direção do deslocamento e fatores qualitativos.`
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

    // Combine all data points - PCR first, then Ameciclo on top
    pointsData = [...pcrPointsData, ...pointsData, ...atlasAmecicloPoints];
    


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
                                
                                {selectedPoint.popup?.url && (
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
                                )}
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