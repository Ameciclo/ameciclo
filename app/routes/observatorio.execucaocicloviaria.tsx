import { json, LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import Banner from "~/components/Commom/Banner";
import Breadcrumb from "~/components/Commom/Breadcrumb";
import { ExplanationBoxes } from "~/components/Dados/ExplanationBoxes";
import { StatisticsBox } from "~/components/ExecucaoCicloviaria/StatisticsBox";

import { loader } from "~/loader/dados.observatorio.execucaocicloviaria";
export { loader };

export default function ExecucaoCicloviaria() {
    const { cover, description, boxes } = useLoaderData<typeof loader>();

    return (
        <>
            <Banner image={cover} alt="Capa da página dos dados, de execuções cicloviárias, na região metropolitana do recife." />
            <Breadcrumb label="Execução Cicloviária" slug="/execucaocicloviaria" routes={["/", "/observatorio"]} />
            <ExplanationBoxes boxes={[{ title: "O que temos aqui?", description }]} />
            <StatisticsBox
                title={"Execução Cicloviária"}
                subtitle={"da Região Metropolitana do Recife"}
                boxes={boxes}
            />
        </>
    );
}