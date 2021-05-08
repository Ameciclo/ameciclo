import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import SEO from "../components/SEO";
import Breadcrumb from "../components/Breadcrumb";
import { ProductCard } from "../components/ProductCard";
import { server } from "../config";
import { Tab, TabPanel, Tabs, TabsNav } from "../components/Tabs";
import { getURL } from "next/dist/next-server/lib/utils";

const Produtos = ({ products, recurrent }) => {

  function getDesc(str) {
    let el = document.createElement('html')
    el.innerHTML = str
    let remove = ""
    if(el.getElementsByTagName('img').length > 0) {
      remove = el.getElementsByTagName('img')[0].outerHTML
    }
    el.innerHTML = str.replace(remove,"")
    return el.innerText
  }

  function getMedia(str) {
    const start = str.indexOf("https://")
    let end = str.indexOf(".png") + 4
    if(end < 5) {
      end = str.indexOf(".jpg") + 4
      if(end < 5) {
        return '/backgroundImage.webp'
      }
    }
    return str.substring(start, end)
  }

  function getURL(value) {
    return "https://apoia.se/support/ameciclo/new/" + value
  }
 
  let rewards = [];
  if (recurrent) {
    recurrent.campaigns[0].rewards.forEach(r => {
      rewards.push(
        {
          title: r.title,
          desc: getDesc(r.desc),
          media: {
            url: getMedia(r.desc),
          },
          value: r.value,
          url: getURL(r.value)         
        }
      )
    });
  }

  return (
    <Layout>
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
               <a
                href="http://apoia.ameciclo.org"
                className="bg-transparent border-2 border-white uppercase text-white font-bold hover:bg-white hover:text-ameciclo shadow text-xs px-4 py-2 rounded outline-none focus:outline-none sm:mr-2 mb-2"
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
            <div className="mt-5 mx-3 grid grid-cols-1 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                  <ProductCard product={product} key={product.id} />
                ))}
            </div>
          </TabPanel>
          <TabPanel name="tab-recorrente">
            <div className="mt-5 mx-3 grid grid-cols-1 lg:grid-cols-4 gap-6">
                {rewards.map((reward) => (
                    <ProductCard product={reward} key={reward.id} />
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

  let products = []
  if (res.status === 200) {
    products = await res.json();
  }

  const res_current = await fetch(`https://apoia.se/api/v1/users/ameciclo`);

  let recurrent = []
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
