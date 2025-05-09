  import {
    Links,
    Meta,
    Outlet,
    Scripts,
    ScrollRestoration,
  } from "@remix-run/react";
  import type { MetaFunction } from "@remix-run/node";
  import { Navbar } from "./components/Commom/Navbar";
  import { Footer } from "./components/Commom/Footer";
  import { GoogleAnalytics } from "./components/Commom/GoogleAnalytics";
  import "./tailwind.css";
  import PageNotFound from "./components/Commom/PageNotFound";

  const metaConfig = {
    title: "Ameciclo - Associação Metropolitana de Ciclistas do Recife",
    description:
      "Nesta plataforma você encontra dados sobre mobilidade ativa, produzidos por nós ou pelo poder público, com visualização facilitada para estudantes, jornalistas, cicloativistas, pesquisadoras(es) e pessoas interessadas. As informações são abertas para uso de todas as pessoas que desejam uma cidade mais humana, democrática e sustentável.",
    url: "https://ameciclo.org/",
    image: "https://ameciclo.org/favicon.ico",
    keywords: "ameciclo, dados, ciclo, ciclovia, recife, rmr, plataforma de dados",
    author: "Ameciclo - Associação Metropolitana de Ciclistas do Recife",
  };

  export const meta: MetaFunction = () => [
    { title: metaConfig.title },
    { name: "description", content: metaConfig.description },
    { name: "keywords", content: metaConfig.keywords },
    { name: "author", content: metaConfig.author },
    { name: "viewport", content: "width=device-width, initial-scale=1.0" },
    { name: "robots", content: "index, follow" },
    { charset: "utf-8" },
    { name: "title", content: metaConfig.title },
    { property: "og:title", content: metaConfig.title },
    { property: "og:description", content: metaConfig.description },
    { property: "og:image", content: metaConfig.image },
    { property: "og:url", content: metaConfig.url },
    { property: "twitter:title", content: metaConfig.title },
    { property: "twitter:description", content: metaConfig.description },
    { property: "twitter:image", content: metaConfig.image },
    { rel: "canonical", href: metaConfig.url },
  ];

  import { isRouteErrorResponse, useRouteError } from "@remix-run/react";
  import ErrorFallback from "./components/Commom/ErrorFallback";

  export function ErrorBoundary() {
    const error: any = useRouteError();

    return (
      <html>
        <head>
          <title>Erro!</title>
          <Links />
          <Meta />
        </head>
        <body>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main>
              {error.status !== 404 ? <ErrorFallback error={error} /> : <PageNotFound />}
            </main>
            <Footer />
          </div>
          <Scripts />
          <GoogleAnalytics gaId="G-PQNS7S7FD3" />
        </body>
      </html>
    );
  }


  export default function App() {
    return (
      <html lang="pt-BR">
        <head>
          <Meta />
          <Links />
        </head>
        <body>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main>
              <Outlet />
            </main>
            <Footer />
          </div>
          <ScrollRestoration />
          <Scripts />
          <GoogleAnalytics gaId="G-PQNS7S7FD3" />
        </body>
      </html>
    );
  }

