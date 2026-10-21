import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { AdminSidebar } from "~/components/AdminSidebar";
import "~/tailwind.css";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1.0" },
      { name: "robots", content: "noindex, nofollow" },
      { title: "Admin - Ameciclo" },
    ],
  }),
  component: RootComponent,
});

function RootComponent() {
  return (
    <html lang="pt-BR">
      <head>
        <HeadContent />
      </head>
      <body>
        <div className="flex min-h-screen bg-muted/30">
          <AdminSidebar />
          <div className="flex min-w-0 flex-1 flex-col">
            <Outlet />
          </div>
        </div>
        <Scripts />
      </body>
    </html>
  );
}
