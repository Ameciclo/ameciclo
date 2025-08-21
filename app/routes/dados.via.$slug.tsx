import { defer, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Await } from "@remix-run/react";
import { Suspense } from "react";
import Banner from "~/components/Commom/Banner";
import Breadcrumb from "~/components/Commom/Breadcrumb";
import { StatisticsBox } from "~/components/ExecucaoCicloviaria/StatisticsBox";
import { CardsSession } from "~/components/Commom/CardsSession";
import { unslugify } from "~/utils/slugify";
import { IntlNumber } from "~/services/utils";
import ViaTemporalCharts from "~/components/ViasInseguras/ViaTemporalCharts";
import ViaIndividualMap from "~/components/ViasInseguras/ViaIndividualMap";
import Table from "~/components/Commom/Table/Table";
import { VIAS_INSEGURAS_HISTORY, VIAS_INSEGURAS_BASE_URL, VIAS_INSEGURAS_SEARCH } from "~/servers";

const VIAS_INSEGURAS_PAGE_DATA = "https://cms.ameciclo.org/vias-inseguras";

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

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const fetchViaData = async (slug: string) => {
    const viaName = unslugify(slug);
    const url = `${VIAS_INSEGURAS_HISTORY}?via=${encodeURIComponent(viaName)}`;
    
    try {
      const res = await fetch(url, { cache: "no-cache" });
      if (!res.ok) {
        console.error(`API Error: ${res.status} ${res.statusText}`);
        return null;
      }
      return await res.json();
    } catch (error) {
      console.error("Error fetching via data:", error);
      return null;
    }
  };

  const fetchViaMapData = async (slug: string) => {
    const viaName = unslugify(slug);
    const url = `${VIAS_INSEGURAS_BASE_URL}/samu-calls/streets/map?via=${encodeURIComponent(viaName)}`;
    
    try {
      const res = await fetch(url, { cache: "no-cache" });
      if (!res.ok) {
        console.error(`Map API Error: ${res.status} ${res.statusText}`);
        return null;
      }
      return await res.json();
    } catch (error) {
      console.error("Error fetching via map data:", error);
      return null;
    }
  };

  const fetchViaSinistrosData = async (slug: string) => {
    const viaName = unslugify(slug);
    const url = `${VIAS_INSEGURAS_SEARCH}?street=${encodeURIComponent(viaName)}&limit=all&includeGeom=false`;
    
    try {
      const res = await fetch(url, { cache: "no-cache" });
      if (!res.ok) {
        console.error(`Sinistros API Error: ${res.status} ${res.statusText}`);
        return null;
      }
      return await res.json();
    } catch (error) {
      console.error("Error fetching via sinistros data:", error);
      return null;
    }
  };

  const fetchPageData = async () => {
    try {
      const res = await fetch(VIAS_INSEGURAS_PAGE_DATA, { cache: "no-cache" });
      if (!res.ok) {
        return { cover: { url: "/pages_covers/vias-inseguras.png" }, archives: [] };
      }
      return await res.json();
    } catch (error) {
      return { cover: { url: "/pages_covers/vias-inseguras.png" }, archives: [] };
    }
  };

  const dataPromise = fetchViaData(params.slug as string);
  const mapDataPromise = fetchViaMapData(params.slug as string);
  const sinistrosDataPromise = fetchViaSinistrosData(params.slug as string);
  const pageDataPromise = fetchPageData();

  return defer({ dataPromise, mapDataPromise, sinistrosDataPromise, pageDataPromise });
};

const getViaStatistics = (data: ViaHistoryData) => {
  const totalSinistros = data.evolucao.reduce((sum, year) => sum + year.sinistros, 0);
  const mediaAnual = Math.round(totalSinistros / data.evolucao.length);
  const ultimoAno = data.evolucao[data.evolucao.length - 1];
  const primeiroAno = data.evolucao[0];
  
  return [
    { title: "Total de Sinistros", value: IntlNumber(totalSinistros) },
    { title: "Média Anual", value: IntlNumber(mediaAnual) },
    { title: "Período Analisado", value: `${primeiroAno.ano} - ${ultimoAno.ano}` },
    { title: "Último Ano", value: `${IntlNumber(ultimoAno.sinistros)} (${ultimoAno.ano})` },
  ];
};

export default function ViaInsegura() {
  const { dataPromise, mapDataPromise, sinistrosDataPromise, pageDataPromise } = useLoaderData<typeof loader>();

  return (
    <main className="flex-auto">
      <Suspense fallback={<div className="animate-pulse bg-gray-300 h-64" />}>
        <Await resolve={pageDataPromise}>
          {(pageData) => (
            <Banner 
              image={pageData?.cover?.url || "/pages_covers/vias-inseguras.png"} 
              alt="Capa das vias inseguras" 
            />
          )}
        </Await>
      </Suspense>

      <Suspense fallback={<div className="animate-pulse bg-gray-200 h-12" />}>
        <Await resolve={dataPromise}>
          {(data) => (
            <Breadcrumb 
              label={data?.via || "Via"} 
              slug={`/vias-inseguras/${data?.via}`} 
              routes={["/", "/dados", "/dados/vias-inseguras"]} 
            />
          )}
        </Await>
      </Suspense>

      <section className="container mx-auto px-4 py-8">
        <Suspense fallback={<div className="animate-pulse bg-gray-200 h-32" />}>
          <Await resolve={dataPromise}>
            {(data) => {
              if (!data || !data.via) {
                return (
                  <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-red-600 mb-2">
                      Via não encontrada
                    </h1>
                    <p className="text-lg text-gray-600">
                      Os dados desta via não estão disponíveis no momento.
                    </p>
                  </div>
                );
              }
              return (
                <div className="text-center mb-8">
                  <h1 className="text-3xl font-bold text-gray-800 mb-2">
                    {data.via}
                  </h1>
                  <p className="text-lg text-gray-600">
                    Parte do Observatório das Vias Inseguras
                  </p>
                </div>
              );
            }}
          </Await>
        </Suspense>

        <Suspense fallback={<div className="animate-pulse bg-gray-200 h-48" />}>
          <Await resolve={dataPromise}>
            {(data) => {
              if (!data || !data.via) return null;
              return (
                <StatisticsBox 
                  title="Estatísticas Gerais da Via" 
                  boxes={getViaStatistics(data)} 
                />
              );
            }}
          </Await>
        </Suspense>

        {/* Perfil Socioeconômico */}
        <Suspense fallback={<div className="animate-pulse bg-gray-200 h-96" />}>
          <Await resolve={dataPromise}>
            {(data) => {
              if (!data || !data.via || !data.evolucao?.length) return null;
              
              // Agregar dados de todos os anos
              const aggregatedData = {
                por_sexo: { masculino: 0, feminino: 0, nao_informado: 0 },
                por_faixa_etaria: {} as Record<string, number>,
                por_categoria: {} as Record<string, number>,
              };

              data.evolucao.forEach((year) => {
                // Agregar dados de sexo
                if (year.por_sexo) {
                  aggregatedData.por_sexo.masculino += year.por_sexo.masculino || 0;
                  aggregatedData.por_sexo.feminino += year.por_sexo.feminino || 0;
                  aggregatedData.por_sexo.nao_informado += year.por_sexo.nao_informado || 0;
                }

                // Agregar dados de idade
                if (year.por_faixa_etaria) {
                  Object.entries(year.por_faixa_etaria).forEach(([key, value]) => {
                    aggregatedData.por_faixa_etaria[key] = (aggregatedData.por_faixa_etaria[key] || 0) + value;
                  });
                }

                // Agregar dados de categoria
                if (year.por_categoria) {
                  Object.entries(year.por_categoria).forEach(([key, value]) => {
                    aggregatedData.por_categoria[key] = (aggregatedData.por_categoria[key] || 0) + value;
                  });
                }
              });

              // Processar dados de sexo
              const genderTotal = aggregatedData.por_sexo.masculino + aggregatedData.por_sexo.feminino + aggregatedData.por_sexo.nao_informado;
              const genderData = genderTotal > 0 ? [
                {
                  label: "Masculino",
                  value: ((aggregatedData.por_sexo.masculino / genderTotal) * 100).toFixed(1),
                  total: aggregatedData.por_sexo.masculino,
                  color: "#3b82f6",
                },
                {
                  label: "Feminino",
                  value: ((aggregatedData.por_sexo.feminino / genderTotal) * 100).toFixed(1),
                  total: aggregatedData.por_sexo.feminino,
                  color: "#ec4899",
                },
                {
                  label: "Não Informado",
                  value: ((aggregatedData.por_sexo.nao_informado / genderTotal) * 100).toFixed(1),
                  total: aggregatedData.por_sexo.nao_informado,
                  color: "#6b7280",
                },
              ] : [];

              // Processar dados de idade
              const ageTotal = Object.values(aggregatedData.por_faixa_etaria).reduce((sum, val) => sum + val, 0);
              const ageData = ageTotal > 0 ? Object.entries(aggregatedData.por_faixa_etaria).map(([key, value], index) => ({
                label: key.replace(/_/g, " "),
                value: ((value / ageTotal) * 100).toFixed(1),
                total: value,
                color: ["#10b981", "#3b82f6", "#f59e0b", "#8b5cf6", "#dc2626"][index % 5],
              })) : [];

              // Processar dados de categoria
              const categoryLabels = {
                sinistro_moto: "Sinistro de Moto",
                sinistro_carro: "Sinistro de Carro",
                atropelamento_carro: "Atropelamento por Carro",
                atropelamento_moto: "Atropelamento por Moto",
                sinistro_bicicleta: "Sinistro de Bicicleta",
                sinistro_onibus_caminhao: "Sinistro Ônibus/Caminhão",
                atropelamento_onibus_caminhao: "Atropelamento Ônibus/Caminhão",
                atropelamento_bicicleta: "Atropelamento de Bicicleta",
                outro: "Outro",
                nao_informado: "Não Informado",
              };

              const categoryTotal = Object.values(aggregatedData.por_categoria).reduce((sum, val) => sum + val, 0);
              const categoryData = categoryTotal > 0 ? Object.entries(aggregatedData.por_categoria)
                .sort(([, a], [, b]) => b - a)
                .map(([key, value], index) => ({
                  label: categoryLabels[key as keyof typeof categoryLabels] || key,
                  value: ((value / categoryTotal) * 100).toFixed(1),
                  total: value,
                  color: ["#f59e0b", "#10b981", "#3b82f6", "#8b5cf6", "#dc2626", "#06b6d4", "#84cc16", "#f97316", "#6366f1"][index % 9],
                })) : [];

              return (
                <section className="mb-12">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                    Perfil dos Sinistros
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Por Sexo */}
                    <div className="bg-white rounded-lg shadow-lg p-6">
                      <h4 className="text-lg font-bold mb-4">Perfil de Sexo (%)</h4>
                      <div className="space-y-3">
                        {genderData.length > 0 ? (
                          genderData.map((item, index) => (
                            <div key={index} className="flex justify-between items-center">
                              <div className="flex items-center">
                                <div
                                  className="w-4 h-4 rounded mr-2"
                                  style={{ backgroundColor: item.color }}
                                ></div>
                                <span className="text-sm">{item.label}</span>
                              </div>
                              <span className="font-bold">
                                {item.total.toLocaleString()} ({item.value}%)
                              </span>
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-500 text-sm">Sem dados disponíveis</p>
                        )}
                      </div>
                    </div>

                    {/* Por Faixa Etária */}
                    <div className="bg-white rounded-lg shadow-lg p-6">
                      <h4 className="text-lg font-bold mb-4">Perfil de Idade (%)</h4>
                      <div className="space-y-3">
                        {ageData.length > 0 ? (
                          ageData.map((item, index) => (
                            <div key={index} className="flex justify-between items-center">
                              <div className="flex items-center">
                                <div
                                  className="w-4 h-4 rounded mr-2"
                                  style={{ backgroundColor: item.color }}
                                ></div>
                                <span className="text-sm">{item.label}</span>
                              </div>
                              <span className="font-bold">
                                {item.total.toLocaleString()} ({item.value}%)
                              </span>
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-500 text-sm">Sem dados disponíveis</p>
                        )}
                      </div>
                    </div>

                    {/* Por Categoria */}
                    <div className="bg-white rounded-lg shadow-lg p-6">
                      <h4 className="text-lg font-bold mb-4">Tipo de Sinistro (%)</h4>
                      <div className="space-y-3">
                        {categoryData.length > 0 ? (
                          categoryData.map((item, index) => (
                            <div key={index} className="flex justify-between items-center">
                              <div className="flex items-center">
                                <div
                                  className="w-4 h-4 rounded mr-2"
                                  style={{ backgroundColor: item.color }}
                                ></div>
                                <span className="text-sm">{item.label}</span>
                              </div>
                              <span className="font-bold">
                                {item.total.toLocaleString()} ({item.value}%)
                              </span>
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-500 text-sm">Sem dados disponíveis</p>
                        )}
                      </div>
                    </div>
                  </div>
                </section>
              );
            }}
          </Await>
        </Suspense>

        {/* Mapa da Via */}
        <Suspense fallback={<div className="animate-pulse bg-gray-200 h-96" />}>
          <Await resolve={Promise.all([dataPromise, mapDataPromise])}>
            {([data, mapData]) => {
              if (!data || !data.via) return null;
              
              const totalSinistros = data.evolucao.reduce((sum, year) => sum + year.sinistros, 0);

              return (
                <section className="mb-12">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                    Localização da Via
                  </h2>
                  <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <ViaIndividualMap 
                      viaName={data.via} 
                      totalSinistros={totalSinistros}
                      mapData={mapData}
                    />
                  </div>
                </section>
              );
            }}
          </Await>
        </Suspense>

        {/* Evolução Anual de Sinistros */}
        <Suspense fallback={<div className="animate-pulse bg-gray-200 h-96" />}>
          <Await resolve={dataPromise}>
            {(data) => {
              if (!data || !data.via || !data.evolucao?.length) return null;
              
              return (
                <section className="mb-12">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                    Evolução Anual de Sinistros
                  </h2>
                  <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                      {data.evolucao.map((year) => (
                        <div key={year.ano} className="text-center p-4 border rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">{year.ano}</div>
                          <div className="text-lg font-semibold">{IntlNumber(year.sinistros)}</div>
                          <div className="text-sm text-gray-600">sinistros</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Gráficos Temporais Interativos */}
                  <ViaTemporalCharts data={data.evolucao} />
                </section>
              );
            }}
          </Await>
        </Suspense>

        {/* Tabela de Sinistros */}
        <Suspense fallback={<div className="animate-pulse bg-gray-200 h-96" />}>
          <Await resolve={sinistrosDataPromise}>
            {(sinistrosData) => {
              if (!sinistrosData?.sinistros?.length) return null;
              
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
              
              const tableData = sinistrosData.sinistros
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
                .sort((a, b) => b._sortDate.getTime() - a._sortDate.getTime());

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
            }}
          </Await>
        </Suspense>
      </section>

      {/* Documentos */}
      <Suspense fallback={<div className="animate-pulse bg-gray-200 h-48" />}>
        <Await resolve={pageDataPromise}>
          {(pageData) => {
            if (!pageData?.archives?.length) return null;
            
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
          }}
        </Await>
      </Suspense>
    </main>
  );
}