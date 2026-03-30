import {
  createRootRoute,
  Outlet,
  HeadContent,
  Scripts,
  useRouterState,
} from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { Navbar } from "~/components/Commom/Navbar";
import { Footer } from "~/components/Commom/Footer";
import { GoogleAnalytics } from "~/components/Commom/GoogleAnalytics";
import { ApiAlert } from "~/components/Commom/ApiAlert";
import { MainContent } from "~/components/Commom/MainContent";
import { ApiStatusProvider } from "~/contexts/ApiStatusContext";
import { QueryProvider } from "~/providers/QueryProvider";
import "~/tailwind.css";
import "mapbox-gl/dist/mapbox-gl.css";
import PageNotFound from "~/components/Commom/PageNotFound";
import ErrorFallback from "~/components/Commom/ErrorFallback";

const getMapboxToken = createServerFn().handler(async () => {
  return process.env.MAPBOX_ACCESS_TOKEN || "";
});

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1.0" },
      {
        title:
          "Ameciclo - Associação Metropolitana de Ciclistas do Recife",
      },
      {
        name: "description",
        content:
          "Nesta plataforma você encontra dados sobre mobilidade ativa, produzidos por nós ou pelo poder público, com visualização facilitada para estudantes, jornalistas, cicloativistas, pesquisadoras(es) e pessoas interessadas. As informações são abertas para uso de todas as pessoas que desejam uma cidade mais humana, democrática e sustentável.",
      },
      {
        name: "keywords",
        content:
          "ameciclo, dados, ciclo, ciclovia, recife, rmr, plataforma de dados",
      },
      {
        name: "author",
        content:
          "Ameciclo - Associação Metropolitana de Ciclistas do Recife",
      },
      { name: "robots", content: "index, follow" },
      {
        property: "og:title",
        content:
          "Ameciclo - Associação Metropolitana de Ciclistas do Recife",
      },
      {
        property: "og:description",
        content:
          "Nesta plataforma você encontra dados sobre mobilidade ativa, produzidos por nós ou pelo poder público, com visualização facilitada para estudantes, jornalistas, cicloativistas, pesquisadoras(es) e pessoas interessadas.",
      },
      { property: "og:image", content: "https://ameciclo.org/favicon.ico" },
      { property: "og:url", content: "https://ameciclo.org/" },
      {
        property: "twitter:title",
        content:
          "Ameciclo - Associação Metropolitana de Ciclistas do Recife",
      },
      {
        property: "twitter:description",
        content:
          "Nesta plataforma você encontra dados sobre mobilidade ativa, produzidos por nós ou pelo poder público, com visualização facilitada para estudantes, jornalistas, cicloativistas, pesquisadoras(es) e pessoas interessadas.",
      },
      {
        property: "twitter:image",
        content: "https://ameciclo.org/favicon.ico",
      },
    ],
    links: [{ rel: "canonical", href: "https://ameciclo.org/" }],
  }),
  loader: async () => {
    const mapboxToken = await getMapboxToken();
    return { mapboxToken };
  },
  component: RootComponent,
  errorComponent: ErrorComponent,
  notFoundComponent: NotFoundComponent,
});

function RootComponent() {
  const { mapboxToken } = Route.useLoaderData();

  return (
    <html lang="pt-BR">
      <head>
        <HeadContent />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.MAPBOX_TOKEN = ${JSON.stringify(mapboxToken)};`,
          }}
        />
      </head>
      <body>
        <QueryProvider>
          <ApiStatusProvider>
            <ApiAlert />
            <div className="flex flex-col min-h-screen">
              <ConditionalNavbar />
              <MainContent>
                <Outlet />
              </MainContent>
              <ConditionalFooter />
            </div>
          </ApiStatusProvider>
        </QueryProvider>
        <Scripts />
        <GoogleAnalytics gaId="G-PQNS7S7FD3" />
      </body>
    </html>
  );
}

function ErrorComponent({ error }: { error: any }) {
  return (
    <html>
      <head>
        <title>Erro!</title>
        <HeadContent />
      </head>
      <body>
        <QueryProvider>
          <ApiStatusProvider>
            <ApiAlert />
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <MainContent>
                <ErrorFallback error={error} />
              </MainContent>
              <Footer />
            </div>
          </ApiStatusProvider>
        </QueryProvider>
        <Scripts />
        <GoogleAnalytics gaId="G-PQNS7S7FD3" />
      </body>
    </html>
  );
}

function NotFoundComponent() {
  return (
    <QueryProvider>
      <ApiStatusProvider>
        <ApiAlert />
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <MainContent>
            <PageNotFound />
          </MainContent>
          <Footer />
        </div>
      </ApiStatusProvider>
    </QueryProvider>
  );
}

function ConditionalNavbar() {
  const location = useRouterState({ select: (s) => s.location });
  const isCicloDadosPage = location.pathname === "/dados/ciclodados";

  if (isCicloDadosPage) {
    return null;
  }

  return <Navbar />;
}

function ConditionalFooter() {
  const location = useRouterState({ select: (s) => s.location });
  const isCicloDadosPage = location.pathname === "/dados/ciclodados";

  if (isCicloDadosPage) {
    return null;
  }

  return <Footer />;
}
