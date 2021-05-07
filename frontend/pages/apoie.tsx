import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import SEO from "../components/SEO";
import Breadcrumb from "../components/Breadcrumb";
import { ProductCard } from "../components/ProductCard";
import { server } from "../config";
import { Tab, TabPanel, Tabs, TabsNav } from "../components/Tabs";

const Produtos = ({ products, footer, recurrent }) => {
  const [filteredProducts, setFilteredProjects] = useState([]);
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (status) {
      setFilteredProjects(
        products.filter((project) => {
          return project.status === status;
        })
      );
    } else {
      setFilteredProjects(products);
    }
  }, [status, products]);

  const campaign = recurrent.campaigns[0]
  const rewards = campaign.rewards
  const suportMoney = campaign.supports.total.value
  const suportMembers = campaign.supports.total.count

  return (
    <Layout footer = {footer}>
      <SEO title="Apoie-nos" />
      <div
        className="bg-cover bg-center h-auto text-white py-24 px-10 object-fill"
        style={{
          width: "100%",
          height: "52vh",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundImage: `url('/projetos.webp')`,
        }}
      />
      <div className="bg-ameciclo text-white p-4 items-center uppercase flex">
        <div className="container mx-auto">
          <Breadcrumb
            label="Apoie"
            slug="/apoie"
            routes={["/", "/apoie"]}
          />
        </div>
      </div>
      <section className="container my-12 mx-auto">
      <div className="container mx-auto mt-8 mb-8">
        <div className="bg-ameciclo text-white flex lg:mx-0 mx-auto flex-wrap rounded p-16">
          <div className="lg:pr-5 w-full lg:w-1/2 mb-4 lg:mb-0">
            <p className="text-lg lg:text-3xl">
              APOIANDO A AMECICLO VOCÊ ESTÁ CONTRIBUINDO PARA UMA CIDADE MAIS
              <strong>
                &ensp; HUMANA, DEMOCRÁTICA E SUSTENTÁVEL
              </strong>
            </p>
          </div>
          <div className="w-full lg:w-1/2 mb-4 lg:mb-0">
            <p className="text-xs lg:text-base text-white mb-2 tracking-wide">
              Nos apoiando você estará contribuindo para que façamos ainda mais
              ações e projetos. Assim poderemos continuar nosso trabalho de 
              incidência política, articulação interinstitucional e estímulo à
              cultura da bicicleta. Como agradecimento, te enviaremos uma bela
              recompensa à sua escolha.
            </p>
            <div className="flex items-start justify-start flex-wrap max-w-5xl mx-auto mt-8 lg:mt-0">
              <a
                href="/projetos"
                className="bg-transparent border-2 border-white uppercase text-white font-bold hover:bg-white hover:text-ameciclo shadow text-xs px-4 py-2 rounded outline-none focus:outline-none sm:mr-2 mb-2"
                type="button"
                style={{ transition: "all .15s ease" }}
              >
                Veja o que já fizemos
              </a>
            </div>
          </div>
        </div>
        <Tabs initialValue="tab-coord">
          <TabsNav>
            <Tab name="tab-coord">Pontual</Tab>
            <Tab name="tab-conselho">Recorrente</Tab>
            {/*<Tab name="tab-alumni" disabled>*/}
            {/*  Alumni*/}
            {/*</Tab>*/}
          </TabsNav>
          <TabPanel name="tab-pontual">
            {products.map((c) => (
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
                      {c.firstName} {c.lastName}
                    </h2>
                    <p className="text-sm text-gray-600">{c.bio}</p>
                  </div>
                </div>
              </div>
            ))}
          </TabPanel>
          <TabPanel name="tab-recorrente">
            {products.map((c) => (
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
        <div className="mt-5 mx-3">
          <div className="inline-block relative w-64">
            <label htmlFor="status">Selecione o status:</label>
            <select
              value={status}
              name="status"
              className="block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline"
              onChange={(e) => setStatus(e.target.value)}
              onBlur={(e) => e}
            >
              <option value="">Todos</option>
              <option value="ongoing">Em andamento</option>
              <option value="finished">Realizado</option>
              <option value="paused">Pausado</option>
            </select>
          </div>
        </div>
        <div className="mt-5 mx-3 grid grid-cols-1 lg:grid-cols-4 gap-6">
          {filteredProducts
            .sort((a, b) => (a.name > b.name ? 1 : -1))
            .map((product) => (
              <ProductCard product={product} key={product.id} />
            ))}
        </div>
      </section>
    </Layout>
  );
};

export async function getStaticProps() {
  const res = await fetch(`${server}/products`);

  let products = []
  if (res.status === 200) {
    products = await res.json();
  }

  const res_current = await fetch(`https://apoia.se/api/v1/users/ameciclo`);

  let recurrent = []
  if (res.status === 200) {
    recurrent = await res.json();
  }

  const res_footer = await fetch(`${server}/footer`);
  let footer;
  if (res_footer.status === 200) {
    footer = await res_footer.json();
  }

  return {
    props: {
      products,
      footer,
      recurrent,
    },
    revalidate: 1,
  };
}

export default Produtos;
