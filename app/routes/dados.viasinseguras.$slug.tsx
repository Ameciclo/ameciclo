import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import Banner from "~/components/Commom/Banner";
import Breadcrumb from "~/components/Commom/Breadcrumb";
import { StatisticsBox } from "~/components/ExecucaoCicloviaria/StatisticsBox";
import { CardsSession } from "~/components/Commom/CardsSession";
import { IntlNumber } from "~/services/utils";
import Table from "~/components/Commom/Table/Table";
import { PerfilSocioeconomicoSection } from "~/components/ViasInseguras/sections/PerfilSocioeconomicoSection";
import { MapSection } from "~/components/ViasInseguras/sections/MapSection";
import { EvolucaoAnualSection } from "~/components/ViasInseguras/sections/EvolucaoAnualSection";
import { processProfileData } from "~/components/ViasInseguras/sections/profileDataHelper";
import { viasInsegurasSlugQueryOptions } from "~/loader/dados.viasinseguras.$slug";

interface ViaHistoryData {
  evolucao: Array<{
    ano: string;
    sinistros: number;
    meses: Record<string, number>;
    dias_com_dados: number;
    dias_com_sinistros: number;
    ultimo_dia: string;
    dias_semana: Record<string, number>;
    horarios: Record<string, number>;
  }>;
  via: string;
  filtro_desfechos: string;
}



const getViaStatistics = (data: ViaHistoryData, mapData?: any) => {
  const totalSinistros = data.evolucao.reduce((sum, year) => sum + year.sinistros, 0);

  // Calcular média anual ajustada por dias com dados
  const mediaAjustada = data.evolucao.reduce((sum, year) => {
    const diasComDados = year.dias_com_dados || 365;
    const sinistrosPorDia = year.sinistros / diasComDados;
    return sum + (sinistrosPorDia * 365);
  }, 0) / data.evolucao.length;

  // Encontrar ano mais perigoso
  const anoMaisPerigoso = data.evolucao.reduce((max, year) => {
    const diasComDados = year.dias_com_dados || 365;
    const sinistrosPorDia = year.sinistros / diasComDados;
    const maxDiasComDados = max.dias_com_dados || 365;
    const maxSinistrosPorDia = max.sinistros / maxDiasComDados;
    return sinistrosPorDia > maxSinistrosPorDia ? year : max;
  });

  const primeiroAno = data.evolucao[0];
  const ultimoAno = data.evolucao[data.evolucao.length - 1];

  // Extensão da via (se disponível nos dados do mapa)
  const extensaoVia = mapData?.vias?.[0]?.km;

  const stats = [
    { title: "Total de vítimas", value: IntlNumber(totalSinistros), unit: `${primeiroAno.ano} - ${ultimoAno.ano}` },
    { title: "Média Anual", value: IntlNumber(Math.round(mediaAjustada)), unit: "ajustada pelas projeções" },
    { title: "Ano Mais Perigoso", value: `${anoMaisPerigoso.ano}`, unit: `com ${anoMaisPerigoso.ano} sinsitros` },
    { title: "Extensão da Via", value: `${extensaoVia.toFixed(1)}`, unit: "km" }
  ];

  return stats;
};

export const Route = createFileRoute("/dados/viasinseguras/$slug")({
  loader: ({ params, context: { queryClient } }) =>
    queryClient.ensureQueryData(viasInsegurasSlugQueryOptions(params.slug)),
  component: ViaInsegura,
});

function ViaInsegura() {
  const { slug } = Route.useParams();
  const { data: { data, mapData, sinistrosData, pageData } } = useSuspenseQuery(viasInsegurasSlugQueryOptions(slug));

  const categoryLabels = {
    "Acidente de Moto": "Sinistro de Moto",
    "Acidente de Carro": "Sinistro de Carro",
    "Atropelamento por Carro": "Atropelamento por Carro",
    "Atropelamento por Moto": "Atropelamento por Moto",
    "Acidente de Bicicleta": "Sinistro de Bicicleta",
    "Acidente de Ônibus/Caminhão": "Sinistro Ônibus/Caminhão",
    "Atropelamento por Ônibus/Caminhão": "Atropelamento Ônibus/Caminhão",
    "Atropelamento de Bicicleta": "Sinistro de Bicicleta",
    "Outro": "Outro",
    "Não Informado": "Não Informado",
  };

  // Filtrar apenas as categorias de desfecho permitidas
  const allowedDesfechos = [
    'Atendimento Concluído com Êxito',
    'Removido por Particulares',
    'Removido pelos Bombeiros/CIODS',
    'Óbito no Local/Atendimento'
  ];

  return (
    <main className="flex-auto">
      <Banner
        image={pageData?.cover?.url || "/pages_covers/vias-inseguras.png"}
        alt="Capa das vias inseguras"
      />

      <Breadcrumb
        label={data?.via || "Via"}
        slug={`/dados/vias-inseguras/${data?.via}`}
        routes={["/", "/dados", "/dados/vias-inseguras"]}
      />

      <section className="container mx-auto px-4 py-8">
        {(!data || !data.via) ? (
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-red-600 mb-2">
              Via não encontrada
            </h1>
            <p className="text-lg text-gray-600">
              Os dados desta via não estão disponíveis no momento.
            </p>
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Observatório das Vias Inseguras
              </h1>
            </div>

            <StatisticsBox
              title={data.via}
              boxes={getViaStatistics(data, mapData)}
            />

            {data.evolucao?.length > 0 && (() => {
              const { genderData, ageData, categoryData } = processProfileData(data.evolucao);
              return (
                <PerfilSocioeconomicoSection
                  genderData={genderData}
                  ageData={ageData}
                  categoryData={categoryData}
                />
              );
            })()}

            {(() => {
              const totalSinistros = data.evolucao.reduce((sum: number, year: any) => sum + year.sinistros, 0);
              let geoJsonData = null;

              if (mapData?.vias?.length > 0) {
                const via = mapData.vias[0];
                if (via.geometria?.coordinates) {
                  geoJsonData = {
                    type: "FeatureCollection",
                    features: [{
                      type: "Feature",
                      properties: {
                        nome: via.nome || data.via,
                        sinistros: via.sinistros || totalSinistros,
                        km: via.km,
                        sinistros_por_km: via.sinistros_por_km
                      },
                      geometry: via.geometria
                    }]
                  };
                }
              }

              return (
                <MapSection
                  viaName={data.via}
                  totalSinistros={totalSinistros}
                  geoJsonData={geoJsonData}
                />
              );
            })()}

            {data.evolucao?.length > 0 && (
              <EvolucaoAnualSection evolucaoData={data.evolucao} />
            )}

            {/* Tabela de Sinistros */}
            {sinistrosData?.sinistros?.length > 0 && (() => {
              const tableData = sinistrosData.sinistros
                .filter((sinistro: any) => {
                  const desfecho = sinistro.motivo_desf_cat || '';
                  return allowedDesfechos.includes(desfecho);
                })
                .map((sinistro: any) => {
                  const mappedCategoria = categoryLabels[sinistro.categoria as keyof typeof categoryLabels] || sinistro.categoria || '-';
                  return {
                    data_hora: `${new Date(sinistro.data).toLocaleDateString('pt-BR')} ${sinistro.hora_minuto?.substring(0, 5) || ''}`.trim(),
                    categoria: mappedCategoria,
                    sexo: sinistro.sexo || '-',
                    idade: sinistro.idade || '-',
                    desfecho: sinistro.motivo_desf_cat || '-',
                    _sortDate: new Date(sinistro.data + ' ' + (sinistro.hora_minuto || '00:00')),
                  };
                })
                .sort((a: any, b: any) => b._sortDate.getTime() - a._sortDate.getTime());

              const columns = [
                { Header: "Data e Hora", accessor: "data_hora", disableFilters: false },
                { Header: "Categoria", accessor: "categoria", disableFilters: false },
                { Header: "Sexo", accessor: "sexo", disableFilters: false },
                { Header: "Idade", accessor: "idade", disableFilters: false },
                { Header: "Desfecho", accessor: "desfecho", disableFilters: false },
              ];

              return (
                <section className="mb-12">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                    Todos os Sinistros da Via
                  </h2>
                  <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <Table
                      title={`${tableData.length} sinistros registrados`}
                      data={tableData}
                      columns={columns}
                      showFilters={true}
                    />
                  </div>
                </section>
              );
            })()}
          </>
        )}
      </section>

      {/* Documentos */}
      {pageData?.archives?.length > 0 && (() => {
        const docs = pageData.archives.map((a: any) => ({
          title: a.filename,
          description: a.description,
          src: a.image?.url,
          url: a.file.url,
        }));

        return (
          <CardsSession
            title="Documentos sobre Vias Inseguras"
            cards={docs}
          />
        );
      })()}
    </main>
  );
}
