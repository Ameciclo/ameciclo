import { json, LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { LayerProps } from "react-map-gl";
import Banner from "~/components/Commom/Banner";
import Breadcrumb from "~/components/Commom/Breadcrumb";
import { ExplanationBoxes } from "~/components/Dados/ExplanationBoxes";
import { Map } from "~/components/ExecucaoCicloviaria/Map";
import { StatisticsBox } from "~/components/ExecucaoCicloviaria/StatisticsBox";

import { loader } from "~/loader/dados.observatorio.execucaocicloviaria";
export { loader };

export default function ExecucaoCicloviaria() {
    const {
        cover,
        boxes,
        title1,
        title2,
        description1,
        description2,
        allCitiesLayer,
        layersConf,
    } = useLoaderData<typeof loader>();

    return (
        <>
            <Banner image={cover} alt="Capa da página dos dados, de execuções cicloviárias, na região metropolitana do recife." />
            <Breadcrumb label="Execução Cicloviária" slug="/execucaocicloviaria" routes={["/", "/observatorio"]} />
            <StatisticsBox
                title={"Execução Cicloviária"}
                subtitle={"da Região Metropolitana do Recife"}
                boxes={boxes}
            />
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
            <Map layerData={allCitiesLayer} layersConf={layersConf as LayerProps[]} />
        </>
    );
}