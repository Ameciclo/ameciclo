import React, { useState, useEffect, useMemo } from "react";
import Layout from "../components/Layout";
import SEO from "../components/SEO";
import Breadcrumb from "../components/Breadcrumb";
import { ProjectCard } from "../components/ProjectCard";
import { server } from "../config";

// Tipos de dados
interface Project {
  id: string;
  name: string;
  slug: string;
  status: string;
  isHighlighted?: boolean;
  media?: { url: string };
  workgroup?: { name: string };
}

interface GroupedProject {
  main: Project | null;
  translations: Record<string, Project>;
}

interface ProjetosProps {
  projects: Project[];
  workgroups: { id: string; name: string }[];
}

const Projetos: React.FC<ProjetosProps> = ({ projects, workgroups }) => {
  const [status, setStatus] = useState<string>("");
  const [group, setGroup] = useState<string>("");
  const [showOtherProjects, setShowOtherProjects] = useState<boolean>(false);

  // Agrupar projetos por slug base (sem _es e _en)
  const groupedProjects: GroupedProject[] = useMemo(() => {
    const groups: Record<string, GroupedProject> = {};

    projects.forEach((project) => {
      const baseSlug = project.slug.replace(/(_es|_en)$/, "");
      let lang = "pt";
      if (project.slug.endsWith("_es")) lang = "es";
      else if (project.slug.endsWith("_en")) lang = "en";

      if (!groups[baseSlug]) {
        groups[baseSlug] = { main: null, translations: {} };
      }

      if (lang === "pt") {
        groups[baseSlug].main = project;
      } else {
        groups[baseSlug].translations[lang] = project;
      }
    });

    return Object.values(groups);
  }, [projects]);

  // Filtrar e categorizar os projetos
  const filteredProjects = useMemo(() => {
    let filtered = groupedProjects;

    if (status || group) {
      filtered = groupedProjects.filter((groupedProject) => {
        const project =
          groupedProject.main || Object.values(groupedProject.translations)[0];
        if (project) {
          if (group !== "" && status !== "") {
            return (
              project.status === status && project.workgroup?.name === group
            );
          } else {
            return (
              project.status === status || project.workgroup?.name === group
            );
          }
        }
        return false;
      });
    }

    const highlighted: GroupedProject[] = [];
    const ongoing: GroupedProject[] = [];
    const paused: GroupedProject[] = [];
    const others: GroupedProject[] = [];

    filtered.forEach((groupedProject) => {
      const project =
        groupedProject.main || Object.values(groupedProject.translations)[0];
      if (project) {
        if (project.isHighlighted) {
          highlighted.push(groupedProject);
        } else if (project.status === "ongoing") {
          ongoing.push(groupedProject);
        } else if (project.status === "paused") {
          paused.push(groupedProject);
        } else {
          others.push(groupedProject);
        }
      }
    });

    return { highlighted, ongoing, paused, others };
  }, [status, group, groupedProjects]);

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
        {/**
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
        */}
        {/* Projetos em Destaque */}
        {filteredProjects.highlighted.length > 0 && (
          <>
            <h2 className="text-2xl font-bold my-4">Projetos em Destaque</h2>
            <div className="mt-5 mx-3 grid grid-cols-1 lg:grid-cols-4 gap-6">
              {filteredProjects.highlighted
                .sort((a, b) => {
                  const nameA =
                    a.main?.name || Object.values(a.translations)[0]?.name;
                  const nameB =
                    b.main?.name || Object.values(b.translations)[0]?.name;
                  return nameA > nameB ? 1 : -1;
                })
                .map((groupedProject) => (
                  <ProjectCard
                    project={groupedProject.main}
                    translations={groupedProject.translations}
                    key={
                      groupedProject.main?.id ||
                      Object.values(groupedProject.translations)[0]?.id
                    }
                  />
                ))}
            </div>
          </>
        )}

        {/* Projetos em Andamento */}
        {filteredProjects.ongoing.length > 0 && (
          <>
            <h2 className="text-2xl font-bold my-4">Projetos em Andamento</h2>
            <div className="mt-5 mx-3 grid grid-cols-1 lg:grid-cols-4 gap-6">
              {filteredProjects.ongoing
                .sort((a, b) => {
                  const nameA =
                    a.main?.name || Object.values(a.translations)[0]?.name;
                  const nameB =
                    b.main?.name || Object.values(b.translations)[0]?.name;
                  return nameA > nameB ? 1 : -1;
                })
                .map((groupedProject) => (
                  <ProjectCard
                    project={groupedProject.main}
                    translations={groupedProject.translations}
                    key={
                      groupedProject.main?.id ||
                      Object.values(groupedProject.translations)[0]?.id
                    }
                  />
                ))}
            </div>
          </>
        )}

        {/* Projetos em Pausados */}
        {filteredProjects.paused.length > 0 && (
          <>
            <h2 className="text-2xl font-bold my-4">Projetos Pausados</h2>
            <div className="mt-5 mx-3 grid grid-cols-1 lg:grid-cols-4 gap-6">
              {filteredProjects.paused
                .sort((a, b) => {
                  const nameA =
                    a.main?.name || Object.values(a.translations)[0]?.name;
                  const nameB =
                    b.main?.name || Object.values(b.translations)[0]?.name;
                  return nameA > nameB ? 1 : -1;
                })
                .map((groupedProject) => (
                  <ProjectCard
                    project={groupedProject.main}
                    translations={groupedProject.translations}
                    key={
                      groupedProject.main?.id ||
                      Object.values(groupedProject.translations)[0]?.id
                    }
                  />
                ))}
            </div>
          </>
        )}

        {/* Botão para mostrar demais projetos */}
        {filteredProjects.others.length > 0 && (
          <>
            {!showOtherProjects ? (
              <div className="text-center my-4">
                <button
                  onClick={() => setShowOtherProjects(true)}
                  className="bg-ameciclo text-white px-4 py-2 rounded"
                >
                  Mostrar demais projetos
                </button>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold my-4">Demais Projetos</h2>
                <div className="mt-5 mx-3 grid grid-cols-1 lg:grid-cols-4 gap-6">
                  {filteredProjects.others
                    .sort((a, b) => {
                      const nameA =
                        a.main?.name || Object.values(a.translations)[0]?.name;
                      const nameB =
                        b.main?.name || Object.values(b.translations)[0]?.name;
                      return nameA > nameB ? 1 : -1;
                    })
                    .map((groupedProject) => (
                      <ProjectCard
                        project={groupedProject.main}
                        translations={groupedProject.translations}
                        key={
                          groupedProject.main?.id ||
                          Object.values(groupedProject.translations)[0]?.id
                        }
                      />
                    ))}
                </div>
              </>
            )}
          </>
        )}
      </section>
    </Layout>
  );
};

export async function getStaticProps() {
  const res = await fetch(`${server}/projects`);

  let projects: Project[] = [];

  if (res.status === 200) {
    projects = await res.json();
  }

  const res_workgroups = await fetch(`${server}/workgroups`);
  let workgroups = [];
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
