import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import type { LinksFunction, MetaFunction } from "@remix-run/node";
import { Navbar } from "./components/Commom/Navbar";
import { Footer } from "./components/Commom/Footer";
import { GoogleAnalytics } from "./components/Commom/GoogleAnalytics";
import "./tailwind.css";

export const meta: MetaFunction = () => {
  return [
    {
      title: "Ameciclo - Associação Metropolitana de Ciclistas do Recife",
      name: "viewport",
      content:
        "Nesta plataforma você encontra dados sobre mobilidade ativa, produzidos por nós ou pelo poder público, com visualização facilitada para estudantes, jornalistas, cicloativistas, pesquisadoras(es) e pessoas interessadas. As informações são abertas para uso de todas as pessoas que desejam uma cidade mais humana, democrática e sustentável.",
      viewport: "width=device-width, initial-scale=1.0",
      charSet: "UTF-8",
      keywords: "ameciclo, dados, ciclo, ciclovia, recife, rmr, plataforma de dados",
      author: "Ameciclo - Associação Metropolitana de Ciclistas do Recife",
      robots: "index, follow",
      canonical: "https://ameciclo.org/",
      "og:title": "Ameciclo - Associação Metropolitana de Ciclistas do Recife",
      "og:description": "Os melhores produtos e serviços ao seu alcance.",
      "og:image": "https://ameciclo.org/favicon.ico",
      "og:url": "https://ameciclo.org/",
      "twitter:title": "Ameciclo - Associação Metropolitana de Ciclistas do Recife",
      "twitter:description": "Os melhores produtos e serviços ao seu alcance.",
      "twitter:image": "https://ameciclo.org/favicon.ico",
    },
  ];
};

export default function App() {
  return (
    <html lang="pt-BR">
      <head>
        <Meta />
        <meta name="title" content="Ameciclo - Associação Metropolitana de Ciclistas do Recife" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content="Nesta plataforma você encontra dados sobre mobilidade ativa, produzidos por nós ou pelo poder público, com visualização facilitada para estudantes, jornalistas, cicloativistas, pesquisadoras(es) e pessoas interessadas. As informações são abertas para uso de todas as pessoas que desejam uma cidade mais humana, democrática e sustentável." />
        <meta charSet="UTF-8" />
        <meta name="keywords" content="ameciclo, dados, ciclo, ciclovia, recife, rmr, plataforma de dados" />
        <meta name="author" content="Ameciclo - Associação Metropolitana de Ciclistas do Recife" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://ameciclo.org/" />

        <meta property="og:title" content="Ameciclo - Associação Metropolitana de Ciclistas do Recife" />
        <meta property="og:description" content="Os melhores produtos e serviços ao seu alcance." />
        <meta property="og:image" content="https://ameciclo.org/favicon.ico" />
        <meta property="og:url" content="https://ameciclo.org/" />

        <meta property="twitter:title" content="Ameciclo - Associação Metropolitana de Ciclistas do Recife" />
        <meta property="twitter:description" content="Os melhores produtos e serviços ao seu alcance." />
        <meta property="twitter:image" content="https://ameciclo.org/favicon.ico" />
        <Links />
      </head>
      <body>
        <div className="flex flex-col min-h-screen">
          <Navbar
            pages={[
              { name: "Inicial", url: "/" },
              { name: "Quem Somos", url: "/quem_somos" },
              { name: "Agenda", url: "/agenda" },
              { name: "Projetos", url: "/projetos" },
              { name: "Dados", url: "/dados" },
              { name: "Observatório", url: "/observatorio" },
              { name: "Contato", url: "/contato" },
            ]}
          />
          <main><Outlet /></main>
          <Footer />
        </div>
        <ScrollRestoration />
        <Scripts />
        <GoogleAnalytics gaId="G-PQNS7S7FD3" />
      </body>
    </html>
  );
}
