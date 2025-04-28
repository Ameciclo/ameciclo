import { useLoaderData } from "@remix-run/react";
import Banner from "~/components/Commom/Banner";
import Breadcrumb from "~/components/Commom/Breadcrumb";
import { GeneralCountStatistics } from "~/components/Contagens/GeneralCountStatistics";

import { loader } from "~/loader/dados.contagens";
import { IntlNumber } from "~/utils/utils";
export { loader };

export default function Contagens() {
    const { cover, summaryData, countsData, pageData } = useLoaderData<typeof loader>();

    const allCountsStatistics = (summaryData: any) => {
        const { total_cyclists, number_counts, where_max_count, different_counts_points } = {
            ...summaryData,
        };
        return [
            {
                title: "Total de ciclistas",
                value: IntlNumber(total_cyclists),
            },
            {
                title: "Contagens Realizadas",
                value: IntlNumber(number_counts),
            },
            { title: "Pontos Monitorados", value: IntlNumber(different_counts_points) },
            {
                title: "Máximo em um ponto",
                value: IntlNumber(where_max_count.total_cyclists),
            },
        ];
    };
    return (
        <>
            <Banner image={cover?.url} alt="Capa da página de contagens" />
            <Breadcrumb label="Contagens" slug="/contagens" routes={["/", "/dados"]} />
            <GeneralCountStatistics
                title={"Estatísticas Gerais"}
                boxes={allCountsStatistics(summaryData)}
            />
        </>
    );
}