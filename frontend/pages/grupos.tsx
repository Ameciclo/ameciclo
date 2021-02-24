import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import SEO from "../components/SEO";
import Breadcrumb from "../components/Breadcrumb";
import { GroupCard } from "../components/GroupCard";

const Grupos = ({ groups }) => {
  const [filteredGroups, setFilteredGroups] = useState([]);
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (status) {
      setFilteredGroups(
        groups.filter((group) => {
          return group.telegram_id === status;
        })
      );
    } else {
      setFilteredGroups(groups);
    }
  }, [status, groups]);

  return (
    <Layout>
      <SEO title="Grupos de Trabalho" />
      <div
        className="bg-cover bg-center h-auto text-white py-24 px-10 object-fill"
        style={{
          width: "100%",
          height: "52vh",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundImage: `url('/quem_somos.webp')`,
        }}
      />
      <div className="bg-ameciclo text-white p-4 items-center uppercase flex">
        <div className="container mx-auto">
          <Breadcrumb
            label="Grupos de Trabalho"
            slug="/grupos"
            routes={["/", "/grupos"]}
          />
        </div>
      </div>
      <section className="container my-12 mx-auto">
        <div className="mt-5 mx-3">
          <div className="inline-block relative w-64">
            <label htmlFor="status">Selecione a diretriz:</label>
            <select
              value={status}
              name="status"
              className="block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline"
              onChange={(e) => setStatus(e.target.value)}
              onBlur={(e) => e}
            >
              <option value="">Todos</option>
              <option value="articular">Articulação Institucional</option>
              <option value="incidir">Incidência Política</option>
              <option value="cultuar">Cultura da Bicicleta</option>
              <option value="fortalecer">Fortalecimento Institucional</option>
            </select>
          </div>
        </div>
        <div className="mt-5 mx-3 grid grid-cols-1 lg:grid-cols-4 gap-6">
          {filteredGroups
            .sort((a, b) => (a.name > b.name ? 1 : -1))
            .map((groups) => (
              <GroupCard group={groups} key={groups.id} />
            ))}
        </div>
      </section>
    </Layout>
  );
};

export async function getStaticProps() {
  const res = await fetch("https://cms.ameciclo.org/workgroups");
  let groups = [];
  if (res.status === 200) {
    groups = await res.json();
  }
  return {
    props: {
      groups: groups,
    },
    revalidate: 1,
  };
}

export default Grupos;
