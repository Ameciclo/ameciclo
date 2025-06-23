import { json, LoaderFunction, MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useState, useMemo } from "react";
import Banner from "~/components/Commom/Banner";

import Breadcrumb from "~/components/Commom/Breadcrumb";
import { ProjectCard } from "~/components/Projetos/ProjectCard";

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

interface ProjetosData {
  projects: Project[];
  workgroups: { id: string; name: string }[];
}

export const meta: MetaFunction = () => {
  return [{ title: "Projetos" }];
};

export const loader: LoaderFunction = async () => {
  const API_URL = "https://cms.ameciclo.org";

  const [projectsRes, workgroupsRes] = await Promise.all([
    fetch(`${API_URL}/projects`).then((res) => res.json()).catch(() => []),
    fetch(`${API_URL}/workgroups`).then((res) => res.json()).catch(() => []),
  ]);

  return json({ projects: projectsRes, workgroups: workgroupsRes });
};

export default function Projetos() {
  const { projects } = useLoaderData<typeof loader>();

  const [status, setStatus] = useState<string>("");
  const [group, setGroup] = useState<string>("");
  const [showOtherProjects, setShowOtherProjects] = useState<boolean>(false);

  const groupedProjects: GroupedProject[] = useMemo(() => {
    const groups: Record<string, GroupedProject> = {};

    projects.forEach((project: any) => {
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
    <>
      <Banner image="projetos.webp" />
      <div />
      <Breadcrumb label="Projetos" slug="/projetos" routes={["/"]} />
      <section className="container my-12 mx-auto">
        {filteredProjects.highlighted.length > 0 && (
          <>
            <h2 className="text-2xl font-bold my-4">Projetos em Destaque</h2>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {filteredProjects.highlighted.map((groupedProject) => (
                <ProjectCard
                  key={groupedProject.main?.id}
                  project={groupedProject.main}
                  translations={groupedProject.translations}
                />
              ))}
            </div>
          </>
        )}

        {filteredProjects.ongoing.length > 0 && (
          <>
            <h2 className="text-2xl font-bold my-4">Projetos em Andamento</h2>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {filteredProjects.ongoing.map((groupedProject) => (
                <ProjectCard
                  key={groupedProject.main?.id}
                  project={groupedProject.main}
                  translations={groupedProject.translations}
                />
              ))}
            </div>
          </>
        )}

        {filteredProjects.others.length > 0 && !showOtherProjects && (
          <div className="text-center my-4">
            <button
              onClick={() => setShowOtherProjects(true)}
              className="bg-ameciclo text-white px-4 py-2 rounded"
            >
              Mostrar demais projetos
            </button>
          </div>
        )}

        {showOtherProjects && (
          <>
            <h2 className="text-2xl font-bold my-4">Demais Projetos</h2>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {filteredProjects.others.map((groupedProject) => (
                <ProjectCard
                  key={groupedProject.main?.id}
                  project={groupedProject.main}
                  translations={groupedProject.translations}
                />
              ))}
            </div>
          </>
        )}
      </section>
    </>
  );
}
