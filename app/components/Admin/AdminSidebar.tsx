import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Users2 } from "lucide-react";
import { cn } from "~/lib/utils";

type NavItem = {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
};

const NAV: NavItem[] = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/contagens", label: "Contagens", icon: Users2 },
];

export function AdminSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <aside className="hidden lg:flex w-60 shrink-0 flex-col border-r bg-sidebar text-sidebar-foreground">
      <div className="px-6 py-5 border-b">
        <Link to="/admin" className="flex items-baseline gap-2">
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
        <Link to="/" className="hover:text-foreground transition-colors">
          ← Voltar ao site
        </Link>
      </div>
    </aside>
  );
}
