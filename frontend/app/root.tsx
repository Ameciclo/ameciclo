import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import type { LinksFunction, MetaFunction } from "@remix-run/node";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { GoogleAnalytics } from "./components/GoogleAnalytics";
import styles from "./tailwind.css";

export const meta: MetaFunction = () => {
  return [
    {
      title: "Ameciclo - Associação Metropolitana de Ciclistas do Recife",
      name: "viewport",
      content:
        "Nesta plataforma você encontra dados sobre mobilidade ativa, produzidos por nós ou pelo poder público, com visualização facilitada para estudantes, jornalistas, cicloativistas, pesquisadoras(es) e pessoas interessadas. As informações são abertas para uso de todas as pessoas que desejam uma cidade mais humana, democrática e sustentável.",
      viewport: "width=device-width, initial-scale=1.0",
      charset: "utf-8",
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

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: styles },
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export default function App() {
  return (
    <html lang="pt-BR">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <div className="flex flex-col min-h-screen">
          <Navbar
            pages={[
              { name: "Inicial", url: "/" },
              { name: "Contagens", url: "/contagens" },
              { name: "Documentos", url: "/documentos" },
              { name: "Ideciclo", url: "/ideciclo" },
              { name: "Observatório", url: "/observatorio" },
              { name: "Perfil", url: "/perfil" },
            ]}
          />
          <Outlet />
          <Footer />
        </div>
        <ScrollRestoration />
        <Scripts />
        <GoogleAnalytics gaId="G-PQNS7S7FD3" />
      </body>
    </html>
  );
}
