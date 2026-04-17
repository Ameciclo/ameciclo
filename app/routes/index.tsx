import { createFileRoute } from "@tanstack/react-router";
import SectionCallToAction from "~/components/PaginaInicial/SectionCallToAction";
import SectionCarousel from "~/components/PaginaInicial/SectionCarousel";
import SectionData from "~/components/PaginaInicial/SectionData";
import bannerImage from "/backgroundImage.webp";
import HomeBanner from "~/components/PaginaInicial/HomeBanner";
import { ApiStatusHandler } from "~/components/Commom/ApiStatusHandler";
import { useApiStatus } from "~/contexts/ApiStatusContext";
import CachePermissionBar from "~/components/Commom/CachePermissionModal";
import { useEffect } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { homeQueryOptions } from "../loader/home";
import { seo, organizationSchema } from "~/utils/seo";

export const Route = createFileRoute("/")({
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(homeQueryOptions()),
  head: () => {
    const s = seo({
      title: "Ameciclo - Associação Metropolitana de Ciclistas do Recife",
      description:
        "Associação Metropolitana de Ciclistas do Recife — promovemos mobilidade ativa, cicloativismo e cidades mais humanas na Região Metropolitana do Recife.",
      pathname: "/",
      jsonLd: organizationSchema,
    });
    return { meta: s.meta, links: s.links, scripts: s.scripts };
  },
  component: Index,
});

function Index() {
  const { data: { home, projects, apiDown, apiErrors } } = useSuspenseQuery(homeQueryOptions());
  const { setApiDown, addApiError } = useApiStatus();

  useEffect(() => {
    setApiDown(apiDown);
    if (apiErrors && apiErrors.length > 0) {
      apiErrors.forEach((error: {url: string, error: string}) => {
        addApiError(error.url, error.error, '/');
      });
    }
  }, []);

  const handleCacheAllow = () => {
    window.location.reload();
  };

  const handleCacheDeny = () => {
    // Modal fechado
  };

  return (
    <>
      <HomeBanner
        image={bannerImage}
        alt="Várias mulheres (11) de bicicleta andando na rua ocupando duas faixas e atravessando um cruzamento"
      />
      <ApiStatusHandler apiDown={apiDown} />

      <SectionCallToAction home={home} />
      <SectionCarousel
        featuredProjects={home?.projects || []}
        isLoading={!home}
        hasApiError={apiDown}
      />
      <SectionData
        projects={projects || []}
        apiDown={!projects}
      />

      <CachePermissionBar
        onAllow={handleCacheAllow}
        onDeny={handleCacheDeny}
      />
    </>
  );
}
