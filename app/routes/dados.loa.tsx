import { useLoaderData, Await } from "@remix-run/react";
import { useEffect, useState, Suspense } from "react";
import Banner from "~/components/Commom/Banner";
import Breadcrumb from "~/components/Commom/Breadcrumb";
import LazyLoad from 'react-lazyload';
import { ExplanationBoxes } from "~/components/Dados/ExplanationBoxes";
import Loading from "~/components/Dom/Loading";
import LoaLoading from "~/components/Dom/LoaLoading";
import { loader } from "~/loader/dados.observatorio.loa";
import Chart from "react-google-charts";
import Table, { NumberRangeColumnFilter } from "~/components/Commom/Table/Table";
import { useMemo } from "react";
import { formatLargeValue } from "~/utils/formatCurrency";
export { loader };

export default function Loa() {
    const { cover, description, totalValueEmissions, dataPromise } = useLoaderData<any>();
    const [showFilters, setShowFilters] = useState(false);
    const [filterType, setFilterType] = useState<'all' | 'good' | 'bad'>('all');

    const numParse = (numero: any) => numero.toLocaleString('pt-BR', { minimumFractionDigits: 2 });

    const goodActionsTags = ["0398", "3308", "3378", "3382", "3389", "3786", "3891", "3906", "4122", "4123", "4165", "4167", "4185", "4294", "4313", "4482", "4648", "3198", "3340", "4202", "4642", "4646", "4176", "4483", "4166", "4074", "4055", "3721", "3725", "2755", "2796", "2286", "0569", "3877", "4131", "4235", "4679", "4682", "1313", "2967", "2730", "2733", "4650", "4669", "1537", "3178", "3187", "4116", "4440", "1896"];

    const badActionsTags = [
        "4067", "4218", "1045", "3882", "4096", "4134", "4186", "4227"
    ];

    const getActionCode = (action: any) => {
        const match = action.cd_nm_acao.match(/^(\d+)/);
        return match ? match[1] : '';
    };

    const classifyAction = (action: any) => {
        const actionCode = getActionCode(action);
        if (goodActionsTags.includes(actionCode)) {
            return 'good';
        } else if (badActionsTags.includes(actionCode)) {
            return 'bad';
        }
        return undefined;
    };

    // Remove this useMemo since we're now handling data inside Await

    const allColumns = useMemo(
        () => [
            {
                Header: "Função",
                accessor: "cd_nm_funcao",
            },
            {
                Header: "Programa",
                accessor: "cd_nm_prog",
            },
            {
                Header: "Ação",
                accessor: "cd_nm_acao",
            },
            {
                Header: "Sub-ação",
                accessor: "cd_nm_subacao",
            },
            {
                Header: "Sub-função",
                accessor: "cd_nm_subfuncao",
            },
            {
                Header: "Dotação Atualizada",
                accessor: "vlrdotatualizada",
                Cell: ({ value }: any) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
            },
            {
                Header: "Valor Empenhado",
                accessor: "vlrempenhado",
                Cell: ({ value }: any) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
            },
            {
                Header: "Valor Liquidado",
                accessor: "vlrliquidado",
                Cell: ({ value }: any) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
            },
            {
                Header: "Total Pago",
                accessor: "vlrtotalpago",
                Cell: ({ value }: any) => formatLargeValue(value),
                Filter: NumberRangeColumnFilter,
                filter: 'numberRange',
            },
        ],
        []
    );

    const columns = useMemo(
        () => [
            {
                Header: "Ação",
                accessor: "cd_nm_acao",
            },
            {
                Header: "Sub-ação",
                accessor: "cd_nm_subacao",
            },
            {
                Header: "Total Empenhado",
                accessor: "vlrdotatualizada",
                Cell: ({ value }: any) => formatLargeValue(value),
                Filter: NumberRangeColumnFilter,
                filter: 'numberRange',
            },
            {
                Header: "Total Pago",
                accessor: "vlrtotalpago",
                Cell: ({ value }: any) => formatLargeValue(value),
                Filter: NumberRangeColumnFilter,
                filter: 'numberRange',
            },
        ],
        []
    );

    function AnimatedNumber({ initialValue, finalValue, duration }: any) {
        const [value, setValue] = useState(initialValue);

        useEffect(() => {
            const increment = (finalValue - initialValue) / (duration / 10);

            const interval = setInterval(() => {
                setValue((prevValue: any) => {
                    const newValue = prevValue + increment;
                    return newValue >= finalValue ? finalValue : newValue;
                });
            }, 10);

            return () => {
                clearInterval(interval);
            };
        }, [initialValue, finalValue, duration]);

        return `${numParse(value)}`;
    }



    return (
        <>
            <Banner image="/images/banners/faq.png" alt="Capa da página do Loaclima" />
            <Breadcrumb label="LOA" slug="/dados/loa" routes={["/", "/dados"]} />
            <ExplanationBoxes boxes={[{ title: "O que temos aqui?", description: "O LOA Clima é um projeto de Incidência Política nas Leis Orçamentárias do Governo do Estado de Pernambuco. O projeto abarca a análise da aplicação de recursos do último Plano Plurianual do Governo do Estado de Pernambuco, bem como a proposição de um arcabouço orçamentário que promova justiça climática. Serão realizadas atividades de formação e alinhamento de propostas com a sociedade civil organizada, de articulação com secretarias estaduais para proposição de itens orçamentários e de articulação com a Assembleia Legislativa Estadual para a proposição de emendas." }]} />

            <Suspense fallback={
                <>
                    <div className="animate-pulse bg-gray-300 h-64 w-full mb-4"></div>
                    <div className="container mx-auto px-4 py-8">
                        <div className="animate-pulse">
                            <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                                <div className="h-6 bg-gray-300 rounded w-48 mb-4"></div>
                                <div className="space-y-2">
                                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <LoaLoading />
                </>
            }>
                <Await resolve={dataPromise} errorElement={
                    <div className="container mx-auto px-4 py-8">
                        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                            <h2 className="text-xl font-semibold text-red-800 mb-2">Erro ao carregar dados</h2>
                            <p className="text-red-600 mb-4">Não foi possível carregar os dados do LOA Clima no momento.</p>
                            <button 
                                onClick={() => window.location.reload()} 
                                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
                            >
                                Tentar novamente
                            </button>
                        </div>
                    </div>
                }>
                    {(data) => {
                        // Calculate totals from API data with error handling
                        const actions2023 = data?.actions2023 || [];
                        const climateActions = actions2023.filter((action: any) => {
                            try {
                                const actionCode = getActionCode(action);
                                return goodActionsTags.includes(actionCode);
                            } catch (error) {
                                console.warn('Error processing action:', action, error);
                                return false;
                            }
                        });
                        
                        const totalClimateBudgeted = climateActions.reduce((sum: number, action: any) => {
                            const value = Number(action?.vlrdotatualizada) || 0;
                            return sum + value;
                        }, 0);
                        
                        const totalClimateExecuted = climateActions.reduce((sum: number, action: any) => {
                            const value = Number(action?.vlrtotalpago) || 0;
                            return sum + value;
                        }, 0);
                        
                        const totalStateBudget = actions2023.reduce((sum: number, action: any) => {
                            const value = Number(action?.vlrdotatualizada) || 0;
                            return sum + value;
                        }, 0);
                        
                        return (
                            <div className="container mx-auto px-4 py-6">
                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Investimentos e Emissões</h2>
                        <p className="text-gray-600 mb-4">Comparação entre os valores destinados a ações climáticas, orçamento total e custo por emissão de carbono.</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                            <div className="bg-white rounded-lg shadow-lg p-4 border-l-8 border-green-600" aria-label="Investimento em ações climáticas">
                                <LazyLoad height={300} offset={0}>
                                    <h3 className="text-3xl font-bold mb-1 flex items-baseline">
                                        <span>{totalClimateBudgeted >= 1000000000 ? (totalClimateBudgeted / 1000000000).toFixed(1).replace('.0', '') : totalClimateBudgeted >= 1000000 ? (totalClimateBudgeted / 1000000).toFixed(1).replace('.0', '') : totalClimateBudgeted.toFixed(0)}</span>
                                        <span className="text-xl ml-1">{totalClimateBudgeted >= 1000000000 ? 'Bi' : totalClimateBudgeted >= 1000000 ? 'Mi' : ''}</span>
                                    </h3>
                                    <p className="text-base mb-1">Investimento em ações climáticas:</p>
                                    <p className="text-lg font-semibold">{formatLargeValue(totalClimateBudgeted)}</p>
                                    <div className="mt-2 inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Ações climáticas</div>
                                </LazyLoad>
                            </div>

                            <div className="bg-white rounded-lg shadow-lg p-4 border-l-8 border-red-600" aria-label="Orçamento total do estado">
                                <LazyLoad height={300} offset={0}>
                                    <h3 className="text-3xl font-bold mb-1 flex items-baseline">
                                        <span>{totalStateBudget >= 1000000000 ? (totalStateBudget / 1000000000).toFixed(1).replace('.0', '') : totalStateBudget >= 1000000 ? (totalStateBudget / 1000000).toFixed(1).replace('.0', '') : totalStateBudget.toFixed(0)}</span>
                                        <span className="text-xl ml-1">{totalStateBudget >= 1000000000 ? 'Bi' : totalStateBudget >= 1000000 ? 'Mi' : ''}</span>
                                    </h3>
                                    <p className="text-base mb-1">Orçamento total do estado:</p>
                                    <p className="text-lg font-semibold">{formatLargeValue(totalStateBudget)}</p>
                                    <div className="mt-2 inline-block px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">Orçamento total</div>
                                </LazyLoad>
                            </div>

                            <div className="bg-white rounded-lg shadow-lg p-4 border-l-8 border-blue-600" aria-label="Custo por tonelada de CO2 equivalente">
                                <LazyLoad height={300} offset={0}>
                                    <h3 className="text-3xl font-bold mb-1">R$ {totalClimateExecuted > 0 ? (totalClimateExecuted / 154300).toFixed(0) : '3'} Mil / CO2e</h3>
                                    <p className="text-base mb-1">Custo por tonelada de CO2 equivalente</p>
                                    <p className="text-lg font-semibold">R$ {totalClimateExecuted > 0 ? (totalClimateExecuted / 154300).toLocaleString('pt-BR', { minimumFractionDigits: 3 }) : '3.045,975'}</p>
                                    <div className="mt-2 inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">Emissão de carbono</div>
                                    <p className="text-xs text-gray-500 mt-2">Fonte: <a href="https://semas.pe.gov.br/grafico-inventario-gee/" className="text-ameciclo hover:underline">semas.pe.gov.br</a></p>
                                </LazyLoad>
                            </div>
                        </div>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Orçado vs. Executado em Ações Climáticas</h2>
                        <p className="text-gray-600 mb-4">Comparação entre o valor planejado no orçamento e o valor efetivamente executado em ações para o clima.</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                            <div className="bg-white rounded-lg shadow-lg p-4 border-l-8 border-ameciclo">
                                <LazyLoad height={300} offset={0}>
                                    <h3 className="text-3xl font-bold mb-1 flex items-baseline">
                                        <span>{totalClimateBudgeted >= 1000000000 ? (totalClimateBudgeted / 1000000000).toFixed(1).replace('.0', '') : totalClimateBudgeted >= 1000000 ? (totalClimateBudgeted / 1000000).toFixed(1).replace('.0', '') : totalClimateBudgeted.toFixed(0)}</span>
                                        <span className="text-xl ml-1">{totalClimateBudgeted >= 1000000000 ? 'Bi' : totalClimateBudgeted >= 1000000 ? 'Mi' : ''}</span>
                                    </h3>
                                    <p className="text-base mb-1">Orçamento planejado para ações climáticas:</p>
                                    <p className="text-lg font-semibold">{formatLargeValue(totalClimateBudgeted)}</p>
                                </LazyLoad>
                            </div>

                            <div className="bg-white rounded-lg shadow-lg p-4 border-l-8 border-gray-400">
                                <LazyLoad height={300} offset={0}>
                                    <h3 className="text-3xl font-bold mb-1 flex items-baseline">
                                        <span>{totalClimateExecuted >= 1000000000 ? (totalClimateExecuted / 1000000000).toFixed(1).replace('.0', '') : totalClimateExecuted >= 1000000 ? (totalClimateExecuted / 1000000).toFixed(1).replace('.0', '') : totalClimateExecuted.toFixed(0)}</span>
                                        <span className="text-xl ml-1">{totalClimateExecuted >= 1000000000 ? 'Bi' : totalClimateExecuted >= 1000000 ? 'Mi' : ''}</span>
                                    </h3>
                                    <p className="text-base mb-1">Orçamento executado em ações climáticas:</p>
                                    <p className="text-lg font-semibold">{formatLargeValue(totalClimateExecuted)}</p>
                                </LazyLoad>
                            </div>
                        </div>
                    </section>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
                        <section className="h-auto">
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">Evolução Orçamentária Climática</h2>
                            <p className="text-gray-600 mb-4">Análise comparativa dos valores orçados e executados em ações para o clima ao longo dos anos.</p>

                            <div className="bg-white rounded-lg shadow-lg p-4 mb-6 flex justify-center">
                                <div className="w-full max-w-[500px]">
                                    <Chart
                                        chartType="Bar"
                                        data={[
                                            ["Ano", "Orçado (R$)", 'Executado (R$)'],
                                            ['2020', data.totalValueBudgeted2020, data.totalValueExecuted2020],
                                            ['2021', data.totalValueBudgeted2021, data.totalValueExecuted2021],
                                            ['2022', data.totalValueBudgeted2022, data.totalValueExecuted2022],
                                            ['2023', data.totalValueBudgeted2023, data.totalValueExecuted2023],
                                            ['2024', data.totalValueBudgeted2024, data.totalValueExecuted2024],
                                            ['2025', data.totalValueBudgeted2025, data.totalValueExecuted2025],
                                        ]}
                                        width="100%"
                                        height="300px"
                                        options={{
                                            chart: {
                                                subtitle: "Comparativo anual 2020-2023",
                                            },
                                            colors: ['#38A169', '#3182CE'],
                                            accessibility: {
                                                highContrastMode: true
                                            },
                                            legend: {
                                                position: 'bottom',
                                                alignment: 'center',
                                                textStyle: {
                                                    fontSize: 13,
                                                    color: '#333333'
                                                }
                                            },
                                            hAxis: {
                                                textStyle: {
                                                    fontSize: 13,
                                                    color: '#333333'
                                                }
                                            },
                                            vAxis: {
                                                textStyle: {
                                                    fontSize: 13,
                                                    color: '#333333'
                                                },
                                                format: 'short'
                                            },
                                            chartArea: {
                                                width: '80%',
                                                height: '70%'
                                            }
                                        }}
                                        legendToggle
                                    />
                                </div>
                            </div>
                        </section>

                        <section className="h-auto">
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">Orçamento Total por Ano</h2>
                            <p className="text-gray-600 mb-4">Evolução do orçamento total do estado para todas as ações entre 2020 e 2025</p>

                            <div className="bg-white rounded-lg shadow-lg p-4 mb-6 flex justify-center">
                                <div className="w-full max-w-[500px]">
                                    <Chart
                                        chartType="Bar"
                                        data={[
                                            ["Ano", "Total (R$)"],
                                            ['2020', data.totalValueActions2020],
                                            ['2021', data.totalValueActions2021],
                                            ['2022', data.totalValueActions2022],
                                            ['2023', data.totalValueActions2023],
                                            ['2024', data.totalValueActions2024],
                                            ['2025', data.totalValueActions2025],
                                        ]}
                                        width="100%"
                                        height="300px"
                                        options={{
                                            chart: {
                                                subtitle: "Orçamento total 2020-2023",
                                            },
                                            colors: ['#3182CE'],
                                            accessibility: {
                                                highContrastMode: true
                                            },
                                            legend: {
                                                position: 'bottom',
                                                alignment: 'center',
                                                textStyle: {
                                                    fontSize: 13,
                                                    color: '#333333'
                                                }
                                            },
                                            chartArea: {
                                                width: '80%',
                                                height: '70%'
                                            },
                                            vAxis: {
                                                format: 'short'
                                            }
                                        }}
                                        legendToggle
                                    />
                                </div>
                            </div>
                        </section>
                    </div>
                            <section>
                                {(() => {
                                    const processedActions = actions2023.map((action: any) => {
                                        try {
                                            return {
                                                ...action,
                                                type: classifyAction(action)
                                            };
                                        } catch (error) {
                                            console.warn('Error processing action for table:', action, error);
                                            return {
                                                ...action,
                                                type: undefined
                                            };
                                        }
                                    });
                                    
                                    let filteredActions = processedActions;
                                    if (filterType === 'good') {
                                        filteredActions = processedActions.filter((action: any) => action.type === 'good');
                                    } else if (filterType === 'bad') {
                                        filteredActions = processedActions.filter((action: any) => action.type === 'bad');
                                    }
                                    
                                    return (
                                        <Table 
                                            title="Ações e Programas da LOA" 
                                            data={filteredActions} 
                                            columns={columns} 
                                            allColumns={allColumns} 
                                            showFilters={showFilters} 
                                            setShowFilters={setShowFilters} 
                                            filterType={filterType}
                                            setFilterType={setFilterType}
                                            classifyAction={classifyAction}
                                        />
                                    );
                                })()}
                            </section>
                    <section className="bg-gray-50 rounded-lg p-4 mb-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div>
                                <h3 className="text-xl font-bold mb-3 text-gray-800">Documentos Orçamentários</h3>
                                <ul className="space-y-2">
                                    <li><a href="https://dados.pe.gov.br/dataset/acoes-e-programas" target="_blank" rel="noopener noreferrer" className="text-ameciclo hover:underline focus:outline-none focus:ring-2 focus:ring-ameciclo">Ações e programas - Portal de Dados Abertos de Pernambuco</a></li>
                                    <li><a href="https://dados.pe.gov.br/dataset/despesas-gerais" target="_blank" rel="noopener noreferrer" className="text-ameciclo hover:underline focus:outline-none focus:ring-2 focus:ring-ameciclo">Despesas gerais - Portal de Dados Abertos de Pernambuco</a></li>
                                    <li><a href="https://dados.pe.gov.br/dataset/all-pagamentos" target="_blank" rel="noopener noreferrer" className="text-ameciclo hover:underline focus:outline-none focus:ring-2 focus:ring-ameciclo">Pagamentos - Portal de Dados Abertos de Pernambuco</a></li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="text-xl font-bold mb-3 text-gray-800">Documentos Climáticos</h3>
                                <ul className="space-y-2">
                                    <li><a href="https://semas.pe.gov.br/wp-content/uploads/2022/03/2022_03_16_GIZ_plano_descarbonizacao_pernambuco-v6_reduzido.pdf" className="text-ameciclo hover:underline focus:outline-none focus:ring-2 focus:ring-ameciclo">Plano de descarbonização de Pernambuco</a></li>
                                    <li><a href="https://www.gov.br/mma/pt-br/assuntos/climaozoniodesertificacao/clima/diretrizes-para-uma-estrategia-nacional-para-neutralidade-climatica_.pdf" className="text-ameciclo hover:underline focus:outline-none focus:ring-2 focus:ring-ameciclo">Diretrizes para neutralidade climática</a></li>
                                    <li><a href="https://semas.pe.gov.br/grafico-inventario-gee/" className="text-ameciclo hover:underline focus:outline-none focus:ring-2 focus:ring-ameciclo">Gráfico – Inventário de Gases de Efeito Estufa de Pernambuco</a></li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="text-xl font-bold mb-3 text-gray-800">Baixe os Dados</h3>
                                <ul className="space-y-2">
                                    <li><a href="https://dados.pe.gov.br/dataset/acoes-e-programas/resource/bd2f90f2-3cc1-4b46-ab8d-9b15a1b0d453" className="text-ameciclo hover:underline focus:outline-none focus:ring-2 focus:ring-ameciclo">Ações e Programas - 2025</a></li>
                                    <li><a href="https://dados.pe.gov.br/dataset/acoes-e-programas/resource/6d2fff01-6bb7-43c2-baea-c82a5cdfb206" className="text-ameciclo hover:underline focus:outline-none focus:ring-2 focus:ring-ameciclo">Ações e Programas - 2024</a></li>
                                    <li><a href="https://dados.pe.gov.br/dataset/acoes-e-programas/resource/421e1035-ef96-4ac9-99cc-07a34ab93444" className="text-ameciclo hover:underline focus:outline-none focus:ring-2 focus:ring-ameciclo">Ações e Programas - 2023</a></li>
                                    <li><a href="https://dados.pe.gov.br/dataset/38401a88-5a99-4b21-99d2-2d4a36a241f1/resource/55784447-97e8-4fb0-b062-99c368bf6384/download/acoes_e_programas_json_2022_20221231.json" className="text-ameciclo hover:underline focus:outline-none focus:ring-2 focus:ring-ameciclo">Ações e Programas - 2022</a></li>
                                    <li><a href="https://dados.pe.gov.br/dataset/38401a88-5a99-4b21-99d2-2d4a36a241f1/resource/0a2e8fd7-7a65-46df-bd1b-15f2dfaaded7/download/acoes_e_programas_json_2021_20211231.json" className="text-ameciclo hover:underline focus:outline-none focus:ring-2 focus:ring-ameciclo">Ações e Programas - 2021</a></li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    <div className="text-right text-sm text-gray-500 mb-2">
                        {actions2023.length > 0 ? `ATUALIZADO: ${new Date().toLocaleDateString('pt-BR')}` : 'Dados não disponíveis'}
                    </div>
                            </div>
                        );
                    }}
                </Await>
            </Suspense>
        </>
    );
}