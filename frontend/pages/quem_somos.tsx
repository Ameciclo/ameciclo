import Layout from "../components/Layout";
import SEO from "../components/SEO";
import { Tab, TabPanel, Tabs, TabsNav } from "../components/Tabs";
import Breadcrumb from "../components/Breadcrumb";
import Image from "next/image";
import React from "react";

const QuemSomos = ({ coordinators, counselors }) => {
  return (
    <Layout>
      <SEO title="Quem Somos" />
      <div
        className="bg-cover bg-center h-auto text-white py-24 px-10 object-fill"
        style={{
          width: "100%",
          height: "40vh",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundImage: `url('/quem_somos.webp')`,
        }}
      />
      <div className="bg-ameciclo text-white p-4 items-center uppercase flex">
        <div className="container mx-auto">
          <Breadcrumb
            label="Quem Somos"
            slug="/quem_somos"
            routes={["/", "/quem_somos"]}
          />
        </div>
      </div>
      <div className="container mx-auto mt-8 mb-8">
        <div className="bg-ameciclo text-white flex lg:mx-0 mx-auto flex-wrap rounded p-16">
          <div className="lg:pr-5 w-full lg:w-1/2 mb-4 lg:mb-0">
            <p className="text-lg lg:text-3xl">
              A AMECICLO É UMA ORGANIZAÇÃO DA SOCIEDADE CIVIL QUE LUTA PELO
              <strong>
                &ensp; DIREITO À CIDADE E NA REGIÃO METROPOLITANA DO RECIFE
              </strong>
            </p>
          </div>
          <div className="w-full lg:w-1/2 mb-4 lg:mb-0">
            <p className="text-xs lg:text-base text-white mb-2 tracking-wide">
              Nos propomos a a transformar a cidade, através da bicicleta, em um
              ambiente mais humano, democrático e sustentável. Para isso,
              fazemos diversas atividades que estimulam a cultura da bicicleta,
              que oportunizam o trabalho conjunto com coletivos, grupos e
              instituições parceiras, e que geram incidência técnica e política
              no Recife e na Região Metropolitana.
            </p>
            <div className="flex items-start justify-start flex-wrap max-w-5xl mx-auto mt-8 lg:mt-0">
              <a
                href="http://estatuto.ameciclo.org"
                className="bg-transparent border-2 border-white uppercase text-white font-bold hover:bg-white hover:text-ameciclo shadow text-xs px-4 py-2 rounded outline-none focus:outline-none sm:mr-2 mb-2"
                type="button"
                style={{ transition: "all .15s ease" }}
              >
                Conheça nosso estatuto
              </a>
              <a
                href="/linha%20do%20tempo%20ameciclo.pdf"
                className="bg-transparent border-2 border-white uppercase text-white font-bold hover:bg-white hover:text-ameciclo shadow text-xs px-4 py-2 rounded outline-none focus:outline-none sm:mr-2 lg:mt-0 mt-2"
                type="button"
                style={{ transition: "all .15s ease" }}
              >
                Conheça nossa historia
              </a>
            </div>
          </div>
        </div>
        <Tabs initialValue="tab-coord">
          <TabsNav>
            <Tab name="tab-coord">Coordenação</Tab>
            <Tab name="tab-conselho">Conselho Fiscal</Tab>
            {/*<Tab name="tab-alumni" disabled>*/}
            {/*  Alumni*/}
            {/*</Tab>*/}
          </TabsNav>
          <TabPanel name="tab-coord">
            {coordinators.map((c) => (
              <div className="p-4 max-w-sm" key={c.id}>
                <div
                  className="shadow-lg rounded bg-white"
                  style={{ minHeight: "450px" }}
                >
                  {c.media ? (
                    <div
                      style={{
                        minHeight: "270px",
                        position: "relative",
                      }}
                    >
                      <Image src={c.media.url} layout="fill" />
                    </div>
                  ) : (
                    <div
                      style={{
                        minHeight: "270px",
                      }}
                    />
                  )}
                  <div className="p-4 pb-6">
                    <h2 className="text-xl leading-normal text-gray-900">
                      {c.firstName} {c.lastName}
                    </h2>
                    <p className="text-sm text-gray-600">{c.bio}</p>
                  </div>
                </div>
              </div>
            ))}
          </TabPanel>
          <TabPanel name="tab-conselho">
            {counselors.map((c) => (
              <div className="p-4 max-w-sm" key={c.id}>
                <div
                  className="shadow-lg rounded bg-white"
                  style={{ minHeight: "450px" }}
                >
                  {c.media ? (
                    <div
                      style={{
                        minHeight: "270px",
                        position: "relative",
                      }}
                    >
                      <Image src={c.media.url} layout="fill" />
                    </div>
                  ) : (
                    <div
                      style={{
                        minHeight: "270px",
                      }}
                    />
                  )}
                  <div className="p-4 pb-6">
                    <h2 className="text-xl leading-normal text-gray-900">
                      {c.firstName} {c.lastName}
                    </h2>
                    <p className="text-sm text-gray-600">{c.bio}</p>
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
  const c_res = await fetch("https://cms.ameciclo.org/coordinators");
  const co_res = await fetch("https://cms.ameciclo.org/counselors");

  let coordinators = [],
    counselors = [];
  if (c_res.status === 200) {
    coordinators = await c_res.json();
  }
  if (co_res.status === 200) {
    counselors = await co_res.json();
  }

  return {
    props: {
      coordinators,
      counselors,
    },
    revalidate: 1,
  };
}

export default QuemSomos;
