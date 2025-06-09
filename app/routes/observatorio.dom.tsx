import { useLoaderData } from "@remix-run/react";
import { useEffect, useState } from "react";
import Banner from "~/components/Commom/Banner";
import Breadcrumb from "~/components/Commom/Breadcrumb";
import LazyLoad from 'react-lazyload';
import { ExplanationBoxes } from "~/components/Dados/ExplanationBoxes";
import Loading from "~/components/Dom/Loading";

import { loader } from "~/loader/dados.observatorio.dom";
import Chart from "react-google-charts";
import ActionCarousel from "~/components/Dom/ActionCarousel";
import DevelopingComponent from "~/components/Commom/DevelopingComponent";
export { loader };

export default function Dom() {
    const { cover, description, totalGoodActions, totalBadActions, chartData, sustainableTotal, unsustainableTotal, carbonValue } = useLoaderData<any>();
    const [renderOthers, setRenderOthers] = useState(false);

    useEffect(() => {
        const timeout = setTimeout(() => {
            setRenderOthers(true);
        }, 2000); // Reduced loading time for better UX

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
            <Banner image={cover?.url} alt="Capa da página do Diágnóstico Orçamentário Municipal" />
            <Breadcrumb label="dom" slug="/dados/observatorio/dom" routes={["/", "/observatorio"]} />
            <ExplanationBoxes boxes={[{ title: "O que temos aqui?", description }]} />
            
            {renderOthers ? (
                <div className="container mx-auto px-4 py-8">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-6">Valores orçados para ações sustentáveis no Município em 2024</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                        <div className="bg-white rounded-lg shadow-lg p-6 border-l-8 border-green-600" aria-label="Valores sustentáveis">
                            <LazyLoad height={400} offset={0}>
                                <h3 className="text-4xl font-bold mb-2 flex items-baseline">
                                    <span><AnimatedNumber initialValue={0} finalValue={35.2} duration={500} /></span>
                                    <span className="text-2xl ml-1">Bi</span>
                                </h3>
                                <p className="text-lg mb-2">Valor orçado em ações sustentáveis:</p>
                                <p className="text-xl font-semibold">R$ <AnimatedNumber initialValue={0} finalValue={sustainableTotal} duration={2000} /></p>
                                <div className="mt-2 inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Sustentável</div>
                            </LazyLoad>
                        </div>
                        
                        <div className="bg-white rounded-lg shadow-lg p-6 border-l-8 border-red-600" aria-label="Valores não sustentáveis">
                            <LazyLoad height={400} offset={0}>
                                <h3 className="text-4xl font-bold mb-2 flex items-baseline">
                                    <span><AnimatedNumber initialValue={0} finalValue={148.7} duration={500} /></span>
                                    <span className="text-2xl ml-1">Bi</span>
                                </h3>
                                <p className="text-lg mb-2">Valor orçado em ações NÃO sustentáveis:</p>
                                <p className="text-xl font-semibold">R$ <AnimatedNumber initialValue={0} finalValue={unsustainableTotal} duration={2000} /></p>
                                <div className="mt-2 inline-block px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">Não sustentável</div>
                            </LazyLoad>
                        </div>
                    </div>
                    
                    <h2 className="text-2xl font-semibold text-gray-800 mb-6">Quanto é gasto por emissão de carbono em nosso Município</h2>
                    <div className="mb-12">
                        <div className="bg-white rounded-lg shadow-lg p-6 border-l-8 border-blue-600 max-w-md mx-auto" aria-label="Valor por emissão de carbono">
                            <LazyLoad height={400} offset={0}>
                                <h3 className="text-4xl font-bold mb-2">R$ 3 Mil / CO2e</h3>
                                <p className="text-lg mb-2">Valor por emissão de carbono (2020)</p>
                                <p className="text-xl font-semibold">R$ {carbonValue}</p>
                                <div className="mt-2 inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">Emissão de carbono</div>
                            </LazyLoad>
                        </div>
                    </div>
                    
                    <h2 className="text-2xl font-semibold text-gray-800 mb-6">Qual valor total orçado e qual valor real executado em boas ações para a sustentabilidade em nosso Município</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                        <div className="bg-white rounded-lg shadow-lg p-6 border-l-8 border-ameciclo">
                            <LazyLoad height={400} offset={0}>
                                <h3 className="text-4xl font-bold mb-2 flex items-baseline">
                                    <span><AnimatedNumber initialValue={0} finalValue={35.2} duration={500} /></span>
                                    <span className="text-2xl ml-1">Bi</span>
                                </h3>
                                <p className="text-lg mb-2">Valor orçado em ações sustentáveis:</p>
                                <p className="text-xl font-semibold">R$ <AnimatedNumber initialValue={0} finalValue={sustainableTotal} duration={2000} /></p>
                            </LazyLoad>
                        </div>
                        
                        <div className="bg-white rounded-lg shadow-lg p-6 border-l-8 border-gray-400">
                            <LazyLoad height={400} offset={0}>
                                <h3 className="text-4xl font-bold mb-2">---.- Mi</h3>
                                <p className="text-lg mb-2">Valor Executado (em breve)</p>
                                <p className="text-xl font-semibold">R$ ---.---.---</p>
                            </LazyLoad>
                        </div>
                    </div>
                    
                    {chartData && (
                        <div className="mb-12">
                            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Gráfico de projeção de valores orçados em boas e más ações sustentáveis em 2021, 2023 e 2024</h2>
                            <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                                <Chart
                                    chartType="Bar"
                                    data={chartData.yearlyComparison}
                                    width="100%"
                                    height="400px"
                                    options={{
                                        chart: {
                                            subtitle: "Valores totais (R$) de orçados em 2021, 2023 e 2024",
                                        },
                                        colors: ['#38A169', '#E53E3E'], // Green and red with high contrast
                                        accessibility: {
                                            highContrastMode: true
                                        },
                                        legend: {
                                            position: 'top',
                                            textStyle: {
                                                fontSize: 14,
                                                color: '#333333'
                                            }
                                        },
                                        hAxis: {
                                            textStyle: {
                                                fontSize: 14,
                                                color: '#333333'
                                            }
                                        },
                                        vAxis: {
                                            textStyle: {
                                                fontSize: 14,
                                                color: '#333333'
                                            }
                                        }
                                    }}
                                    legendToggle
                                />
                            </div>

                            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Gráfico de projeção de valores orçados em boas ações sustentáveis no Município em 2021, 2023 e 2024</h2>
                            <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                                <Chart
                                    chartType="Bar"
                                    data={chartData.goodActionsYearly}
                                    width="100%"
                                    height="400px"
                                    options={{
                                        chart: {
                                            subtitle: "Valores totais (R$) orçados em 2021, 2023 e 2024",
                                        },
                                        colors: ['#38A169'], // Green with high contrast
                                        accessibility: {
                                            highContrastMode: true
                                        },
                                        legend: {
                                            position: 'top',
                                            textStyle: {
                                                fontSize: 14,
                                                color: '#333333'
                                            }
                                        }
                                    }}
                                    legendToggle
                                />
                            </div>

                            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Gráfico de projeção de gastos totais no Município em 2021, 2023 e 2024</h2>
                            <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                                <Chart
                                    chartType="Bar"
                                    data={chartData.totalSpendingYearly}
                                    width="100%"
                                    height="400px"
                                    options={{
                                        chart: {
                                            subtitle: "Valor total (R$) gasto em 2021, 2023 e 2024",
                                        },
                                        colors: ['#3182CE'], // Blue with high contrast
                                        accessibility: {
                                            highContrastMode: true
                                        },
                                        legend: {
                                            position: 'top',
                                            textStyle: {
                                                fontSize: 14,
                                                color: '#333333'
                                            }
                                        }
                                    }}
                                    legendToggle
                                />
                            </div>
                        </div>
                    )}              
                    <DevelopingComponent title="Componente Tabela de Ações e Programas" />
                    <div className="bg-gray-50 rounded-lg p-6">
                        <h2 className="text-2xl font-semibold text-ameciclo mb-6">Documentação</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <div>
                                <h3 className="text-xl font-bold mb-4 text-gray-800">Documentos Orçamentários</h3>
                                <ul className="space-y-3">
                                    <li><a href="http://dados.recife.pe.gov.br/dataset/despesas-orcamentarias/resource/718e6705-a7e1-4395-a7c5-13c141c182f7" target="_blank" rel="noopener noreferrer" className="text-ameciclo hover:underline focus:outline-none focus:ring-2 focus:ring-ameciclo">Despesas orçamentárias 2021</a></li>
                                    <li><a href="http://dados.recife.pe.gov.br/dataset/despesas-orcamentarias/resource/df6d4a2a-7f78-4f98-a38b-8cf74b7823d7" target="_blank" rel="noopener noreferrer" className="text-ameciclo hover:underline focus:outline-none focus:ring-2 focus:ring-ameciclo">Despesas orçamentárias 2022</a></li>
                                    <li><a href="http://dados.recife.pe.gov.br/dataset/despesas-orcamentarias/resource/a4b97fb4-7dc6-4e70-a87d-3c3503f00b1e" className="text-ameciclo hover:underline focus:outline-none focus:ring-2 focus:ring-ameciclo">Despesas orçamentárias 2023</a></li>
                                    <li><a href="http://dados.recife.pe.gov.br/dataset/despesas-orcamentarias/resource/6e5be9b8-7fe3-4831-abb2-44817d2f5417" target="_blank" rel="noopener noreferrer" className="text-ameciclo hover:underline focus:outline-none focus:ring-2 focus:ring-ameciclo">Despesas Totais 2024</a></li>
                                </ul>
                            </div>
                            
                            <div>
                                <h3 className="text-xl font-bold mb-4 text-gray-800">Documentos Climáticos</h3>
                                <ul className="space-y-3">
                                    <li><a href="https://semas.pe.gov.br/wp-content/uploads/2022/03/2022_03_16_GIZ_plano_descarbonizacao_pernambuco-v6_reduzido.pdf" className="text-ameciclo hover:underline focus:outline-none focus:ring-2 focus:ring-ameciclo">Plano de descarbonização de Pernambuco</a></li>
                                    <li><a href="https://www.gov.br/mma/pt-br/assuntos/climaozoniodesertificacao/clima/diretrizes-para-uma-estrategia-nacional-para-neutralidade-climatica_.pdf" className="text-ameciclo hover:underline focus:outline-none focus:ring-2 focus:ring-ameciclo">Diretrizes para neutralidade climática</a></li>
                                    <li><a href="https://semas.pe.gov.br/grafico-inventario-gee/" className="text-ameciclo hover:underline focus:outline-none focus:ring-2 focus:ring-ameciclo">Gráfico – Inventário de Gases de Efeito Estufa</a></li>
                                </ul>
                            </div>
                            
                            <div>
                                <h3 className="text-xl font-bold mb-4 text-gray-800">Baixe os Dados</h3>
                                <ul className="space-y-3">
                                    <li><a href="http://dados.recife.pe.gov.br/datastore/dump/df6d4a2a-7f78-4f98-a38b-8cf74b7823d7?bom=True" className="text-ameciclo hover:underline focus:outline-none focus:ring-2 focus:ring-ameciclo">(CSV) Despesas orçamentárias 2021</a></li>
                                    <li><a href="http://dados.recife.pe.gov.br/datastore/dump/ea074e10-46a1-46a4-a2a4-47d1b331544d?bom=True" target="_blank" rel="noopener noreferrer" className="text-ameciclo hover:underline focus:outline-none focus:ring-2 focus:ring-ameciclo">(CSV) Despesas orçamentárias 2022</a></li>
                                    <li><a href="http://dados.recife.pe.gov.br/datastore/dump/a4b97fb4-7dc6-4e70-a87d-3c3503f00b1e?bom=True" className="text-ameciclo hover:underline focus:outline-none focus:ring-2 focus:ring-ameciclo">(CSV) Despesas orçamentárias 2023</a></li>
                                    <li><a href="http://dados.recife.pe.gov.br/datastore/dump/6e5be9b8-7fe3-4831-abb2-44817d2f5417?bom=True" target="_blank" rel="noopener noreferrer" className="text-ameciclo hover:underline focus:outline-none focus:ring-2 focus:ring-ameciclo">(CSV) Despesas Totais 2024</a></li>
                                    <li><a href="http://dados.recife.pe.gov.br/datastore/dump/df6d4a2a-7f78-4f98-a38b-8cf74b7823d7?format=json" className="text-ameciclo hover:underline focus:outline-none focus:ring-2 focus:ring-ameciclo">(JSON) Despesas orçamentárias 2021</a></li>
                                    <li><a href="http://dados.recife.pe.gov.br/datastore/dump/a4b97fb4-7dc6-4e70-a87d-3c3503f00b1e?format=json" target="_blank" rel="noopener noreferrer" className="text-ameciclo hover:underline focus:outline-none focus:ring-2 focus:ring-ameciclo">(JSON) Despesas orçamentárias 2022</a></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            ) : <Loading />}
        </>
    );
}