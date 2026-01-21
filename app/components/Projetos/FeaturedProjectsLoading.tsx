import { ProjectCardLoading } from "./ProjectCardLoading";

export const FeaturedProjectsLoading = () => {
  return (
    <>
      <h2 className="text-2xl font-bold my-4">Projetos em Destaque</h2>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <ProjectCardLoading key={index} />
        ))}
      </div>
    </>
  );
};