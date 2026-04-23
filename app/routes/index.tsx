import { createFileRoute, useRouter } from "@tanstack/react-router";
import SectionCallToAction from "~/components/PaginaInicial/SectionCallToAction";
import SectionCarousel from "~/components/PaginaInicial/SectionCarousel";
import SectionData from "~/components/PaginaInicial/SectionData";
import bannerImage from "/backgroundImage.webp";
import HomeBanner from "~/components/PaginaInicial/HomeBanner";
import { ApiStatusHandler } from "~/components/Commom/ApiStatusHandler";
import CachePermissionBar from "~/components/Commom/CachePermissionModal";
import { useSuspenseQuery } from "@tanstack/react-query";
import { homeQueryOptions } from "~/queries/home";
import { useReportApiErrors } from "~/hooks/useReportApiErrors";
import { seo, organizationSchema } from "~/utils/seo";

export const Route = createFileRoute("/")({
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(homeQueryOptions()),
  head: () =>
    seo({
      title: "Ameciclo - Associação Metropolitana de Ciclistas do Recife",
      description:
        "Associação Metropolitana de Ciclistas do Recife — promovemos mobilidade ativa, cicloativismo e cidades mais humanas na Região Metropolitana do Recife.",
      pathname: "/",
      jsonLd: organizationSchema,
    }),
  component: Index,
});

function Index() {
  const { data } = useSuspenseQuery(homeQueryOptions());
  const { home, projects, apiDown } = data;
  useReportApiErrors(data);
  const router = useRouter();

  const handleCacheAllow = () => {
    router.invalidate();
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
