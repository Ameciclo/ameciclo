import { useState, useEffect, useRef } from "react";
import { useLoaderData } from "@remix-run/react";
import { LayerProps } from "react-map-gl";
import Banner from "~/components/Commom/Banner";
import Breadcrumb from "~/components/Commom/Breadcrumb";
import { ExplanationBoxes } from "~/components/Dados/ExplanationBoxes";
import { StatisticsBox } from "~/components/ExecucaoCicloviaria/StatisticsBox";
import { CardsSession } from "~/components/Commom/CardsSession";
import { ApiStatusHandler } from "~/components/Commom/ApiStatusHandler";
import { useApiStatus } from "~/contexts/ApiStatusContext";
import { AmecicloMap } from "~/components/Commom/Maps/AmecicloMap";
import { CityContent } from "~/components/ExecucaoCicloviaria/CityContent";
import { loader } from "~/loader/dados.execucaocicloviaria";
export { loader };

export default function ExecucaoCicloviaria() {
    const {
        cover,
        title1,
        title2,
        description1,
        description2,
        documents,
        allWaysData,
        layersConf,
        statsData,
        citiesData,
        apiDown,
        apiErrors
    } = useLoaderData<typeof loader>();

    const { setApiDown, addApiError } = useApiStatus();

    useEffect(() => {
        setApiDown(apiDown);
        if (apiErrors && apiErrors.length > 0) {
            apiErrors.forEach((error: {url: string, error: string}) => {
                addApiError(error.url, error.error, '/dados/execucaocicloviaria');
            });
        }
    }, [apiDown, apiErrors]);

    const [optionsType, setOptionsType] = useState("max1digit");
    const [city_sort, sortCity] = useState("total");
    const filterRef = useRef<HTMLDivElement>(null);
    
    const sortCityAndType = (value: string) => {
        sortCity(value);
        setOptionsType(value === "percent" ? "percentual" : "max1digit");
    };

    const sort_cities = [
        {
            title: "Exibir dados por:",
            value: city_sort,
            name: "city-sort",
            onChange: (e: any) => sortCityAndType(e.target.value),
            onBlur: (e: any) => e,
            items: [
                { value: "percent", label: "cobertos do plano cicloviário" },
                { value: "pdc_feito", label: "implantados no plano cicloviário" },
                { value: "pdc_total", label: "projetada no plano cicloviário" },
                { value: "total", label: "estrutura cicloviárias existentes" },
            ],
        },
    ];







    return (
        <>
            <Banner image={cover} alt="Capa da página dos dados, de execuções cicloviárias, na região metropolitana do recife." />
            <Breadcrumb label="Execução Cicloviária" slug="/dados/execucaocicloviaria" routes={["/", "/dados"]} />
            <ApiStatusHandler apiDown={apiDown} />
            <StatisticsBox
                title={"Execução Cicloviária"}
                subtitle={"da Região Metropolitana do Recife"}
                boxes={statsData}
            />
            <ExplanationBoxes
                boxes={[
                    {
                        title: title1,
                        description: description1,
                    },
                    {
                        title: title2,
                        description: description2,
                    },
                ]}
            />
            <div className="relative">
                {apiDown && (
                    <div className="absolute inset-0 bg-white bg-opacity-90 z-10 flex items-center justify-center">
                        <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-8 max-w-md mx-4">
                            <div className="text-center">
                                <svg className="w-16 h-16 text-orange-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">Dados do mapa indisponíveis</h3>
                                <p className="text-gray-600 mb-6">Não foi possível carregar os dados do mapa no momento. Tente novamente mais tarde.</p>
                                <a 
                                    href="/contato"
                                    className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-medium px-6 py-3 rounded-lg transition-colors"
                                >
                                    Reportar problema
                                </a>
                            </div>
                        </div>
                    </div>
                )}
                <AmecicloMap 
                    layerData={allWaysData} 
                    layersConf={layersConf as LayerProps[]}
                />
            </div>
            <CityContent 
                citiesStats={citiesData}
                filterRef={filterRef}
                sort_cities={sort_cities}
                city_sort={city_sort}
                optionsType={optionsType}
                sortCityAndType={sortCityAndType}
            />


            <div data-documents-section>
                <CardsSession title={documents.title} cards={documents.cards} />
            </div>
        </>
    );
}