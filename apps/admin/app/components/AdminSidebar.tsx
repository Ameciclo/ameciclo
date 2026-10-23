import { Link, useRouterState } from "@tanstack/react-router";
import { BookOpen, Bike, ChevronDown, ClipboardList, History, LayoutDashboard, Map, MapPin, Route, Users2 } from "lucide-react";
import { cn } from "@ameciclo/ui/lib/utils";

type Icon = React.ComponentType<{ className?: string }>;

type NavLink = {
  to: string;
  label: string;
  icon: Icon;
  exact?: boolean;
};

type NavGroup = {
  label: string;
  icon: Icon;
  items: NavLink[];
};

const TOP: NavLink = { to: "/", label: "Dashboard", icon: LayoutDashboard, exact: true };

const GROUPS: NavGroup[] = [
  {
    label: "Contagens",
    icon: Users2,
    items: [
      { to: "/contagens", label: "Contagens", icon: Users2 },
      { to: "/locais", label: "Locais", icon: MapPin },
      { to: "/caracteristicas", label: "Características", icon: BookOpen },
    ],
  },
  {
    label: "Pesquisa",
    icon: ClipboardList,
    items: [{ to: "/pesquisa-perfil", label: "Pesquisa Perfil", icon: ClipboardList }],
  },
  {
    label: "Infraestrutura",
    icon: Bike,
    items: [
      { to: "/infra", label: "Visão geral", icon: Map, exact: true },
      { to: "/infra/projetos", label: "Projetos do PDC", icon: Route },
      { to: "/infra/trechos", label: "Trechos", icon: Bike },
      { to: "/infra/sincronizacoes", label: "Sincronizações", icon: History },
    ],
  },
];

const isActive = (pathname: string, { to, exact }: NavLink) =>
  exact ? pathname === to : pathname === to || pathname.startsWith(`${to}/`);

const linkClass = (active: boolean) =>
  cn(
    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
    active
      ? "bg-sidebar-accent text-sidebar-accent-foreground"
      : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
  );

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
      <nav className="flex-1 space-y-1 px-3 py-4">
        <Link to={TOP.to} className={linkClass(isActive(pathname, TOP))}>
          <TOP.icon className="size-4 shrink-0" />
          {TOP.label}
        </Link>
        {GROUPS.map((group) => {
          const current = group.items.some((item) => isActive(pathname, item));
          return (
            // Native <details>: open while a page of the group is showing, and the
            // reader can fold it. The key reopens it when navigating into the group.
            <details key={`${group.label}-${current}`} open={current || undefined} className="group pt-2">
              <summary className="flex cursor-pointer list-none items-center gap-3 rounded-md px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground [&::-webkit-details-marker]:hidden">
                <group.icon className="size-4 shrink-0" />
                <span className="flex-1">{group.label}</span>
                <ChevronDown className="size-3.5 transition-transform group-open:rotate-180" />
              </summary>
              <div className="mt-1 space-y-1 border-l pl-2 ml-5">
                {group.items.map((item) => (
                  <Link key={item.to} to={item.to} className={linkClass(isActive(pathname, item))}>
                    <item.icon className="size-4 shrink-0" />
                    {item.label}
                  </Link>
                ))}
              </div>
            </details>
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
