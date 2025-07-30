import { useLoaderData, Await } from "@remix-run/react";
import { Suspense } from "react";
import { useApiStatus } from "~/contexts/ApiStatusContext";
import Banner from "~/components/Commom/Banner";

import Breadcrumb from "~/components/Commom/Breadcrumb";
import { ExplanationBoxesIdeciclo } from "~/components/Ideciclo/ExplanationBoxesIdeciclo";
import IdecicloClientSide from "~/components/Ideciclo/IdecicloClientSide";
import { StatisticsBoxIdeciclo } from "~/components/Ideciclo/StatisticsBoxIdeciclo";

import { loader } from "~/loader/dados.ideciclo";
import { IntlNumber, IntlNumberMax1Digit } from "~/services/utils";
export { loader };

function getTotalCityStates(input: any) {
    let arr = input,
        obj: any = {},
        count = 0,
        st_arr = [];
    for (let i = 0; i < arr.length; i++) {
        if (!obj[arr[i].state]) {
            obj[arr[i].state] = 1;
            count++;
            st_arr.push(arr[i].state);
        } else if (obj[arr[i].state]) {
            obj[arr[i].state] += 1;
        }
    }
    return { states: st_arr, count: count };
}


function allCitiesStatistics(cities: any, structures: any) {
    // Verifica se cities é um objeto de erro e o trata como um array vazio se for
    if (cities && cities.apiError) {
        cities = [];
    }
    // Verifica se structures é um objeto de erro e o trata como um array vazio se for
    if (structures && structures.apiError) {
        structures = [];
    }

    return [
        { title: "Cidades avaliadas", value: cities.length },
        {
            title: "Em quantos estados",
            value: getTotalCityStates(cities).count,
        },
        {
            title: "Extensão avaliada",
            value: IntlNumberMax1Digit(
                (cities.reduce(
                    (acc: any, cur: any) => acc + cur.reviews[0].city_network.cycle_length.road,
                    0
                ) +
                    cities.reduce(
                        (acc: any, cur: any) => acc + cur.reviews[0].city_network.cycle_length.street,
                        0
                    ) +
                    cities.reduce(
                        (acc: any, cur: any) => acc + cur.reviews[0].city_network.cycle_length.local,
                        0
                    )) /
                1000
            ),
            unit: "km"
        },
        { title: "Vias avaliadas", value: IntlNumber(structures.length) },
    ];
}

export default function Ideciclo() {
    const { ideciclo, structures, pageData } = useLoaderData<typeof loader>();
    const { setApiDown } = useApiStatus();

    return (
        <>
            <Banner title="" image="/pages_covers/ideciclo-cover.png" />
            <Breadcrumb label="Ideciclo" slug="/dados/ideciclo" routes={["/", "/dados"]} />
            
            <Suspense fallback={
    <div className="container mx-auto py-8">
        {/* Skeleton para StatisticsBoxIdeciclo */}
        <div className="animate-pulse bg-gray-200 h-10 w-1/3 mb-6 rounded"></div> {/* Título */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="bg-gray-200 h-32 rounded-lg"></div>
            <div className="bg-gray-200 h-32 rounded-lg"></div>
            <div className="bg-gray-200 h-32 rounded-lg"></div>
            <div className="bg-gray-200 h-32 rounded-lg"></div>
        </div>

        {/* Skeleton para ExplanationBoxesIdeciclo */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            <div className="bg-gray-200 p-6 rounded-lg shadow-md">
                <div className="animate-pulse bg-gray-300 h-6 w-3/4 mb-4 rounded"></div>
                <div className="animate-pulse bg-gray-300 h-4 w-full mb-2 rounded"></div>
                <div className="animate-pulse bg-gray-300 h-4 w-5/6 rounded"></div>
            </div>
            <div className="bg-gray-200 p-6 rounded-lg shadow-md">
                <div className="animate-pulse bg-gray-300 h-6 w-3/4 mb-4 rounded"></div>
                <div className="animate-pulse bg-gray-300 h-4 w-full mb-2 rounded"></div>
                <div className="animate-pulse bg-gray-300 h-4 w-5/6 rounded"></div>
            </div>
            <div className="bg-gray-200 p-6 rounded-lg shadow-md">
                <div className="animate-pulse bg-gray-300 h-6 w-3/4 mb-4 rounded"></div>
                <div className="animate-pulse bg-gray-300 h-4 w-full mb-2 rounded"></div>
                <div className="animate-pulse bg-gray-300 h-4 w-5/6 rounded"></div>
            </div>
        </div>

        {/* Skeleton para IdecicloClientSide (mapa e outros) */}
        <div className="animate-pulse bg-gray-200 h-96 w-full rounded-lg mb-12"></div>
    </div>
}>
                <Await resolve={Promise.allSettled([ideciclo, structures, pageData])}>
                    {(results) => {
                        let errorMessage = "";
                        let idecicloData: any = null;
                        let structuresData: any = null;
                        let pageDataData: any = null;

                        results.forEach((result, index) => {
                            if (result.status === 'rejected') {
                                errorMessage += `Erro ao carregar dados: ${result.reason.message || result.reason}. `;
                            } else if (result.status === 'fulfilled') {
                                if (result.value.apiError) {
                                    errorMessage += result.value.errorMessage + " ";
                                } else {
                                    if (index === 0) idecicloData = result.value;
                                    if (index === 1) structuresData = result.value;
                                    if (index === 2) pageDataData = result.value;
                                }
                            }
                        });

                        if (errorMessage) {
                            setApiDown(true);
                            return (
                                <div className="container mx-auto py-8">
                                    {/* Skeletons para manter a estrutura visual */}
                                    <div className="animate-pulse bg-gray-200 h-10 w-1/3 mb-6 rounded"></div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                                        <div className="bg-gray-200 h-32 rounded-lg"></div>
                                        <div className="bg-gray-200 h-32 rounded-lg"></div>
                                        <div className="bg-gray-200 h-32 rounded-lg"></div>
                                        <div className="bg-gray-200 h-32 rounded-lg"></div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                                        <div className="bg-gray-200 p-6 rounded-lg shadow-md">
                                            <div className="animate-pulse bg-gray-300 h-6 w-3/4 mb-4 rounded"></div>
                                            <div className="animate-pulse bg-gray-300 h-4 w-full mb-2 rounded"></div>
                                            <div className="animate-pulse bg-gray-300 h-4 w-5/6 rounded"></div>
                                        </div>
                                        <div className="bg-gray-200 p-6 rounded-lg shadow-md">
                                            <div className="animate-pulse bg-gray-300 h-6 w-3/4 mb-4 rounded"></div>
                                            <div className="animate-pulse bg-gray-300 h-4 w-full mb-2 rounded"></div>
                                            <div className="animate-pulse bg-gray-300 h-4 w-5/6 rounded"></div>
                                        </div>
                                        <div className="bg-gray-200 p-6 rounded-lg shadow-md">
                                            <div className="animate-pulse bg-gray-300 h-6 w-3/4 mb-4 rounded"></div>
                                            <div className="animate-pulse bg-gray-300 h-4 w-full mb-2 rounded"></div>
                                            <div className="animate-pulse bg-gray-300 h-4 w-5/6 rounded"></div>
                                        </div>
                                    </div>
                                    <div className="animate-pulse bg-gray-200 h-96 w-full rounded-lg mb-12"></div>
                                </div>
                            );
                        }

                        // Certifique-se de que os dados não são nulos antes de usar
                        if (!idecicloData || !structuresData || !pageDataData) {
                            // Isso deve ser tratado pelo fallback do Suspense, mas como fallback
                            setApiDown(true);
                            return (
                                <div className="container mx-auto py-8">
                                    {/* Skeletons para manter a estrutura visual */}
                                    <div className="animate-pulse bg-gray-200 h-10 w-1/3 mb-6 rounded"></div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                                        <div className="bg-gray-200 h-32 rounded-lg"></div>
                                        <div className="bg-gray-200 h-32 rounded-lg"></div>
                                        <div className="bg-gray-200 h-32 rounded-lg"></div>
                                        <div className="bg-gray-200 h-32 rounded-lg"></div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                                        <div className="bg-gray-200 p-6 rounded-lg shadow-md">
                                            <div className="animate-pulse bg-gray-300 h-6 w-3/4 mb-4 rounded"></div>
                                            <div className="animate-pulse bg-gray-300 h-4 w-full mb-2 rounded"></div>
                                            <div className="animate-pulse bg-gray-300 h-4 w-5/6 rounded"></div>
                                        </div>
                                        <div className="bg-gray-200 p-6 rounded-lg shadow-md">
                                            <div className="animate-pulse bg-gray-300 h-6 w-3/4 mb-4 rounded"></div>
                                            <div className="animate-pulse bg-gray-300 h-4 w-full mb-2 rounded"></div>
                                            <div className="animate-pulse bg-gray-300 h-4 w-5/6 rounded"></div>
                                        </div>
                                        <div className="bg-gray-200 p-6 rounded-lg shadow-md">
                                            <div className="animate-pulse bg-gray-300 h-6 w-3/4 mb-4 rounded"></div>
                                            <div className="animate-pulse bg-gray-300 h-4 w-full mb-2 rounded"></div>
                                            <div className="animate-pulse bg-gray-300 h-4 w-5/6 rounded"></div>
                                        </div>
                                    </div>
                                    <div className="animate-pulse bg-gray-200 h-96 w-full rounded-lg mb-12"></div>
                                </div>
                            );
                        }

                        const cidades = idecicloData.filter((c: any) => c.reviews.length > 0);
                        
                        return (
                            <>
                                <StatisticsBoxIdeciclo
                                    title={"Estatísticas Gerais"}
                                    boxes={allCitiesStatistics(cidades, structuresData)}
                                />
                                <ExplanationBoxesIdeciclo
                                    boxes={[
                                        {
                                            title: "O que é?",
                                            description: pageDataData.description,
                                        },
                                        {
                                            title: "Para que serve?",
                                            description: pageDataData.objective,
                                        },
                                        {
                                            title: "Metodologia",
                                            description: pageDataData.methodology,
                                        },
                                    ]}
                                />
                                <IdecicloClientSide
                                    cidades={cidades}
                                    structures={structuresData}
                                    ideciclo={idecicloData}
                                />
                            </>
                        );
                    }}
                </Await>
            </Suspense>
        </>
    );
}