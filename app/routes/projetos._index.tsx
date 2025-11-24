import { MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useState, useMemo } from "react";
import Banner from "~/components/Commom/Banner";
import Breadcrumb from "~/components/Commom/Breadcrumb";
import { ProjectCard } from "~/components/Projetos/ProjectCard";
import SearchProject from "~/components/Projetos/SearchProject";
import { loader } from "~/loader/projetos";
export { loader };

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



function ProjectsContent({ projectsData }: { projectsData: any }) {
  const { projects } = projectsData;
  const [status, setStatus] = useState<string>("");
  const [group, setGroup] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");

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

    // Filter by search term
    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter((groupedProject) => {
        const project = groupedProject.main || Object.values(groupedProject.translations)[0];
        return project?.name.toLowerCase().includes(lowerCaseSearchTerm);
      });
    }

    if (status || group) {
      filtered = filtered.filter((groupedProject) => {
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
  }, [status, group, searchTerm, groupedProjects]); // Add searchTerm to dependencies

  const allProjectsCount = filteredProjects.highlighted.length +
                           filteredProjects.ongoing.length +
                           filteredProjects.paused.length +
                           filteredProjects.others.length;

  return (
    <section className="container my-4 mx-auto">
      <div className="flex justify-between items-center mb-4">
        {searchTerm.trim() ? (
          <h2 className="text-2xl font-bold">Buscar</h2>
        ) : (
          <h2 className="text-2xl font-bold">Projetos em Destaque</h2>
        )}
        <SearchProject searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      </div>

      {allProjectsCount === 0 && searchTerm ? (
        <div className="text-center py-10">
          <p className="text-xl text-gray-600">
            Nenhum projeto encontrado com título "<span className="font-bold">{searchTerm}</span>"
          </p>
        </div>
      ) : (
          <>
            {filteredProjects.highlighted.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {filteredProjects.highlighted.map((groupedProject) => (
                  <ProjectCard
                    key={groupedProject.main?.id}
                    project={groupedProject.main}
                    translations={groupedProject.translations}
                  />
                ))}
              </div>
            )}

            {filteredProjects.ongoing.length > 0 && (
              <>
                <h2 className="text-2xl font-bold mb-4">Projetos em Andamento</h2>
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

            {filteredProjects.paused.length > 0 && (
              <>
                <h2 className="text-2xl font-bold mb-4">Projetos Pausados</h2>
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  {filteredProjects.paused.map((groupedProject) => (
                    <ProjectCard
                      key={groupedProject.main?.id}
                      project={groupedProject.main}
                      translations={groupedProject.translations}
                    />
                  ))}
                </div>
              </>
            )}

            {filteredProjects.others.length > 0 && (
              <>
                <h2 className="text-2xl font-bold mb-4">Demais Projetos</h2>
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  {filteredProjects.others.map((groupedProject) => (
                    <ProjectCard
                      key={groupedProject.main?.id}
                      project={groupedProject.main}
                      translations={groupedProject.translations}
                    />
                  ))
                  }
                </div>
              </>
            )}
          </>
        )
      }
    </section>
  );
}

export default function Projetos() {
  const { projectsData } = useLoaderData<typeof loader>();

  return (
    <>
      <Banner image="projetos.webp" />
      <Breadcrumb label="Projetos" slug="/projetos" routes={["/"]} />
      <ProjectsContent projectsData={projectsData} />
    </>
  );
}
