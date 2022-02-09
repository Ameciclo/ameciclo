import Layout from "../components/Layout";
import SEO from "../components/SEO";
import { Tab, TabPanel, Tabs, TabsNav } from "../components/Tabs";
import Breadcrumb from "../components/Breadcrumb";
import React from "react";
import { server } from "../config";
import ReactMarkdown from "react-markdown";
import Image from "next/image";

const QuemSomos = ({ ameciclistas, custom }) => {
  const coordinators = ameciclistas.filter((a) => {
    return a.role === "coordenacao";
  });

  let counselors = ameciclistas.filter((a) => {
    return a.role === "conselhofiscal";
  });
  /*let alumin = ameciclistas.filter((a) => {
    return a.role === "ameciclista";
  })*/

  ameciclistas.sort((a, b) => {
    return a.name.localeCompare(b.name);
  });

  return (
    <Layout>
      <SEO title="Quem Somos" />
      <div className="relative py-24 w-full h-[52vh]">
        <Image
          src={"/quem_somos.webp"}
          alt="Quem somos?"
          layout="fill"
          objectFit="cover"
          objectPosition="center"
        />
      </div>
      <div className="flex items-center p-4 text-white uppercase bg-ameciclo">
        <div className="container mx-auto">
          <Breadcrumb
            label="Quem Somos"
            slug="/quem_somos"
            routes={["/", "/quem_somos"]}
          />
        </div>
      </div>
      <div className="container mx-auto mt-8 mb-8">
        <div className="flex flex-wrap p-16 mx-auto text-white rounded bg-ameciclo lg:mx-0">
          <div className="w-full mb-4 lg:pr-5 lg:w-1/2 lg:mb-0">
            <div className="text-lg lg:text-3xl">
              <ReactMarkdown>{custom.definition}</ReactMarkdown>
            </div>
          </div>
          <div className="w-full mb-4 lg:w-1/2 lg:mb-0">
            <p className="mb-2 text-xs tracking-wide text-white lg:text-base">
              {custom.objective}
            </p>
            <div className="flex flex-wrap items-start justify-start max-w-5xl mx-auto mt-8 lg:mt-0">
              {custom.links.map((l) => (
                <a
                  key={l.id}
                  href={l.link}
                  className="px-4 py-2 mb-2 text-xs font-bold text-white uppercase bg-transparent border-2 border-white rounded shadow outline-none hover:bg-white hover:text-ameciclo focus:outline-none sm:mr-2"
                  type="button"
                  style={{ transition: "all .15s ease" }}
                >
                  {l.title}
                </a>
              ))}
            </div>
          </div>
        </div>
        <Tabs initialValue="tab-ameciclista">
          <TabsNav>
            <Tab name="tab-ameciclista">Ameciclistas</Tab>
            <Tab name="tab-coord">Coordenação</Tab>
            <Tab name="tab-conselho">Conselho Fiscal</Tab>
          </TabsNav>
          <TabPanel name="tab-coord">
            {coordinators.map((c) => (
              <div className="max-w-sm p-4" key={c.id}>
                <div
                  className="bg-white rounded shadow-lg"
                  style={{ minHeight: "450px" }}
                >
                  {c.media ? (
                    <Image
                      src={c.media.url}
                      alt={c.name}
                      layout="responsive"
                      width={352}
                      height={270}
                    />
                  ) : (
                    <div
                      style={{
                        minHeight: "270px",
                      }}
                    />
                  )}
                  <div className="p-4 pb-6">
                    <h2 className="text-xl leading-normal text-gray-900">
                      {c.name}
                    </h2>
                    <p className="text-sm text-gray-600">{c.bio}</p>
                  </div>
                </div>
              </div>
            ))}
          </TabPanel>
          <TabPanel name="tab-conselho">
            {counselors.map((c) => (
              <div className="max-w-sm p-4" key={c.id}>
                <div
                  className="bg-white rounded shadow-lg"
                  style={{ minHeight: "450px" }}
                >
                  {c.media ? (
                    <Image
                      src={c.media.url}
                      alt={c.name}
                      layout="responsive"
                      width={352}
                      height={270}
                    />
                  ) : (
                    <div
                      style={{
                        minHeight: "270px",
                      }}
                    />
                  )}
                  <div className="p-4 pb-6">
                    <h2 className="text-xl leading-normal text-gray-900">
                      {c.name}
                    </h2>
                    <p className="text-sm text-gray-600">{c.bio}</p>
                  </div>
                </div>
              </div>
            ))}
          </TabPanel>
          <TabPanel name="tab-ameciclista">
            {ameciclistas.map((c) => (
              <div className="max-w-sm p-4" key={c.id}>
                <div className="bg-white rounded shadow-lg min-h-[270px] min-w-[270px]">
                  <div className="aspect-w-1 aspect-h-1">
                    {c.media ? (
                      <Image
                        src={c.media.url}
                        alt={c.name}
                        layout="fill"
                        objectFit="cover"
                      />
                    ) : (
                      <div
                        style={{
                          minHeight: "270px",
                        }}
                      />
                    )}
                  </div>
                  <div className="p-4 pb-6">
                    <h2 className="text-xl leading-normal text-gray-900">
                      {c.name}
                    </h2>
                    {/*c.bio && (<p className="text-sm text-gray-600">{c.bio}</p>) */}
                  </div>
                </div>
              </div>
            ))}
          </TabPanel>
        </Tabs>
      </div>
    </Layout>
  );
};

export async function getStaticProps() {
  const res = await fetch(`${server}/ameciclistas`);

  let ameciclistas = [];

  if (res.status === 200) {
    ameciclistas = await res.json();
  }

  const res_custom = await fetch(`${server}/quem-somos`);

  let custom;
  if (res_custom.status === 200) {
    custom = await res_custom.json();
  }

  return {
    props: {
      ameciclistas,
      custom,
    },
    revalidate: 1,
  };
}

export default QuemSomos;
