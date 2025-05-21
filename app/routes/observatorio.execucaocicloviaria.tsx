import React, { useState } from "react";
import { useLoaderData } from "@remix-run/react";
import { LayerProps } from "react-map-gl";
import { filterById, filterByName, IntlNumber2Digit, IntlNumberMax1Digit, IntlPercentil } from "~/services/utils";
import Banner from "~/components/Commom/Banner";
import Breadcrumb from "~/components/Commom/Breadcrumb";
import Table from "~/components/Commom/Table/Table";
import { ColumnFilter, SelectColumnFilter } from "~/components/Commom/Table/TableFilters";
import { ExplanationBoxes } from "~/components/Dados/ExplanationBoxes";
import { CyclingInfrastructureByCity } from "~/components/ExecucaoCicloviaria/CyclingInfrastructureByCity";
import { PDCMap } from "~/components/ExecucaoCicloviaria/PDCMap";
import { StatisticsBox } from "~/components/ExecucaoCicloviaria/StatisticsBox";

import { loader } from "~/loader/dados.observatorio.execucaocicloviaria";
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
    const [selectedCity, setCity] = useState(filterByName(citiesStatsArray, "Recife"));

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

    const changeCity = (id: any) => { setCity(filterById(citiesStatsArray, id)) };

    const ExtensionCell = ({ value }: any) => <>{<span>{IntlNumber2Digit(value)}</span>}</>;

    const columns = React.useMemo(() => [
        {
            Header: "(COD) Nome da Via",
            accessor: "cod_name",
            Filter: ColumnFilter,
        },
        {
            Header: "Tipologia prevista",
            accessor: "pdc_typology",
            Filter: SelectColumnFilter,
        },
        {
            Header: "Extensão prevista (km)",
            accessor: "length",
            Cell: ({ value }: any) => <ExtensionCell value={value} />,
            Filter: false,
        },
        {
            Header: "Tipologia executada",
            accessor: "typologies_str",
            Filter: ColumnFilter,
        },
        {
            Header: "Extensão executada (km)",
            accessor: "has_cycleway_length",
            Cell: ({ value }: any) => <ExtensionCell value={value} />,
            Filter: false,
        },
    ], []);

    function cityCycleStructureExecutionStatistics(selectedCity: any) {
        const { pdc_feito, pdc_total, percent, total } = {
            ...selectedCity,
        };
        return [
            {
                title: "estruturas cicloviárias",
                unit: "km",
                value: IntlNumberMax1Digit(total),
            },
            {
                title: "projetadas no plano cicloviário",
                unit: "km",
                value: IntlNumberMax1Digit(pdc_total),
            },
            {
                title: "implantados no plano cicloviário",
                unit: "km",
                value: IntlNumberMax1Digit(pdc_feito),
            },
            {
                title: "cobertos do plano cicloviário",
                value: IntlPercentil(percent),
                unit: "%",
            },
        ].filter((e) => e);
    }

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
            <StatisticsBox
                title={selectedCity.name}
                subtitle={"Estatísticas Gerais"}
                boxes={cityCycleStructureExecutionStatistics(selectedCity)}
            />
            <Table
                title={"Estruturas do PDC para " + selectedCity.name}
                data={selectedCity.relations}
                columns={columns}
            />
        </>
    );
}