import { useLoaderData } from "@remix-run/react";
import { useEffect, useState } from "react";
import Banner from "~/components/Commom/Banner";
import Breadcrumb from "~/components/Commom/Breadcrumb";
import LazyLoad from 'react-lazyload';
import { ExplanationBoxes } from "~/components/Dados/ExplanationBoxes";
import Loading from "~/components/Dom/Loading";
import { loader } from "~/loader/dados.observatorio.loa";
import Chart from "react-google-charts";
import LoaTable from "~/components/Dados/LoaTable";
export { loader };

export default function Loa() {
    const { 
        cover, 
        description, 
        totalValueBudgeted2020, 
        totalValueBudgeted2021, 
        totalValueBudgeted2022, 
        totalValueBudgeted2023, 
        totalValueExecuted2020, 
        totalValueExecuted2021, 
        totalValueExecuted2022, 
        totalValueExecuted2023, 
        totalValueActions2020, 
        totalValueActions2021, 
        totalValueActions2022, 
        totalValueActions2023, 
        totalValueBudgeted2024, 
        totalValueBudgeted2025, 
        totalValueExecuted2024, 
        totalValueExecuted2025, 
        totalValueActions2024, 
        totalValueActions2025, 
        totalValueEmissions, 
        actions2023 
    } = useLoaderData<any>();
    const [renderOthers, setRenderOthers] = useState(false);

    useEffect(() => {
        const timeout = setTimeout(() => {
            setRenderOthers(true);
        }, 2000);

        return () => clearTimeout(timeout);
    }, []);

    const numParse = (numero: any) => numero.toLocaleString('pt-BR', { minimumFractionDigits: 2 });

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
            <Banner image={cover?.url} alt="Capa da página do Loaclima" />
            <Breadcrumb label="LOA" slug="/dados/loa" routes={["/", "/dados"]} />
            <ExplanationBoxes boxes={[{ title: "O que temos aqui?", description }]} />

            {renderOthers ? (
                <div className="container mx-auto px-4 py-6">
                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Investimentos e Emissões</h2>
                        <p className="text-gray-600 mb-4">Comparação entre os valores destinados a ações climáticas, orçamento total e custo por emissão de carbono.</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                            <div className="bg-white rounded-lg shadow-lg p-4 border-l-8 border-green-600" aria-label="Investimento em ações climáticas">
                                <LazyLoad height={300} offset={0}>
                                    <h3 className="text-3xl font-bold mb-1 flex items-baseline">
                                        <span>0.5</span>
                                        <span className="text-xl ml-1">Bi</span>
                                    </h3>
                                    <p className="text-base mb-1">Investimento em ações climáticas:</p>
                                    <p className="text-lg font-semibold">R$ 469.843.274,04</p>
                                    <div className="mt-2 inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Ações climáticas</div>
                                </LazyLoad>
                            </div>

                            <div className="bg-white rounded-lg shadow-lg p-4 border-l-8 border-red-600" aria-label="Orçamento total do estado">
                                <LazyLoad height={300} offset={0}>
                                    <h3 className="text-3xl font-bold mb-1 flex items-baseline">
                                        <span>52.2</span>
                                        <span className="text-xl ml-1">Bi</span>
                                    </h3>
                                    <p className="text-base mb-1">Orçamento total do estado:</p>
                                    <p className="text-lg font-semibold">R$ 52.195.938.993,61</p>
                                    <div className="mt-2 inline-block px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">Orçamento total</div>
                                </LazyLoad>
                            </div>

                            <div className="bg-white rounded-lg shadow-lg p-4 border-l-8 border-blue-600" aria-label="Custo por tonelada de CO2 equivalente">
                                <LazyLoad height={300} offset={0}>
                                    <h3 className="text-3xl font-bold mb-1">R$ 3 Mil / CO2e</h3>
                                    <p className="text-base mb-1">Custo por tonelada de CO2 equivalente</p>
                                    <p className="text-lg font-semibold">R$ 3.045,975</p>
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
                                        <span>469.8</span>
                                        <span className="text-xl ml-1">Mi</span>
                                    </h3>
                                    <p className="text-base mb-1">Orçamento planejado para ações climáticas:</p>
                                    <p className="text-lg font-semibold">R$ 469.843.274,04</p>
                                </LazyLoad>
                            </div>

                            <div className="bg-white rounded-lg shadow-lg p-4 border-l-8 border-gray-400">
                                <LazyLoad height={300} offset={0}>
                                    <h3 className="text-3xl font-bold mb-1 flex items-baseline">
                                        <span>178.3</span>
                                        <span className="text-xl ml-1">Mi</span>
                                    </h3>
                                    <p className="text-base mb-1">Orçamento executado em ações climáticas:</p>
                                    <p className="text-lg font-semibold">R$ 178.252.296,04</p>
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
                                            ['2020', totalValueBudgeted2020, totalValueExecuted2020],
                                            ['2021', totalValueBudgeted2021, totalValueExecuted2021],
                                            ['2022', totalValueBudgeted2022, totalValueExecuted2022],
                                            ['2023', totalValueBudgeted2023, totalValueExecuted2023],
                                            ['2024', totalValueBudgeted2024, totalValueExecuted2024],
                                            ['2025', totalValueBudgeted2025, totalValueExecuted2025],
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
                            <p className="text-gray-600 mb-4">Evolução do orçamento total do estado para todas as ações entre 2020 e 2023.</p>

                            <div className="bg-white rounded-lg shadow-lg p-4 mb-6 flex justify-center">
                                <div className="w-full max-w-[500px]">
                                    <Chart
                                        chartType="Bar"
                                        data={[
                                            ["Ano", "Total (R$)"],
                                            ['2020', totalValueActions2020],
                                            ['2021', totalValueActions2021],
                                            ['2022', totalValueActions2022],
                                            ['2023', totalValueActions2023],
                                            ['2024', totalValueActions2024],
                                            ['2025', totalValueActions2025],
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
                        <LoaTable actions={actions2023} />
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
                                    <li><a href="https://dados.pe.gov.br/dataset/38401a88-5a99-4b21-99d2-2d4a36a241f1/resource/bd2f90f2-3cc1-4b46-ab8d-9b15a1b0d453/download/acoes_e_programas_json_2023_20231010.json" className="text-ameciclo hover:underline focus:outline-none focus:ring-2 focus:ring-ameciclo">Ações e Programas - 10/10/2023</a></li>
                                    <li><a href="https://dados.pe.gov.br/dataset/38401a88-5a99-4b21-99d2-2d4a36a241f1/resource/55784447-97e8-4fb0-b062-99c368bf6384/download/acoes_e_programas_json_2022_20221231.json" className="text-ameciclo hover:underline focus:outline-none focus:ring-2 focus:ring-ameciclo">Ações e Programas - 2022</a></li>
                                    <li><a href="https://dados.pe.gov.br/dataset/38401a88-5a99-4b21-99d2-2d4a36a241f1/resource/0a2e8fd7-7a65-46df-bd1b-15f2dfaaded7/download/acoes_e_programas_json_2021_20211231.json" className="text-ameciclo hover:underline focus:outline-none focus:ring-2 focus:ring-ameciclo">Ações e Programas - 2021</a></li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    <div className="text-right text-sm text-gray-500 mb-2">
                        {!!actions2023?.length ? `ATUALIZADO: ${new Date().toLocaleDateString('pt-BR')}` : 'ATUALIZADO: 10/10/2023'}
                    </div>
                </div>
            ) : <Loading />}
        </>
    );
}