import {
  createRootRouteWithContext,
  Outlet,
  HeadContent,
  Scripts,
  useRouterState,
} from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { Navbar } from "~/components/Commom/Navbar";
import { Footer } from "~/components/Commom/Footer";
import { GoogleAnalytics } from "~/components/Commom/GoogleAnalytics";
import { ApiAlert } from "~/components/Commom/ApiAlert";
import { MainContent } from "~/components/Commom/MainContent";
import { ApiStatusProvider } from "~/contexts/ApiStatusContext";
import "~/tailwind.css";
import "maplibre-gl/dist/maplibre-gl.css";
import PageNotFound from "~/components/Commom/PageNotFound";
import ErrorFallback from "~/components/Commom/ErrorFallback";
import { seo, organizationSchema } from "~/utils/seo";
import { detectLocale } from "~/utils/locale";

const getMapboxToken = createServerFn().handler(async () => {
  const { env } = await import("~/utils/env.server");
  return env.MAPBOX_ACCESS_TOKEN;
});

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1.0" },
      {
        name: "author",
        content:
          "Ameciclo - Associação Metropolitana de Ciclistas do Recife",
      },
      ...seo({
        title:
          "Ameciclo - Associação Metropolitana de Ciclistas do Recife",
        pathname: "/",
        keywords:
          "ameciclo, dados, ciclo, ciclovia, recife, rmr, plataforma de dados, mobilidade ativa",
        jsonLd: organizationSchema,
      }).meta,
    ],
    links: seo({ title: "", pathname: "/" }).links,
    scripts: seo({ title: "", pathname: "/", jsonLd: organizationSchema }).scripts,
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
  const { queryClient } = Route.useRouteContext();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const locale = detectLocale(pathname);

  return (
    <html lang={locale}>
      <head>
        <HeadContent />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.MAPBOX_TOKEN = ${JSON.stringify(mapboxToken)};`,
          }}
        />
      </head>
      <body>
        <QueryClientProvider client={queryClient}>
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
        </QueryClientProvider>
        <Scripts />
        <GoogleAnalytics gaId="G-PQNS7S7FD3" />
      </body>
    </html>
  );
}

function ErrorComponent({ error }: { error: any }) {
  return (
    <html lang="pt-BR">
      <head>
        <title>Erro!</title>
        <HeadContent />
      </head>
      <body>
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
        <Scripts />
        <GoogleAnalytics gaId="G-PQNS7S7FD3" />
      </body>
    </html>
  );
}

function NotFoundComponent() {
  return (
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
