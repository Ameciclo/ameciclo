import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import SEO from "../components/SEO";
import { Tab, TabPanel, Tabs, TabsNav } from "../components/Tabs";
import Breadcrumb from "../components/Breadcrumb";
import { PersonCard } from "../components/PersonCard"
import React from "react";
import { server } from "../config";
import ReactMarkdown from "react-markdown";
import Image from "next/image";

const QuemSomos = ({ ameciclistas, custom }) => {
  const coordinators = ameciclistas.filter((a) => a.role === "coordenacao");
  const counselors = ameciclistas.filter((a) => a.role === "conselhofiscal");

  ameciclistas.sort((a, b) => a.name.localeCompare(b.name));

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
              <>
              <PersonCard key={c.id} person={c} />
              
              </>
              
            ))}
          </TabPanel>
          <TabPanel name="tab-conselho">
            {counselors.map((c) => (
              <PersonCard key={c.id} person={c} />
            ))}
          </TabPanel>
          <TabPanel name="tab-ameciclista">
            {ameciclistas.map((c) => (
              <PersonCard key={c.id} person={c} />
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
