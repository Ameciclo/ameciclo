import { json, LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import Banner from "~/components/Commom/Banner";
import Breadcrumb from "~/components/Commom/Breadcrumb";
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
    const cidades = ideciclo.filter((c: any) => c.reviews.length > 0);

    return (
        <>
            <Banner alt="Capa da página do Ideciclo" />

            <Breadcrumb label="Ideciclo" slug="/dados/ideciclo" routes={["/", "/dados"]} />
            <StatisticsBoxIdeciclo
                title={"Estatísticas Gerais"}
                boxes={allCitiesStatistics(cidades, structures)}
            />
        </>
    );
}