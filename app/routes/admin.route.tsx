import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AdminSidebar } from "~/components/Admin/AdminSidebar";
import { seo } from "~/utils/seo";

export const Route = createFileRoute("/admin")({
  head: () =>
    seo({
      title: "Admin - Ameciclo",
      description: "Área administrativa para gestão de dados da Ameciclo.",
      pathname: "/admin",
      // Admin pages must not be indexed; robots.txt also disallows /admin.
      noindex: true,
    }),
  component: AdminLayout,
});

function AdminLayout() {
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] bg-muted/30">
      <AdminSidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <Outlet />
      </div>
    </div>
  );
}
