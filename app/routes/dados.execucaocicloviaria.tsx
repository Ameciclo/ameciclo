import React, { useState, useEffect, useRef, Suspense } from "react";
import { useLoaderData, Await } from "@remix-run/react";
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
import { CardsSession } from "~/components/Commom/CardsSession";
import { StatisticsBoxLoading } from "~/components/ExecucaoCicloviaria/Loading/StatisticsBoxLoading";
import { MapLoading } from "~/components/ExecucaoCicloviaria/Loading/MapLoading";
import { CityCardsLoading } from "~/components/ExecucaoCicloviaria/Loading/CityCardsLoading";
import { TableLoading } from "~/components/ExecucaoCicloviaria/Loading/TableLoading";
import { CityStructureLoading } from "~/components/ExecucaoCicloviaria/Loading/CityStructureLoading";

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
        allCitiesLayer,
        layersConf,
        statsPromise,
        citiesPromise,
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

    const [optionsType, setOptionsType] = useState("max1digit");
    const [city_sort, sortCity] = useState("total");
    const [selectedCity, setCity] = useState(null);
    
    const sortCityAndType = (value: any) => {
        sortCity(value);
        let type = "max1digit";
        if (value == "percent") type = "percentual";
        setOptionsType(type);
    };

    const changeCity = (id: any, citiesStatsArray: any) => { 
        setCity(filterById(citiesStatsArray, id)); 
    };
    

    const sectionRef = useRef<HTMLDivElement>(null);
    const filterRef = useRef<HTMLDivElement>(null);

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



    const [showPercentage, setShowPercentage] = useState(false);
    const [showFilters, setShowFilters] = useState(false);

function CityContent({ citiesStats, filterRef, sort_cities, city_sort, optionsType, changeCity, selectedCity, setCity, sortCityAndType, showPercentage, setShowPercentage, showFilters, setShowFilters, columns }: any) {
    const citiesStatsArray = React.useMemo(() => 
        Object.values(citiesStats ?? {}).filter((c: any) => c.name !== undefined),
        [citiesStats]
    );
    
    const [localSelectedCity, setLocalSelectedCity] = useState(() => filterByName(citiesStatsArray, "Recife"));
    const [showFixedBar, setShowFixedBar] = useState(false);
    const [showFilterBar, setShowFilterBar] = useState(false);
    const sectionRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        const handleScroll = () => {
            if (sectionRef.current && filterRef.current) {
                const sectionBottom = sectionRef.current.offsetTop + sectionRef.current.offsetHeight;
                const filterTop = filterRef.current.offsetTop;
                const scrollY = window.scrollY;
                
                setShowFixedBar(scrollY > sectionBottom);
                setShowFilterBar(scrollY > filterTop + 100 && scrollY < sectionBottom - 200);
            }
        };
        
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);
    
    const sortedCards = React.useMemo(() => sortCards(citiesStatsArray, city_sort), [citiesStatsArray, city_sort]);
    
    const cityCycleStats = React.useMemo(() => {
        if (!localSelectedCity) return [];
        const { pdc_feito, pdc_total, percent, total } = localSelectedCity;
        
        const getPercentageColor = (value: number) => {
            if (value >= 98) return "text-green-600";
            if (value >= 90) return "text-blue-600";
            if (value >= 80) return "text-yellow-600";
            if (value >= 60) return "text-orange-600";
            if (value >= 35) return "text-red-600";
            return "text-red-800";
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
                color: getPercentageColor(percent),
            },
        ].filter((e) => e);
    }, [localSelectedCity]);
    
    const handleChangeCity = (id: any) => {
        setLocalSelectedCity(filterById(citiesStatsArray, id));
    };
    
    return (
        <div ref={sectionRef}>
            <div ref={filterRef}>
                <CyclingInfrastructureByCity
                    cards={sortedCards}
                    data={{
                        title: "Estrutura nas cidades",
                        filters: sort_cities,
                    }}
                    options={{
                        changeFunction: handleChangeCity,
                        type: optionsType,
                    }}
                    selected={localSelectedCity?.id}
                />
            </div>
            
            {showFilterBar && (
                <div className="md:hidden fixed top-16 left-1/2 transform -translate-x-1/2 bg-[#008080] text-white py-2 px-6 rounded-lg shadow-lg z-40">
                    <div className="flex items-center">
                        <span className="text-sm font-medium mr-3">Dados:</span>
                        <select
                            value={city_sort}
                            onChange={(e) => sortCityAndType(e.target.value)}
                            className="text-sm border-0 rounded px-2 py-1 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-white"
                        >
                            {sort_cities[0].items.map((item: any) => (
                                <option key={item.value} value={item.value}>
                                    {item.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            )}
            
            {showFixedBar && (
                <div className="fixed top-16 left-1/2 transform -translate-x-1/2 bg-[#008080] text-white py-2 px-6 rounded-lg shadow-lg z-50">
                    <div className="flex items-center">
                        <span className="text-sm font-medium mr-3">Cidade selecionada:</span>
                        <select
                            value={localSelectedCity?.id || ''}
                            onChange={(e) => handleChangeCity(parseInt(e.target.value))}
                            className="text-sm border-0 rounded px-2 py-1 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-white"
                        >
                            {citiesStatsArray.map((city: any) => (
                                <option key={city.id} value={city.id}>
                                    {city.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            )}
            
            <StatisticsBox
                title={localSelectedCity?.name || ""}
                subtitle={"Estatísticas Gerais"}
                boxes={cityCycleStats}
            />
            
            <Table
                title={`Estruturas do PDC para ${localSelectedCity?.name || ""}`}
                data={localSelectedCity?.relations || []}
                columns={columns}
                showFilters={showFilters}
                setShowFilters={setShowFilters}
            />
        </div>
    );
}
    

    
    const ExtensionCell = ({ value }: any) => <>{<span>{IntlNumber2Digit(value)} km</span>}</>;
    
    const PercentageCell = ({ row }: any) => {
        const prevista = row.original.length || 0;
        const executada = row.original.has_cycleway_length || 0;
        const percentage = prevista > 0 ? (executada / prevista) * 100 : 0;
        
        let colorClass = 'text-red-600'; // Péssimo (0-25%)
        if (percentage >= 75) colorClass = 'text-green-600'; // Excelente (75-100%)
        else if (percentage >= 50) colorClass = 'text-yellow-600'; // Bom (50-75%)
        else if (percentage >= 25) colorClass = 'text-orange-600'; // Ruim (25-50%)
        
        return <span className={colorClass}>{percentage.toFixed(1)}%</span>;
    };
    
    const ExecutedTypologyCell = ({ value }: any) => {
        if (!value || value === 'none') {
            return <span>Nada executado</span>;
        }
        
        const validTypes = ['ciclofaixa', 'ciclorrota', 'ciclovia', 'calçada compartilhada'];
        const types = value.split(',').map((type: string) => type.trim().toLowerCase());
        const filteredTypes = types.filter((type: string) => 
            validTypes.includes(type) && type !== 'none'
        );
        
        if (filteredTypes.length === 0) {
            return <span>Nada executado</span>;
        }
        
        // Capitaliza primeira letra e formata com "e" para o último item
        const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);
        const capitalizedTypes = filteredTypes.map(capitalize);
        
        if (capitalizedTypes.length === 1) {
            return <span>{capitalizedTypes[0]}</span>;
        } else if (capitalizedTypes.length === 2) {
            return <span>{capitalizedTypes[0]} e {capitalizedTypes[1]}</span>;
        } else {
            const lastType = capitalizedTypes.pop();
            return <span>{capitalizedTypes.join(', ')} e {lastType}</span>;
        }
    };
    
    const ExecutedTypologyFilter = ({ column }: any) => {
        const { filterValue, setFilter, preFilteredRows, id } = column;
        const options = ['ciclofaixa', 'ciclorrota', 'ciclovia', 'calçada compartilhada', 'Nada executado'];
        
        return (
            <select
                className="my-2 max-w-sm text-gray-600 border-2 border-gray-300 bg-white h-10 px-5 pr-16 rounded-lg text-sm focus:outline-none"
                value={filterValue || ''}
                onChange={(e) => setFilter(e.target.value || undefined)}
            >
                <option value="">Todos tipos</option>
                {options.map((option, i) => (
                    <option key={i} value={option}>
                        {option}
                    </option>
                ))}
            </select>
        );
    };
    
    const ApproximateValueFilter = ({ column, placeholder }: any) => {
        const { filterValue, setFilter } = column;
        
        return (
            <input
                className="my-2 max-w-sm text-gray-600 border-2 border-gray-300 bg-white h-10 px-4 rounded-lg text-sm focus:outline-none"
                type="text"
                placeholder={placeholder}
                value={filterValue || ""}
                onChange={(e) => {
                    const value = e.target.value;
                    if (value && !isNaN(parseFloat(value))) {
                        setFilter(parseFloat(value));
                    } else {
                        setFilter(undefined);
                    }
                }}
            />
        );
    };

    const columns = React.useMemo(() => [
        {
            Header: "Nome da Via (COD)",
            accessor: "cod_name",
            Cell: ({ value }: any) => {
                if (!value) return <span>-</span>;
                
                // Remove quebras de linha e espaços extras
                const cleanValue = value.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
                
                // Verifica se tem código no início: (CODIGO) Nome
                const match = cleanValue.match(/^\(([^)]+)\)\s*(.+)$/);
                if (match) {
                    const cod = match[1];
                    let nome = match[2].trim();
                    // Adiciona espaço antes das barras para melhor formatação
                    nome = nome.replace(/\//g, ' / ');
                    return <span>{nome} ({cod})</span>;
                }
                
                return <span>{cleanValue}</span>;
            },
            sortType: (rowA: any, rowB: any) => {
                const extractName = (value: string) => {
                    if (!value) return '';
                    const cleanValue = value.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
                    const match = cleanValue.match(/^\(([^)]+)\)\s*(.+)$/);
                    return match ? match[2].trim() : cleanValue;
                };
                
                const nameA = extractName(rowA.values.cod_name).toLowerCase();
                const nameB = extractName(rowB.values.cod_name).toLowerCase();
                
                return nameA.localeCompare(nameB);
            },
            Filter: (props: any) => <ColumnFilter {...props} placeholder="Nome da via" />,
        },
        {
            Header: "Tipologia prevista",
            accessor: "pdc_typology",
            Filter: (props: any) => <SelectColumnFilter {...props} />,
        },
        {
            Header: "Extensão prevista",
            accessor: "length",
            Cell: ({ value }: any) => <ExtensionCell value={value} />,
            Filter: (props: any) => <ApproximateValueFilter {...props} placeholder="valor aproximado (km)" />,
            filter: (rows: any, id: any, filterValue: any) => {
                if (!filterValue) return rows;
                return rows.filter((row: any) => {
                    const rowValue = parseFloat(row.values[id]) || 0;
                    const searchValue = parseFloat(filterValue);
                    const tolerance = searchValue * 0.2; // 20% de tolerância
                    return Math.abs(rowValue - searchValue) <= tolerance;
                });
            },
        },
        {
            Header: "Tipologia executada",
            accessor: "typologies_str",
            Cell: ExecutedTypologyCell,
            Filter: (props: any) => <ExecutedTypologyFilter {...props} />,
            filter: (rows: any, id: any, filterValue: any) => {
                if (!filterValue) return rows;
                return rows.filter((row: any) => {
                    const cellValue = row.values[id] || '';
                    if (filterValue === 'Nada executado') {
                        return !cellValue || cellValue === 'none';
                    }
                    return cellValue.toLowerCase().includes(filterValue.toLowerCase());
                });
            },
        },
        {
            Header: () => (
                <div className="flex items-center">
                    <span>Extensão executada</span>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowPercentage(!showPercentage);
                        }}
                        className="ml-2 text-xs text-gray-500 hover:text-gray-700 transition-colors underline"
                        title={showPercentage ? "Mostrar em km" : "Mostrar em %"}
                    >
                        {showPercentage ? "%" : "km"}
                    </button>
                </div>
            ),
            accessor: "has_cycleway_length",
            Cell: showPercentage ? PercentageCell : ({ value }: any) => <ExtensionCell value={value} />,
            Filter: (props: any) => <ApproximateValueFilter {...props} placeholder={showPercentage ? "valor aproximado (%)" : "valor aproximado (km)"} />,
            filter: (rows: any, id: any, filterValue: any) => {
                if (!filterValue) return rows;
                return rows.filter((row: any) => {
                    const rowValue = parseFloat(row.values[id]) || 0;
                    const searchValue = parseFloat(filterValue);
                    const tolerance = searchValue * 0.2; // 20% de tolerância
                    return Math.abs(rowValue - searchValue) <= tolerance;
                });
            },
        },
    ], [showPercentage]);



    return (
        <>
            <Banner image={cover} alt="Capa da página dos dados, de execuções cicloviárias, na região metropolitana do recife." />
            <Breadcrumb label="Execução Cicloviária" slug="/dados/execucaocicloviaria" routes={["/", "/dados"]} />
            <Suspense fallback={<StatisticsBoxLoading />}>
                <Await resolve={statsPromise}>
                    {(boxes) => (
                        <StatisticsBox
                            title={"Execução Cicloviária"}
                            subtitle={"da Região Metropolitana do Recife"}
                            boxes={boxes}
                        />
                    )}
                </Await>
            </Suspense>
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
            <Suspense fallback={<MapLoading />}>
                <Await resolve={citiesPromise}>
                    {(citiesStats) => (
                        <PDCMap 
                            layerData={allCitiesLayer} 
                            layersConf={layersConf as LayerProps[]} 
                            citiesStats={citiesStats} 
                        />
                    )}
                </Await>
            </Suspense>
            <div ref={sectionRef}>
                <Suspense fallback={<CityStructureLoading />}>
                    <Await resolve={citiesPromise}>
                        {(citiesStats) => (
                            <CityContent 
                                citiesStats={citiesStats}
                                filterRef={filterRef}
                                sort_cities={sort_cities}
                                city_sort={city_sort}
                                optionsType={optionsType}
                                changeCity={changeCity}
                                selectedCity={selectedCity}
                                setCity={setCity}
                                sortCityAndType={sortCityAndType}
                                showPercentage={showPercentage}
                                setShowPercentage={setShowPercentage}
                                showFilters={showFilters}
                                setShowFilters={setShowFilters}
                                columns={columns}
                            />
                        )}
                    </Await>
                </Suspense>
            </div>


            <CardsSession title={documents.title} cards={documents.cards} />
        </>
    );
}