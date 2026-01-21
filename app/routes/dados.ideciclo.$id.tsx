import { useLoaderData } from "@remix-run/react";
import Banner from "~/components/Commom/Banner";
import Breadcrumb from "~/components/Commom/Breadcrumb";
import { AmecicloMap } from "~/components/Commom/Maps/AmecicloMap";
import { RadarChart } from "../components/Charts/RadarChart";
import { IdecicloDescription } from "../components/Ideciclo/IdecicloDescription";
import { idecicloLayers } from "../components/Ideciclo/ideciclo_mapstyle";
import { StatisticsBoxIdecicloDetalhes } from "../components/Ideciclo/StatisticsBoxIdeciclo";
import { VerticalStatisticsBoxesIdeciclo } from "../components/Ideciclo/VerticalStatisticsBoxesIdeciclo";
import { loader } from "~/loader/dados.ideciclo.$id";
import { getRatesSummary, structureStatistics } from "~/services/ideciclo.service";

export { loader };

export default function Ideciclo() {
  const { structure, forms, pageData, mapData } = useLoaderData<typeof loader>();

  const info = getRatesSummary(structure, forms);
  const GeneralStatistics = structureStatistics(structure, info);
  const coverImage = pageData?.cover?.url || "/pages_covers/ideciclo-navcover.png";

  return (
    <>
      <Banner title={structure.street} image={coverImage} />
      <Breadcrumb
        label={structure.street}
        slug={structure.id.toString()}
        routes={["/", "/dados", "/dados/ideciclo"]}
      />

      <StatisticsBoxIdecicloDetalhes
        title={GeneralStatistics.title}
        subtitle={GeneralStatistics.subtitle}
        boxes={GeneralStatistics.boxes}
      />

      <div className="w-full bg-amber-300 py-20">
        <section className="container mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 auto-rows-auto gap-10 min-h-[500px]">
          <div className="rounded bg-white shadow-2xl h-full">
            <IdecicloDescription info={info} />
          </div>
          <div className="bg-white rounded shadow-2xl h-full">
            <AmecicloMap
              layerData={mapData}
              layersConf={idecicloLayers}
            />
          </div>
          <div className="rounded bg-white shadow-2xl h-full">
            <RadarChart
              {...info}
              title={"EVOLUÇÃO DA NOTA"}
              subtitle={"Notas que compõem a média"}
            />
          </div>
        </section>
      </div>

      <VerticalStatisticsBoxesIdeciclo
        title={"Detalhamento e composição das notas"}
        boxes={info.parametros}
      />
      <div className="relative w-full h-[26vh]">
        <img
          src="/ideciclo/ideciclo-ciclovia.png"
          alt="Ciclovia Ideciclo"
          className="absolute inset-0 object-cover w-full h-full"
          loading="lazy"
        />
      </div>
    </>
  );
}
