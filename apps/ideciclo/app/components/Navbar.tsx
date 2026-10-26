import { Link } from "@tanstack/react-router";
import { Download, Menu } from "lucide-react";
import { Button } from "@ameciclo/ui/components/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@ameciclo/ui/components/sheet";
import { manualDownloadUrl } from "~/lib/site-links";

const NAV_LINKS = [
  { to: "/", label: "Início" },
  { to: "/avaliacao", label: "Avaliação" },
  { to: "/ranking", label: "Ranking" },
] as const;

const desktopLink = "inline-flex items-center rounded-full px-3 py-2 text-base font-medium text-text-grey transition-colors hover:bg-ideciclo-yellow";
const desktopActive = "bg-ideciclo-red text-white shadow-md hover:bg-ideciclo-red";
const mobileLink = "block rounded-lg px-4 py-2 text-xl text-text-grey hover:bg-ideciclo-teal/10";
const mobileActive = "bg-ideciclo-yellow/20 font-medium text-ideciclo-red";

export function Navbar() {
  return (
    <nav className="fixed inset-x-0 top-0 z-50 border-b-2 border-ideciclo-teal bg-white shadow-lg">
      <div className="container mx-auto flex h-20 items-center justify-between px-4">
        <Link to="/" aria-label="IDECICLO">
          <img src="/ideciclo_logo.png" alt="IDECICLO" className="h-16 drop-shadow-sm" />
        </Link>

        <div className="hidden items-center gap-3 sm:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              activeOptions={{ exact: link.to === "/" }}
              className={desktopLink}
              activeProps={{ className: desktopActive }}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <button type="button" className="rounded-md p-2 text-text-grey hover:bg-ideciclo-yellow/20 sm:hidden">
              <span className="sr-only">Abrir menu</span>
              <Menu className="size-6" aria-hidden="true" />
            </button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[250px] sm:w-[300px]">
            <SheetTitle className="sr-only">Menu</SheetTitle>
            <div className="space-y-1 py-4">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  activeOptions={{ exact: link.to === "/" }}
                  className={mobileLink}
                  activeProps={{ className: mobileActive }}
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="rounded-2xl border border-ideciclo-teal/30 bg-ideciclo-yellow/15 p-4">
              <h3 className="text-base font-semibold text-text-grey">Manual do IDECICLO</h3>
              <p className="mt-2 text-sm leading-6 text-text-grey">
                Antes de começar, conheça a metodologia e baixe a versão mais atual do manual.
              </p>
              <Button asChild className="mt-4 w-full bg-ideciclo-red text-white hover:bg-ideciclo-red/90">
                <a href={manualDownloadUrl} target="_blank" rel="noreferrer">
                  <Download className="mr-2 size-4" />
                  Baixar manual
                </a>
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}
