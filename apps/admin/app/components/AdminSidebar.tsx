import { Link, useRouterState } from "@tanstack/react-router";
import { BookOpen, ClipboardList, LayoutDashboard, MapPin, Users2 } from "lucide-react";
import { cn } from "@ameciclo/ui/lib/utils";

type NavItem = {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
};

const NAV: NavItem[] = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/contagens", label: "Contagens", icon: Users2 },
  { to: "/locais", label: "Locais", icon: MapPin },
  { to: "/caracteristicas", label: "Características", icon: BookOpen },
  { to: "/pesquisa-perfil", label: "Pesquisa Perfil", icon: ClipboardList },
];

export function AdminSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <aside className="hidden lg:flex w-60 shrink-0 flex-col border-r bg-sidebar text-sidebar-foreground">
      <div className="px-6 py-5 border-b">
        <Link to="/" className="flex items-baseline gap-2">
          <span className="text-lg font-semibold tracking-tight">Ameciclo</span>
          <span className="text-xs uppercase tracking-wider text-muted-foreground">Admin</span>
        </Link>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map(({ to, label, icon: Icon, exact }) => {
          const active = exact ? pathname === to : pathname === to || pathname.startsWith(`${to}/`);
          return (
            <Link
              key={to}
              to={to}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
              )}
            >
              <Icon className="size-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t px-6 py-4 text-xs text-muted-foreground">
        <a href="https://ameciclo.org" className="hover:text-foreground transition-colors">
          ← Voltar ao site
        </a>
      </div>
    </aside>
  );
}
