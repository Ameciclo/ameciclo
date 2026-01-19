import { useLoaderData } from "@remix-run/react";
import { pointData } from "typings";
import Banner from "~/components/Commom/Banner";
import Breadcrumb from "~/components/Commom/Breadcrumb";
import { GeneralCountStatistics } from "~/components/Contagens/GeneralCountStatistics";
import { InfoCards } from "~/components/Contagens/InfoCards";
import { AmecicloMap } from "~/components/Commom/Maps/AmecicloMap";
import { ExplanationBoxes } from "~/components/Dados/ExplanationBoxes";
import { CardsSession } from "~/components/Commom/CardsSession";
import { PointDetailsModal } from "~/components/Contagens/PointDetailsModal";
import { CountsTable } from "~/components/Contagens/CountsTable";
import { ApiStatusHandler } from "~/components/Commom/ApiStatusHandler";
import { useApiStatus } from "~/contexts/ApiStatusContext";
import { useCountsStatistics } from "~/hooks/useCountsStatistics";
import { useCountsMapData } from "~/hooks/useCountsMapData";
import { loader } from "~/loader/dados.contagens";
import { useState, useEffect } from "react";

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

    const statistics = useCountsStatistics(summaryData.summaryData);
    const { pointsData, controlPanel } = useCountsMapData(amecicloData, pcrCounts);
    


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
            <GeneralCountStatistics title={"Estatísticas Gerais"} boxes={statistics} />
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