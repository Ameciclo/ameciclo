import Layout from "../components/Layout";
import SEO from "../components/SEO";
import { Tab, TabPanel, Tabs, TabsNav } from "../components/Tabs";
import Breadcrumb from "../components/Breadcrumb";
import React from "react";
import { server } from "../config";
import ReactMarkdown from "react-markdown";


const QuemSomos = ({ ameciclistas, footer, custom }) => {
  const coordinators = ameciclistas.filter((a) => {
    return a.role === "coordenacao";
  })

  let counselors = ameciclistas.filter((a) => {
    return a.role === "conselhofiscal";
  })
  /*let alumin = ameciclistas.filter((a) => {
    return a.role === "ameciclista";
  })*/

  ameciclistas.sort((a, b) => {
    return (a.name).localeCompare(b.name)
  });

  return (
    <Layout footer = {footer}>
      <SEO title="Quem Somos" />
      <div
        className="bg-cover bg-center h-auto text-white py-24 px-10 object-fill"
        style={
          custom.cover ? ({
          width: "100%",
          height: "52vh",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundImage: `url(${custom.cover.url})`,
        }) : ({
          width: "100%",
          height: "52vh",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundImage: `url('/quem_somos.webp')`,
        })}
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
              <ReactMarkdown children={custom.definition} />
            </p>
          </div>
          <div className="w-full lg:w-1/2 mb-4 lg:mb-0">
            <p className="text-xs lg:text-base text-white mb-2 tracking-wide">
              {custom.objective}
            </p>
            <div className="flex items-start justify-start flex-wrap max-w-5xl mx-auto mt-8 lg:mt-0">
              {custom.links.map((l) => (
                <a
                  href={l.link}
                  className="bg-transparent border-2 border-white uppercase text-white font-bold hover:bg-white hover:text-ameciclo shadow text-xs px-4 py-2 rounded outline-none focus:outline-none sm:mr-2 mb-2"
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
              <div className="p-4 max-w-sm" key={c.id}>
                <div
                  className="shadow-lg rounded bg-white"
                  style={{ minHeight: "450px" }}
                >
                  {c.media ? (
                    <div
                      style={{
                        backgroundImage: `url(${c.media.url})`,
                        minHeight: "270px",
                        backgroundSize: "cover",
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "center",
                      }}
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
              <div className="p-4 max-w-sm" key={c.id}>
                <div
                  className="shadow-lg rounded bg-white"
                  style={{ minHeight: "450px" }}
                >
                  {c.media ? (
                    <div
                      style={{
                        backgroundImage: `url(${c.media.url})`,
                        minHeight: "270px",
                        backgroundSize: "cover",
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "center",
                      }}
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
              <div className="p-4 max-w-sm" key={c.id}>
                <div
                  className="shadow-lg rounded bg-white"
                  style={{ minHeight: "270px", minWidth: "270px" }}
                >
                  {c.media ? (
                    <div
                      style={{
                        backgroundImage: `url(${c.media.url})`,
                        minHeight: "270px",
                        backgroundSize: "cover",
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "center",
                      }}
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
  const res = await fetch(`${server}/ameciclistas`)
    
  let ameciclistas = []

  if (res.status === 200) {
    ameciclistas = await res.json();
  }
  
  const res_custom = await fetch(`${server}/quem-somos`);

  let custom;
  if (res_custom.status === 200) {
    custom = await res_custom.json();
  }

  const res_footer = await fetch(`${server}/footer`);

  let footer;
  if (res_footer.status === 200) {
    footer = await res_footer.json();
  }

  return {
    props: {
      ameciclistas,
      footer,
      custom,
    },
    revalidate: 1,
  };
}

export default QuemSomos;
