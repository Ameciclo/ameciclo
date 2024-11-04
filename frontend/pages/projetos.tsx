import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import SEO from "../components/SEO";
import Breadcrumb from "../components/Breadcrumb";
import { ProjectCard } from "../components/ProjectCard";
import { server } from "../config";

const Projetos = ({ projects, workgroups }) => {
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [status, setStatus] = useState("");
  const [group, setGroup] = useState("");

  useEffect(() => {
    if (status || group) {
      setFilteredProjects(
        projects.filter((project) => {
          if (group !== "" && status !== "") {
            return (
              project.status === status && project.workgroup.name === group
            );
          } else {
            return (
              project.status === status || project.workgroup.name === group
            );
          }
        })
      );
    } else {
      setFilteredProjects(projects);
    }
  }, [status, group, projects]);

  return (
    <Layout>
      <SEO title="Projetos" />
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
            label="Projetos"
            slug="/projetos"
            routes={["/", "/projetos"]}
          />
        </div>
      </div>
      <section className="container my-12 mx-auto">
        <div className="mt-5 mx-3">
          <div className="inline-block relative w-64 px-2">
            <label htmlFor="status">Estado atual</label>
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

          <div className="inline-block relative w-64 px-2">
            <label htmlFor="group">Grupo de Trabalho:</label>
            <select
              value={group}
              name="group"
              className="block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline"
              onChange={(e) => setGroup(e.target.value)}
              onBlur={(e) => e}
            >
              <option value="">Todos</option>
              {workgroups.map((wg) => (
                <option key={wg.id} value={wg.name}>
                  {wg.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-5 mx-3 grid grid-cols-1 lg:grid-cols-4 gap-6">
          {filteredProjects
            .filter((project) => !/\b(EN|ES)\b$/i.test(project.name))
            .sort((a, b) => (a.name > b.name ? 1 : -1))
            .map((project) => (
              <ProjectCard project={project} key={project.id} />
            ))}
        </div>
      </section>
    </Layout>
  );
};

export async function getStaticProps() {
  const res = await fetch(`${server}/projects`);

  let projects = [];
  if (res.status === 200) {
    projects = await res.json();
  }

  const res_workgroups = await fetch(`${server}/workgroups`);
  let workgroups;
  if (res_workgroups.status === 200) {
    workgroups = await res_workgroups.json();
  }

  return {
    props: {
      projects,
      workgroups,
    },
    revalidate: 1,
  };
}

export default Projetos;
