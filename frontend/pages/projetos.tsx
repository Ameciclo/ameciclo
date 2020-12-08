import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import SEO from "../components/SEO";
import Breadcrumb from "../components/Breadcrumb";
import { ProjectCard } from "../components/ProjectCard";

const Projetos = ({ projects }) => {
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (status) {
      setFilteredProjects(
        projects.filter((project) => {
          return project.status === status;
        })
      );
    } else {
      setFilteredProjects(projects);
    }
  }, [status, projects]);

  return (
    <Layout>
      <SEO title="Projetos" />
      <div
        className="bg-cover bg-center h-auto text-white py-24 px-10 object-fill"
        style={{
          width: "100%",
          height: "40vh",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundImage: `url('/projetos.webp')`,
        }}
      />
      <div className="bg-ameciclo text-white p-4 items-center uppercase flex">
        <div className="container mx-auto">
          <Breadcrumb
            label="Projetos"
            slug="/projetos"
            routes={["/", "/projetos"]}
          />
        </div>
      </div>
      <section className="container my-12 mx-auto">
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
              <option value="finished">Finalizado</option>
              <option value="paused">Pausado</option>
            </select>
          </div>
        </div>
        <div className="mt-5 mx-3 grid grid-cols-1 lg:grid-cols-4 gap-6">
          {filteredProjects.map((project) => (
            <ProjectCard project={project} key={project.id} />
          ))}
        </div>
      </section>
    </Layout>
  );
};

export async function getStaticProps() {
  const res = await fetch("https://cms.ameciclo.org/projects");
  let projects = [];
  if (res.status === 200) {
    projects = await res.json();
  }
  return {
    props: {
      projects,
    },
    revalidate: 1,
  };
}

export default Projetos;
