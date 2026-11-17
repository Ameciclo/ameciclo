import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { LayerProps } from "react-map-gl/maplibre";
import Banner from "~/components/Commom/Banner";
import Breadcrumb from "~/components/Commom/Breadcrumb";
import { ExplanationBoxes } from "~/components/Dados/ExplanationBoxes";
import { StatisticsBox } from "~/components/ExecucaoCicloviaria/StatisticsBox";
import { CardsSession } from "~/components/Commom/CardsSession";
import { RouteLoading, RouteErrorBoundary } from "~/components/Commom/RouteBoundaries";
import { AmecicloMap } from "~/components/Commom/Maps/AmecicloMap";
import { CityContent } from "~/components/ExecucaoCicloviaria/CityContent";
import { ExecucaoHistory } from "~/components/ExecucaoCicloviaria/ExecucaoHistory";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import {
    execucaoCicloviariaQueryOptions,
    execucaoCicloviariaWaysQueryOptions,
} from "~/queries/dados.execucaocicloviaria";
import { seo } from "~/utils/seo";

export const Route = createFileRoute("/dados/execucaocicloviaria/")({
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(execucaoCicloviariaQueryOptions()),
  head: () =>
    seo({
      title: "Execução Cicloviária - Ameciclo",
      description:
        "Monitoramento das estruturas cicloviárias projetadas e executadas nas cidades da Região Metropolitana do Recife.",
      pathname: "/dados/execucaocicloviaria",
    }),
  component: ExecucaoCicloviaria,
  pendingComponent: () => <RouteLoading label="Carregando execução cicloviária..." />,
  pendingMs: 500,
  pendingMinMs: 800,
  errorComponent: RouteErrorBoundary,
});

function ExecucaoCicloviaria() {
    const { data } = useSuspenseQuery(execucaoCicloviariaQueryOptions());
    const {
        cover,
        title1,
        title2,
        description1,
        description2,
        documents,
        layersConf,
        statsData,
        citiesData,
        updatedAt,
        history,
    } = data;

    // The ways come after the page: the numbers do not wait for the map.
    const { data: allWaysData } = useQuery(execucaoCicloviariaWaysQueryOptions());

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
            <AmecicloMap
                layerData={allWaysData}
                layersConf={layersConf as LayerProps[]}
                // The whole RMR: the map cannot frame itself on ways that are still on their way.
                initialViewState={{ latitude: -8.1, longitude: -35.0, zoom: 9.2 }}
            />
            <p className="mx-auto container px-4 mt-4 text-center text-sm text-gray-600">
                Dados do OpenStreetMap{updatedAt ? `, atualizados em ${new Date(updatedAt).toLocaleDateString("pt-BR", { timeZone: "America/Recife" })}` : ""}.
                Nas vias de pista dupla, as duas pistas contam como uma só.
            </p>
            <CityContent
                citiesStats={citiesData}
                filterRef={filterRef}
                sort_cities={sort_cities}
                city_sort={city_sort}
                optionsType={optionsType}
                sortCityAndType={sortCityAndType}
            />


            <ExecucaoHistory
                history={history}
                cities={Object.values(citiesData).map((c: any) => ({ id: c.id, name: c.name }))}
            />

            <div data-documents-section>
                <CardsSession title={documents.title} cards={documents.cards} />
            </div>
        </>
    );
}
