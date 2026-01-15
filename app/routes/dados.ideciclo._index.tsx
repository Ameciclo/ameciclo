import { useLoaderData } from "@remix-run/react";
import { useApiStatus } from "~/contexts/ApiStatusContext";
import { ApiStatusHandler } from "~/components/Commom/ApiStatusHandler";
import { useEffect } from "react";
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
    const { ideciclo, structures, pageData, apiDown, apiErrors } = useLoaderData<typeof loader>();
    const { setApiDown, addApiError } = useApiStatus();
    
    useEffect(() => {
        setApiDown(apiDown);
        if (apiErrors && apiErrors.length > 0) {
            apiErrors.forEach((error: {url: string, error: string}) => {
                addApiError(error.url, error.error, '/dados/ideciclo');
            });
        }
    }, []);

    return (
        <>
            <Banner title="" image="/pages_covers/ideciclo-cover.png" />
            <Breadcrumb label="Ideciclo" slug="/dados/ideciclo" routes={["/", "/dados"]} />
            <ApiStatusHandler apiDown={apiDown} />
            
            {(() => {
                const { ideciclo: idecicloData, structures: structuresData, pageData: pageDataData } = { ideciclo, structures, pageData };
                
                const cidades = (idecicloData || []).filter((c: any) => c.reviews?.length > 0);
                
                return (
                    <>
                        <StatisticsBoxIdeciclo
                            title={"Estatísticas Gerais"}
                            boxes={allCitiesStatistics(cidades, structuresData || [])}
                        />
                        <ExplanationBoxesIdeciclo
                            boxes={[
                                {
                                    title: "O que é?",
                                    description: pageDataData?.description || "",
                                },
                                {
                                    title: "Para que serve?",
                                    description: pageDataData?.objective || "",
                                },
                                {
                                    title: "Metodologia",
                                    description: pageDataData?.methodology || "",
                                },
                            ]}
                        />
                        <IdecicloClientSide
                            cidades={cidades}
                            structures={structuresData || []}
                            ideciclo={idecicloData || []}
                        />
                    </>
                );
            })()}
        </>
    );
}