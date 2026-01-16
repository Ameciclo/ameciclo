// Move descriptions to a separate import or fetch from API
const descriptions = {
  project: { title: "Qualidade do projeto" },
  safety: { title: "Segurança viária" },
  maintenance: { title: "Manutenção" },
  urbanity: { title: "Urbanidade" },
  protection: { title: "Proteção contra a invasão" },
  all_vert_signs: { title: "Sinalização vertical" },
  all_hor_signs: { title: "Sinalização horizontal" },
  comfort: { title: "Conforto da estrutura" },
  speed_control: { title: "Controle de velocidade" },
  conflicts: { title: "Conflitos ao longo" },
  cross_conflict: { title: "Conflitos nos cruzamentos" },
  pavement: { title: "Tipo de pavimento" },
  hor_sign_conditions: { title: "Condição da sinalização horizontal" },
  protection_conditions: { title: "Situação da proteção" },
  obstacles: { title: "Obstáculos" },
  shading: { title: "Sombreamento" },
  access: { title: "Acesso da estrutura" },
  lighting: { title: "Iluminação" }
};
import { StatisticsBoxIdecicloDetalhes } from "../components/Ideciclo/StatisticsBoxIdeciclo";
import { IdecicloDescription } from "../components/Ideciclo/IdecicloDescription";
import { RadarChart } from "../components/Charts/RadarChart";

function getRatesSummary(structure: any, forms: any) {
  // ORDENA POR ANO
  let s = structure;
  // PEGA FORMULÁRIO PARA DADOS DESCRITOS
  let form = forms; //.filter(f => f.id === s.reviews[0].segments[0].form_id)[0]
  // PEGA NOTAS
  let rate = structure.reviews[structure.reviews.length - 1].rates;
  let last_rate = rate;

  if (structure.reviews.length > 1)
    last_rate = structure.reviews[structure.reviews.length - 2].rates;

  //let last_rate = structure.reviews[1].rates
  const project_param = [
    {
      key: "protection",
      titulo: descriptions.protection.title,
      media: rate.protection,
      mediaType: "number",
      different: rate.protection != last_rate.protection,
      better: rate.protection > last_rate.protection,
    },
    {
      key: "all_vert_signs",
      titulo: descriptions.all_vert_signs.title,
      media: rate.all_vert_signs,
      mediaType: "number",
      different: rate.all_vert_signs != last_rate.all_vert_signs,
      better: rate.all_vert_signs > last_rate.all_vert_signs,
    },
    {
      key: "all_hor_signs",
      titulo: descriptions.all_hor_signs.title,
      media: rate.all_hor_signs,
      mediaType: "number",
      different: rate.all_hor_signs != last_rate.all_hor_signs,
      better: rate.all_hor_signs > last_rate.all_hor_signs,
    },
    {
      key: "comfort",
      titulo: descriptions.comfort.title,
      media: rate.comfort,
      mediaType: "number",
      different: rate.comfort != last_rate.comfort,
      better: rate.comfort > last_rate.comfort,
    },
  ];
  const safety_param = [
    {
      key: "speed_control",
      titulo: descriptions.speed_control.title,
      media: rate.speed_control,
      mediaType: "number",
      different: rate.speed_control != last_rate.speed_control,
      better: rate.speed_control > last_rate.speed_control,
    },
    {
      key: "conflicts",
      titulo: descriptions.conflicts.title,
      media: rate.conflicts,
      mediaType: "number",
      different: rate.conflicts != last_rate.conflicts,
      better: rate.conflicts > last_rate.conflicts,
    },
    {
      key: "cross_conflict",
      titulo: descriptions.cross_conflict.title,
      media: rate.cross_conflict,
      mediaType: "number",
      different: rate.cross_conflict != last_rate.cross_conflict,
      better: rate.cross_conflict > last_rate.cross_conflict,
    },
  ];
  const maintenance_param = [
    {
      key: "pavement",
      titulo: descriptions.pavement.title,
      media: rate.pavement,
      mediaType: "number",
      different: rate.pavement != last_rate.pavement,
      better: rate.pavement > last_rate.pavement,
    },
    {
      key: "hor_sign_conditions",
      titulo: descriptions.hor_sign_conditions.title,
      media: rate.hor_sign_conditions,
      mediaType: "number",
      different: rate.hor_sign_conditions != last_rate.hor_sign_conditions,
      better: rate.hor_sign_conditions > last_rate.hor_sign_conditions,
    },
    {
      key: "protection_conditions",
      titulo: descriptions.protection_conditions.title,
      media: rate.protection_conditions,
      mediaType: "number",
      different: rate.protection_conditions != last_rate.protection_conditions,
      better: rate.protection_conditions > last_rate.protection_conditions,
    },
  ];
  const urbanity_param = [
    {
      key: "obstacles",
      titulo: descriptions.obstacles.title,
      media: rate.obstacles,
      mediaType: "number",
      different: rate.obstacles != last_rate.obstacles,
      better: rate.obstacles > last_rate.obstacles,
    },
    {
      key: "shading",
      titulo: descriptions.shading.title,
      media: rate.shading,
      mediaType: "number",
      different: rate.shading != last_rate.shading,
      better: rate.shading > last_rate.shading,
    },
    {
      key: "access",
      titulo: descriptions.access.title,
      media: rate.access,
      mediaType: "number",
      different: rate.access != last_rate.access,
      better: rate.access > last_rate.access,
    },
    {
      key: "lighting",
      titulo: descriptions.lighting.title,
      media: rate.lighting,
      mediaType: "number",
      different: rate.lighting != last_rate.lighting,
      better: rate.lighting > last_rate.lighting,
    },
  ];

  // Format sub-parameters with proper number formatting
  project_param.forEach((p: any) => p.media = IntlNumberMax1Digit(p.media));
  safety_param.forEach((p: any) => p.media = IntlNumberMax1Digit(p.media));
  maintenance_param.forEach((p: any) => p.media = IntlNumberMax1Digit(p.media));
  urbanity_param.forEach((p: any) => p.media = IntlNumberMax1Digit(p.media));

  const main_parameters = [
    {
      key: "project",
      titulo: descriptions.project.title,
      media: IntlNumberMax1Digit(rate.project),
      mediaType: "number",
      color: "#6DBFAC",
      parametros: project_param,
    },
    {
      key: "safety",
      titulo: descriptions.safety.title,
      media: IntlNumberMax1Digit(rate.safety),
      mediaType: "number",
      color: "#CE4831",
      parametros: safety_param,
    },
    {
      key: "maintenance",
      titulo: descriptions.maintenance.title,
      media: IntlNumberMax1Digit(rate.maintenance),
      mediaType: "number",
      color: "#EFC345",
      parametros: maintenance_param,
    },
    {
      key: "urbanity",
      titulo: descriptions.urbanity.title,
      media: IntlNumberMax1Digit(rate.urbanity),
      mediaType: "number",
      color: "#5AC2E1",
      parametros: urbanity_param,
    },
  ];

  // TRABALHA O DIAGRAMA RADAR
  const categories = main_parameters.map((p) => p.titulo);
  let series: any[] = [];
  let reviews = structure.reviews.slice().reverse();
  reviews.forEach((r: any, index: any) => {
    let d: any = [];
    main_parameters.forEach((p) => {
      d.push(r.rates[p.key]);
    });
    let type = "area";
    if (index != 0) type = "line";
    series.push({ type: type, name: r.year, data: d });
  });

  const date: any = new Date(form.header.date);

  let risk = "";
  structure.reviews[structure.reviews.length - 1].segments.forEach((s: any) => {
  });

  return {
    tipologia: s.tipologia,
    fluxo: form.characteristics.flow_direction,
    comprimento: structure.reviews[structure.reviews.length - 1].length,
    pavimento: form.characteristics.pavement,
    localizacao: form.characteristics.localization,
    largura_total: form.characteristics.total_width,
    largura_transitavel: form.characteristics.cyclable_width,
    data: IntlDateStr(date),
    avaliacoes: structure.reviews.length,
    nota: structure.reviews[structure.reviews.length - 1].rates.average,
    categories: categories,
    series: series,
    parametros: main_parameters,
    situacoes: risk,
  };
}

function structureStatistics(structure: any, info: any) {
  const { nota, comprimento, avaliacoes } = { ...info };
  return {
    title: structure.street,
    subtitle: "Visão geral",
    boxes: [
      {
        title: "Nota geral",
        value: IntlNumberMax1Digit(nota),
      },
      {
        title: "Extensão (km)",
        value: IntlNumberMin1Max3Digits(comprimento / 1000),
      },
      { title: "Avaliações", value: avaliacoes },
    ],
  };
}


import { idecicloLayers } from "../components/Ideciclo/ideciclo_mapstyle";
import { VerticalStatisticsBoxesIdeciclo } from "../components/Ideciclo/VerticalStatisticsBoxesIdeciclo";
import { IntlDateStr, IntlNumberMax1Digit, IntlNumberMin1Max3Digits } from "~/services/utils";
import Breadcrumb from "~/components/Commom/Breadcrumb";
import { AmecicloMap } from "~/components/Commom/Maps/AmecicloMap";
import { StatisticsBoxIdecicloDetalhes } from "../components/Ideciclo/StatisticsBoxIdeciclo";
import { IdecicloDescription } from "../components/Ideciclo/IdecicloDescription";
import { RadarChart } from "../components/Charts/RadarChart";

import { useLoaderData } from "@remix-run/react";
import Banner from "~/components/Commom/Banner";
import { loader } from "~/loader/dados.ideciclo.$id";
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
