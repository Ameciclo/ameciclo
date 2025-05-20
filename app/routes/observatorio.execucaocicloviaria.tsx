import { useLoaderData } from "@remix-run/react";
import { useState } from "react";
import { LayerProps } from "react-map-gl";
import Banner from "~/components/Commom/Banner";
import Breadcrumb from "~/components/Commom/Breadcrumb";
import { ExplanationBoxes } from "~/components/Dados/ExplanationBoxes";
import { CyclingInfrastructureByCity } from "~/components/ExecucaoCicloviaria/CyclingInfrastructureByCity";
import { PDCMap } from "~/components/ExecucaoCicloviaria/PDCMap";
import { StatisticsBox } from "~/components/ExecucaoCicloviaria/StatisticsBox";

import { loader } from "~/loader/dados.observatorio.execucaocicloviaria";
import { filterById, filterByName } from "~/services/utils";
export { loader };

export default function ExecucaoCicloviaria() {
    const {
        cover,
        boxes,
        title1,
        title2,
        description1,
        description2,
        allCitiesLayer,
        layersConf,
        citiesStats,
    } = useLoaderData<typeof loader>();

    function sortCards(data: any, order: any) {
        const units: any = {
            percentil: "%",
            pdc_feito: "km",
            pdc_total: "km",
            total: "km",
        };
        return data
            .map((d: any) => ({
                id: d.id,
                label: d.name,
                unit: units[order],
                value: d[order],
            }))
            .sort((a: any, b: any) => (b.value >= a.value ? 1 : -1));
    }

    const citiesStatsArray = Object.values(citiesStats ?? {}).filter(
        (c: any) => c.name !== undefined
    );

    const [optionsType, setOptionsType] = useState("max1digit");
    const [city_sort, sortCity] = useState("total");

    const sort_cities = [
        {
            title: "Ordene as cidades: ",
            value: city_sort,
            name: "city-sort",
            onChange: (e: any) => sortCityAndType(e.target.value),
            onBlur: (e: any) => e,
            items: [
                { value: "percent", label: "cobertos do plano cicloviário" },
                { value: "pdc_feito", label: "implantados no plano cicloviário" },
                { value: "pdc_total", label: "projetada no plano cicloviário" },
                { value: "total", label: "estrutura cicloviárias" },
            ],
        },
    ];

    const sortCityAndType = (value: any) => {
        sortCity(value);
        let type = "max1digit";
        if (value == "percent") type = "percentual";
        setOptionsType(type);
    };

    const [selectedCity, setCity] = useState(
        filterByName(citiesStatsArray, "Recife")
    );

    const changeCity = (id: any) => {
        setCity(filterById(citiesStatsArray, id));
    };

    return (
        <>
            <Banner image={cover} alt="Capa da página dos dados, de execuções cicloviárias, na região metropolitana do recife." />
            <Breadcrumb label="Execução Cicloviária" slug="/execucaocicloviaria" routes={["/", "/observatorio"]} />
            <StatisticsBox
                title={"Execução Cicloviária"}
                subtitle={"da Região Metropolitana do Recife"}
                boxes={boxes}
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
            <PDCMap layerData={allCitiesLayer} layersConf={layersConf as LayerProps[]} />
            <CyclingInfrastructureByCity
                cards={sortCards(citiesStatsArray, city_sort)}
                data={{
                    title: "Estrutura nas cidades",
                    filters: sort_cities,
                }}
                options={{
                    changeFunction: changeCity,
                    type: optionsType,
                }}
                selected={selectedCity?.id}
            />
        </>
    );
}