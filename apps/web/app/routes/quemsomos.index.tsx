import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { z } from "zod";

import Breadcrumb from "~/components/Commom/Breadcrumb";
import { RouteErrorBoundary, RouteLoading } from "~/components/Commom/RouteBoundaries";
import { QuemSomosContent } from "~/components/QuemSomos/QuemSomosContent";
import { quemSomosQueryOptions } from "~/queries/quemsomos";
import { seo } from "~/utils/seo";

// ?busca=ana&pessoa=12. Anything malformed falls back to "no search, nobody open".
const SearchSchema = z.object({
  busca: z.string().optional().catch(undefined),
  pessoa: z.string().optional().catch(undefined),
});

export const Route = createFileRoute("/quemsomos/")({
  validateSearch: SearchSchema,
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(quemSomosQueryOptions()),
  head: () =>
    seo({
      title: "Quem Somos - Ameciclo",
      description:
        "Conheça a Ameciclo — Associação Metropolitana de Ciclistas do Recife: missão, coordenação, conselho fiscal, ameciclistas e documentos.",
      pathname: "/quemsomos",
    }),
  component: QuemSomos,
  pendingComponent: () => <RouteLoading label="Carregando quem somos..." />,
  pendingMs: 500,
  pendingMinMs: 800,
  errorComponent: RouteErrorBoundary,
});

function QuemSomos() {
  const { busca, pessoa } = Route.useSearch();
  const navigate = Route.useNavigate();
  const { data: { pageData } } = useSuspenseQuery(quemSomosQueryOptions());

  return (
    <>
      <div className="relative py-24 w-full h-cover">
        {/* Above the fold: load it right away instead of lazily. */}
        <img
          src="/quem_somos.webp"
          alt="Pessoas da Ameciclo reunidas com suas bicicletas"
          className="absolute inset-0 object-cover w-full h-full"
          loading="eager"
          fetchPriority="high"
        />
      </div>
      <Breadcrumb label="Quem Somos" slug="/quemsomos" routes={["/"]} />
      <QuemSomosContent
        pageData={pageData}
        busca={busca}
        pessoaId={pessoa}
        onBuscaChange={(next) =>
          navigate({
            search: (prev) => ({ ...prev, busca: next }),
            replace: true,
            resetScroll: false,
          })
        }
        onClosePerson={() =>
          navigate({ search: (prev) => ({ ...prev, pessoa: undefined }), resetScroll: false })
        }
      />
    </>
  );
}
