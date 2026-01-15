import { useLoaderData } from "@remix-run/react";
import { useState, useEffect } from "react";
import Banner from "~/components/Commom/Banner";
import Breadcrumb from "~/components/Commom/Breadcrumb";
import { ExplanationBoxes } from "~/components/Dados/ExplanationBoxes";
import { loader } from "~/loader/dados.loa";
import Chart from "react-google-charts";
import Table, { NumberRangeColumnFilter } from "~/components/Commom/Table/Table";
import { formatLargeValue } from "~/utils/formatCurrency";
import { ApiStatusHandler } from "~/components/Commom/ApiStatusHandler";
import { useApiStatus } from "~/contexts/ApiStatusContext";
import { CardLoading, ChartLoading } from "~/components/Dom/LoaDataLoading";
export { loader };

export default function Loa() {
    const data = useLoaderData<any>();
    const [showFilters, setShowFilters] = useState(false);
    const [filterType, setFilterType] = useState<'all' | 'good' | 'bad'>('all');
    const { setApiDown, addApiError } = useApiStatus();

    useEffect(() => {
        if (data?.apiDown) {
            setApiDown(true);
        }
        if (data?.apiErrors?.length > 0) {
            data.apiErrors.forEach((error: {url: string, error: string}) => {
                addApiError(error.url, error.error, '/dados/loa');
            });
        }
    }, []);

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

    const actions2025 = data?.actions2025 || [];
    const hasData = actions2025.length > 0 && !data?.apiDown;
    const climateActions = actions2025.filter((action: any) => {
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

    const totalStateBudget = actions2025.reduce((sum: number, action: any) => {
        const value = Number(action?.vlrdotatualizada) || 0;
        return sum + value;
    }, 0);

    const allColumns = [
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
    ];

    const columns = [
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
    ];



    return (
        <>
            <Banner image="/images/banners/faq.png" alt="Capa da página do Loaclima" />
            <Breadcrumb label="LOA" slug="/dados/loa" routes={["/", "/dados"]} />
            <ApiStatusHandler apiDown={data?.apiDown} />
            <ExplanationBoxes boxes={[{ title: "O que temos aqui?", description: data?.description || "Carregando..." }]} />


            <div className="container mx-auto px-4 py-6">
                <section className="mb-10">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Investimentos e Emissões</h2>
                    <p className="text-gray-600 mb-4">Comparação entre os valores destinados a ações climáticas, orçamento total e custo por emissão de carbono.</p>

                    {!hasData ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                            <CardLoading />
                            <CardLoading />
                            <CardLoading />
                        </div>
                    ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                        <div className="bg-white rounded-lg shadow-lg p-4 border-l-8 border-green-600" aria-label="Investimento em ações climáticas">
                            <div className="mb-2 inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Ações climáticas</div>
                            <h3 className="text-3xl font-bold mb-1 flex items-baseline">
                                <span>{totalClimateBudgeted >= 1000000000 ? (totalClimateBudgeted / 1000000000).toFixed(1).replace('.0', '') : totalClimateBudgeted >= 1000000 ? (totalClimateBudgeted / 1000000).toFixed(1).replace('.0', '') : totalClimateBudgeted.toFixed(0)}</span>
                                <span className="text-xl ml-1">{totalClimateBudgeted >= 1000000000 ? 'Bi' : totalClimateBudgeted >= 1000000 ? 'Mi' : ''}</span>
                            </h3>
                            <p className="text-base mb-1">Recursos destinados a programas de sustentabilidade e meio ambiente</p>
                        </div>

                        <div className="bg-white rounded-lg shadow-lg p-4 border-l-8 border-red-600" aria-label="Orçamento total do estado">
                            <div className="mb-2 inline-block px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">Orçamento total</div>
                            <h3 className="text-3xl font-bold mb-1 flex items-baseline">
                                <span>{totalStateBudget >= 1000000000 ? (totalStateBudget / 1000000000).toFixed(1).replace('.0', '') : totalStateBudget >= 1000000 ? (totalStateBudget / 1000000).toFixed(1).replace('.0', '') : totalStateBudget.toFixed(0)}</span>
                                <span className="text-xl ml-1">{totalStateBudget >= 1000000000 ? 'Bi' : totalStateBudget >= 1000000 ? 'Mi' : ''}</span>
                            </h3>
                            <p className="text-base mb-1">Soma de todos os recursos públicos estaduais</p>
                        </div>

                        <div className="bg-white rounded-lg shadow-lg p-4 border-l-8 border-blue-600" aria-label="Custo por tonelada de CO2 equivalente">
                            <div className="mb-2 inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">Emissão de carbono</div>
                            <h3 className="text-3xl font-bold mb-1">R$ 1400 Mil / CO2e</h3>
                            <p className="text-base mb-1">Valor investido para cada tonelada de CO2 reduzida</p>
                            <p className="text-xs text-gray-500 mt-2">Fonte: <a href="https://semas.pe.gov.br/grafico-inventario-gee/" className="text-ameciclo hover:underline">semas.pe.gov.br</a></p>
                        </div>
                    </div>
                    )}
                </section>

                <section className="mb-10">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Orçado vs. Executado em Ações Climáticas</h2>
                    <p className="text-gray-600 mb-4">Comparação entre o valor planejado no orçamento e o valor efetivamente executado em ações para o clima.</p>

                    {!hasData ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                            <CardLoading />
                            <CardLoading />
                        </div>
                    ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                        <div className="bg-white rounded-lg shadow-lg p-4 border-l-8 border-ameciclo">
                            <div className="mb-2 inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Valor Orçado 2025</div>
                            <h3 className="text-3xl font-bold mb-1 flex items-baseline">
                                <span>{totalClimateBudgeted >= 1000000000 ? (totalClimateBudgeted / 1000000000).toFixed(1).replace('.0', '') : totalClimateBudgeted >= 1000000 ? (totalClimateBudgeted / 1000000).toFixed(1).replace('.0', '') : totalClimateBudgeted.toFixed(0)}</span>
                                <span className="text-xl ml-1">{totalClimateBudgeted >= 1000000000 ? 'Bi' : totalClimateBudgeted >= 1000000 ? 'Mi' : ''}</span>
                            </h3>
                            <p className="text-base mb-1">Dotação orçamentária aprovada para políticas ambientais em 2025</p>
                        </div>

                        <div className="bg-white rounded-lg shadow-lg p-4 border-l-8 border-gray-400">
                            <div className="mb-2 inline-block px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">Valor Executado 2025</div>
                            <h3 className="text-3xl font-bold mb-1 flex items-baseline">
                                <span>{totalClimateExecuted >= 1000000000 ? (totalClimateExecuted / 1000000000).toFixed(1).replace('.0', '') : totalClimateExecuted >= 1000000 ? (totalClimateExecuted / 1000000).toFixed(1).replace('.0', '') : totalClimateExecuted.toFixed(0)}</span>
                                <span className="text-xl ml-1">{totalClimateExecuted >= 1000000000 ? 'Bi' : totalClimateExecuted >= 1000000 ? 'Mi' : ''}</span>
                            </h3>
                            <p className="text-base mb-1">Recursos efetivamente pagos em programas climáticos em 2025</p>
                        </div>
                    </div>
                    )}
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
                    {!hasData ? (
                        <>
                            <ChartLoading />
                            <ChartLoading />
                        </>
                    ) : (
                    <>
                    <section className="h-auto">
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Evolução Orçamentária Climática</h2>
                        <p className="text-gray-600 mb-4">Análise comparativa dos valores orçados e executados em ações para o clima ao longo dos anos entre 2020 e 2025.</p>

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
                                            subtitle: "Comparativo anual 2020-2025",
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
                                            subtitle: "Orçamento total 2020-2025",
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
                    </>)}
                </div>
                <section>
                    {(() => {
                                    const processedActions = actions2025.map((action: any) => {
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
                    {actions2025.length > 0 ? `ATUALIZADO: ${new Date().toLocaleDateString('pt-BR')}` : 'Dados não disponíveis'}
                </div>
            </div>
        </>
    );
}