import { createRootRouteWithContext, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { type QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Footer } from "~/components/Footer";
import { Navbar } from "~/components/Navbar";
import "~/tailwind.css";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1.0" },
      { title: "IDECICLO - Índice de Desenvolvimento Cicloviário" },
      { name: "description", content: "Avaliação da qualidade da infraestrutura cicloviária das cidades brasileiras, pela Ameciclo." },
    ],
    links: [{ rel: "icon", href: "/ideciclo-marca.png" }],
  }),
  component: RootComponent,
  notFoundComponent: () => (
    <div className="container mx-auto px-4 py-24 text-center">
      <h1 className="text-4xl font-bold text-text-grey">Página não encontrada</h1>
    </div>
  ),
});

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <html lang="pt-BR">
      <head>
        <HeadContent />
      </head>
      <body>
        <QueryClientProvider client={queryClient}>
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-grow pt-20">
              <Outlet />
            </main>
            <Footer />
          </div>
        </QueryClientProvider>
        <Scripts />
      </body>
    </html>
  );
}
