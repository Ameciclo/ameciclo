import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import SEO from "../components/SEO";
import Breadcrumb from "../components/Breadcrumb";
import { ProductCard } from "../components/ProductCard";
import { server } from "../config";
import { Tab, TabPanel, Tabs, TabsNav } from "../components/Tabs";
import Link from "next/link";

const Produtos = ({ products, recurrent }) => {
  const getMedia = (str) => {
    let arr = /img.*?src=("|')(.*?)\1/i.exec(str);
    return arr && arr.length ? arr[2] : "/backgroundImage.webp";
  };

  const getURL = (v) => {
    return `https://apoia.se/support/ameciclo/new/${v}`;
  };
  let rewards = [];
  if (recurrent) {
    rewards = recurrent.campaigns[0].rewards.map((r) => {
      return {
        title: r.title,
        desc: r.desc.replace(/(<([^>]+)>)/gi, ""),
        media: {
          url: getMedia(r.desc),
        },
        value: r.value,
        url: getURL(r.value),
      };
    });
  }

  return (
    <Layout>
      <SEO title="Apoie-nos" />
      <div
        className="object-fill h-auto px-10 py-24 text-white bg-center bg-cover"
        style={{
          width: "100%",
          height: "52vh",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundImage: `url('/projetos.webp')`,
        }}
      />
      <div className="flex items-center p-4 text-white uppercase bg-ameciclo">
        <div className="container mx-auto">
          <Breadcrumb label="Apoie" slug="/apoie" routes={["/", "/apoie"]} />
        </div>
      </div>
      <section className="container mx-auto my-12">
        <div className="container mx-auto mt-8 mb-8">
          <div className="flex flex-wrap p-16 mx-auto text-white rounded bg-ameciclo lg:mx-0">
            <div className="w-full mb-4 lg:pr-5 lg:w-1/2 lg:mb-0">
              <p className="text-lg lg:text-3xl">
                APOIANDO A AMECICLO VOCÊ ESTÁ CONTRIBUINDO PARA UMA CIDADE MAIS
                <strong>&ensp; HUMANA, DEMOCRÁTICA E SUSTENTÁVEL</strong>
              </p>
            </div>
            <div className="w-full mb-4 lg:w-1/2 lg:mb-0">
              <p className="mb-2 text-xs tracking-wide text-white lg:text-base">
                Nos apoiando você estará contribuindo para que façamos ainda
                mais ações e projetos. Assim poderemos continuar nosso trabalho
                de incidência política, articulação interinstitucional e
                estímulo à cultura da bicicleta. Como agradecimento, te
                enviaremos uma bela recompensa à sua escolha.
              </p>
              <div className="flex flex-wrap items-start justify-start max-w-5xl mx-auto mt-8 lg:mt-0">
                <Link href="/projetos">
                  <a
                    className="px-4 py-2 mb-2 text-xs font-bold text-white uppercase bg-transparent border-2 border-white rounded shadow outline-none hover:bg-white hover:text-ameciclo focus:outline-none sm:mr-2"
                    type="button"
                    style={{ transition: "all .15s ease" }}
                  >
                    Veja o que já fizemos
                  </a>
                </Link>
                <a
                  href="http://apoia.ameciclo.org"
                  className="px-4 py-2 mb-2 text-xs font-bold text-white uppercase bg-transparent border-2 border-white rounded shadow outline-none hover:bg-white hover:text-ameciclo focus:outline-none sm:mr-2"
                  type="button"
                  style={{ transition: "all .15s ease" }}
                >
                  Site da campanha recorrente
                </a>
              </div>
            </div>
          </div>
          <Tabs initialValue="tab-pontual">
            <TabsNav>
              <Tab name="tab-pontual">Pontual</Tab>
              <Tab name="tab-recorrente">Recorrente</Tab>
            </TabsNav>
            <TabPanel name="tab-pontual">
              <div className="grid grid-cols-1 gap-6 mx-3 mt-5 lg:grid-cols-4">
                {products.map((product) => (
                  <ProductCard product={product} key={product.id} />
                ))}
              </div>
            </TabPanel>
            <TabPanel name="tab-recorrente">
              <div className="grid grid-cols-1 gap-6 mx-3 mt-5 lg:grid-cols-4">
                {rewards.map((reward) => (
                  <ProductCard product={reward} key={reward.title} />
                ))}
              </div>
            </TabPanel>
          </Tabs>
        </div>
      </section>
    </Layout>
  );
};

export async function getStaticProps() {
  const res = await fetch(`${server}/products`);

  let products = [];
  if (res.status === 200) {
    products = await res.json();
  }

  const res_current = await fetch(`https://apoia.se/api/v1/users/ameciclo`);

  let recurrent = [];
  if (res_current.status === 200) {
    recurrent = await res_current.json();
  }

  return {
    props: {
      products,
      recurrent,
    },
    revalidate: 1,
  };
}

export default Produtos;
