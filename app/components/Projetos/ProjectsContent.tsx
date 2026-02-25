import { useState, useMemo, useEffect } from "react";
import { ProjectCard } from "./ProjectCard";
import { ProjectCardLoading } from "./ProjectCardLoading";
import SearchProject from "./SearchProject";
import { useApiStatus } from "~/contexts/ApiStatusContext";

interface Project {
  id: string;
  name: string;
  slug: string;
  project_status: string;
  isHighlighted?: boolean;
  media?: { url: string };
  workgroup?: { name: string };
}

interface ProjectsContentProps {
  projectsData: {
    projects: Project[];
    workgroups: { id: string; name: string }[];
  };
}

export function ProjectsContent({ projectsData }: ProjectsContentProps) {
  const { projects, workgroups } = projectsData;
  const { setApiDown } = useApiStatus();
  const hasApiError = !projects || projects.length === 0;
  const showLoadingState = hasApiError;

  const [status, setStatus] = useState<string>("");
  const [group, setGroup] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");

  useEffect(() => {
    setApiDown(hasApiError);
  }, [hasApiError, setApiDown]);

  const filteredProjects = useMemo(() => {
    let filtered = projects.filter((project: Project) => {
      const isTranslation = project.slug.endsWith('_es') || project.slug.endsWith('_en');
      return !isTranslation;
    });

    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter((project) => 
        project.name.toLowerCase().includes(lowerCaseSearchTerm)
      );
    }

    if (status || group) {
      filtered = filtered.filter((project) => {
        if (group !== "" && status !== "") {
          return project.project_status === status && project.workgroup?.name === group;
        } else {
          return project.project_status === status || project.workgroup?.name === group;
        }
      });
    }

    const highlighted: Project[] = [];
    const ongoing: Project[] = [];
    const paused: Project[] = [];
    const others: Project[] = [];

    filtered.forEach((project) => {
      if (project.isHighlighted) {
        highlighted.push(project);
      } else if (project.project_status === "ongoing") {
        ongoing.push(project);
      } else if (project.project_status === "paused") {
        paused.push(project);
      } else {
        others.push(project);
      }
    });

    return { highlighted, ongoing, paused, others };
  }, [status, group, searchTerm, projects]);

  const allProjectsCount =
    filteredProjects.highlighted.length +
    filteredProjects.ongoing.length +
    filteredProjects.paused.length +
    filteredProjects.others.length;

  return (
    <section className="container my-4 mx-auto">
      <div className="flex justify-between items-center mb-4">
        {showLoadingState ? (
          <div className="h-8 bg-gray-300 rounded w-64 animate-pulse"></div>
        ) : searchTerm.trim() ? (
          <h2 className="text-2xl font-bold">Buscar</h2>
        ) : (
          <h2 className="text-2xl font-bold">Projetos em Destaque</h2>
        )}
        <SearchProject searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      </div>

      {showLoadingState ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {Array.from({ length: 5 }).map((_, index) => (
            <ProjectCardLoading key={index} />
          ))}
        </div>
      ) : allProjectsCount === 0 && searchTerm ? (
        <div className="text-center py-10">
          <p className="text-xl text-gray-600">
            Nenhum projeto encontrado com título "<span className="font-bold">{searchTerm}</span>"
          </p>
        </div>
      ) : (
        <>
          {filteredProjects.highlighted.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {filteredProjects.highlighted.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          )}

          {filteredProjects.ongoing.length > 0 && (
            <>
              <h2 className="text-2xl font-bold mb-4">Projetos em Andamento</h2>
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {filteredProjects.ongoing.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            </>
          )}

          {filteredProjects.paused.length > 0 && (
            <>
              <h2 className="text-2xl font-bold mb-4">Projetos Pausados</h2>
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {filteredProjects.paused.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            </>
          )}

          {filteredProjects.others.length > 0 && (
            <>
              <h2 className="text-2xl font-bold mb-4">Demais Projetos</h2>
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {filteredProjects.others.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            </>
          )}
        </>
      )}
    </section>
  );
}
