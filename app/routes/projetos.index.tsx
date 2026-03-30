import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import Banner from "~/components/Commom/Banner";
import Breadcrumb from "~/components/Commom/Breadcrumb";
import { ApiAlert } from "~/components/Commom/ApiAlert";
import { useApiStatus } from "~/contexts/ApiStatusContext";
import { ProjectsContent } from "~/components/Projetos/ProjectsContent";
import { projetosQueryOptions } from "~/loader/projetos";

export const Route = createFileRoute("/projetos/")({
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(projetosQueryOptions()),
  head: () => ({
    meta: [{ title: "Projetos" }],
  }),
  component: Projetos,
});

function Projetos() {
  const { data: { projectsData, apiDown, apiErrors } } = useSuspenseQuery(projetosQueryOptions());
  const { setApiDown, addApiError } = useApiStatus();

  useEffect(() => {
    setApiDown(apiDown);
    if (apiErrors && apiErrors.length > 0) {
      apiErrors.forEach((error: {url: string, error: string}) => {
        addApiError(error.url, error.error, '/projetos');
      });
    }
  }, []);

  return (
    <>
      <ApiAlert />
      <Banner image="projetos.webp" />
      <div />
      <Breadcrumb label="Projetos" slug="/projetos" routes={["/"]} />
      <ProjectsContent projectsData={projectsData} />
    </>
  );
}
