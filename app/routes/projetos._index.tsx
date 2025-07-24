import { MetaFunction, defer } from "@remix-run/node";
import { useLoaderData, Await } from "@remix-run/react";
import { useState, useMemo, useEffect, Suspense } from "react";
import Banner from "~/components/Commom/Banner";

import Breadcrumb from "~/components/Commom/Breadcrumb";
import { ProjectCard } from "~/components/Projetos/ProjectCard";
import { FeaturedProjectsLoading } from "~/components/Projetos/FeaturedProjectsLoading";
import { ProjectCardLoading } from "~/components/Projetos/ProjectCardLoading";
import { ApiAlert } from "~/components/Commom/ApiAlert";
import { useApiStatus } from "~/contexts/ApiStatusContext";

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

export const loader = async () => {
  const API_URL = "https://cms.ameciclo.org";

  const projectsPromise = Promise.all([
    fetch(`${API_URL}/projects`).then((res) => {
      if (!res.ok) throw new Error('Failed to fetch projects');
      return res.json();
    }).catch(() => []),
    fetch(`${API_URL}/workgroups`).then((res) => {
      if (!res.ok) throw new Error('Failed to fetch workgroups');
      return res.json();
    }).catch(() => []),
  ]).then(([projectsRes, workgroupsRes]) => ({
    projects: Array.isArray(projectsRes) ? projectsRes : [], 
    workgroups: Array.isArray(workgroupsRes) ? workgroupsRes : [],
    error: projectsRes.length === 0 && workgroupsRes.length === 0 ? 'API_ERROR' : null
  }));

  return defer({
    projectsData: projectsPromise
  });
};

function ProjectsContent({ projectsData }: { projectsData: any }) {
  const { projects, error } = projectsData;
  const { setApiDown } = useApiStatus();
  const hasApiError = error === 'API_ERROR';
  const showLoadingState = hasApiError || !projects || projects.length === 0;

  const [status, setStatus] = useState<string>("");
  const [group, setGroup] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>(""); // New state for search term

  useEffect(() => {
    setApiDown(hasApiError);
  }, [hasApiError, setApiDown]);

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

  return (
    <section className="container my-4 mx-auto">
        {showLoadingState ? (
          <>
            <div className="flex justify-between items-center mb-4 sticky top-0 bg-white z-50 py-4">
              <div className="h-8 bg-gray-300 rounded w-64 animate-pulse"></div>
              <div className="w-[500px] h-10 bg-gray-300 rounded animate-pulse"></div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {Array.from({ length: 5 }).map((_, index) => (
                <ProjectCardLoading key={index} />
              ))}
            </div>
          </>
        ) : filteredProjects.highlighted.length > 0 ? (
          <>
            <div className="flex justify-between items-center mb-4 sticky top-0 bg-white z-50 py-4">
              <h2 className="text-2xl font-bold">Projetos em Destaque</h2>
              <input
                type="text"
                placeholder="Buscar projetos por título..."
                className="w-[500px] px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ameciclo"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
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
        ) : null}

        {showLoadingState ? (
          <>
            <div className="h-8 bg-gray-300 rounded w-64 animate-pulse mb-4"></div>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {Array.from({ length: 7 }).map((_, index) => (
                <ProjectCardLoading key={index} />
              ))}
            </div>
          </>
        ) : filteredProjects.ongoing.length > 0 ? (
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
        ) : null}

        {filteredProjects.others.length > 0 && (
          <>
            <h2 className="text-2xl font-bold mb-4">Demais Projetos</h2>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {showLoadingState ? (
                <>
                  <div className="h-8 bg-gray-300 rounded w-48 animate-pulse mb-4"></div>
                  {Array.from({ length: 4 }).map((_, index) => (
                    <ProjectCardLoading key={index} />
                  ))}
                </>
              ) : (
                filteredProjects.others.map((groupedProject) => (
                  <ProjectCard
                    key={groupedProject.main?.id}
                    project={groupedProject.main}
                    translations={groupedProject.translations}
                  />
                ))
              )}
            </div>
          </>
        )}
    </section>
  );
}

export default function Projetos() {
  const { projectsData } = useLoaderData<typeof loader>();

  return (
    <>
      <ApiAlert />
      <Banner image="projetos.webp" />
      <div />
      <Breadcrumb label="Projetos" slug="/projetos" routes={["/"]} />
      <Suspense fallback={
        <section className="container my-12 mx-auto">
          <div className="flex justify-between items-center mb-4 sticky top-0 bg-white z-50 py-4">
            <div className="h-8 bg-gray-300 rounded w-64 animate-pulse"></div>
            <div className="w-[500px] h-10 bg-gray-300 rounded animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {Array.from({ length: 5 }).map((_, index) => (
              <ProjectCardLoading key={index} />
            ))}
          </div>
          <div className="h-8 bg-gray-300 rounded w-64 animate-pulse mb-4 mt-8"></div>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {Array.from({ length: 7 }).map((_, index) => (
              <ProjectCardLoading key={index} />
            ))}
          </div>
        </section>
      }>
        <Await resolve={projectsData}>
          {(data) => <ProjectsContent projectsData={data} />}
        </Await>
      </Suspense>
    </>
  );
}
