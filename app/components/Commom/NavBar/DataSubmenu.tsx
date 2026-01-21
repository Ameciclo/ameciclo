import { Link, useLocation } from "@remix-run/react";
import { motion } from "framer-motion";
import { ComingSoonButton } from "./ComingSoonButton";

const dataSubPages = [
  { name: "Contagens", url: "/dados/contagens", icon: "/icons/dados/contagem.svg" },
  { name: "Ideciclo", url: "/dados/ideciclo", icon: "/icons/dados/ideciclo.svg" },
  { name: "Documentos", url: "/dados/documentos", icon: "/icons/dados/relatorio.svg" },
  { name: "Perfil", url: "/dados/perfil", icon: "/icons/dados/perfil.svg" },
  { name: "Execução Cicloviária", url: "/dados/execucaocicloviaria", icon: "/icons/dados/mapa.svg" },
  { name: "LOA", url: "/dados/loa", icon: "/icons/home/logo2.1d0f07c6.png" },
  { name: "DOM", url: "/dados/dom", icon: "/icons/home/header-logo.4f44929c.png" },
  { name: "SAMU", url: "/dados/samu", icon: "/icons/home/chamados_sinistros.svg" },
  { name: "Vias Inseguras", url: "/dados/vias-inseguras", icon: "/icons/home/vias-inseguras.svg" },
  { name: "Sinistros Fatais", url: "/dados/sinistros-fatais", icon: "/icons/home/sinistrosfatais.png" },
  { name: "CicloDados", url: "/dados/ciclodados", icon: "/icons/dados/ciclodados.svg" },
];

export function DataSubmenu() {
  const location = useLocation();

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.15 }}
      className="submenu-container fixed top-14 left-0 right-0 z-[150] shadow-lg pointer-events-auto"
      style={{backgroundColor: '#008080'}}
      id="dados-submenu"
      role="navigation"
      aria-label="Submenu de dados"
    >
      <div className="w-full flex items-center justify-center px-8 py-1 m-0">
        <div className="hidden xl:flex items-center justify-start flex-wrap gap-1 py-1">
          {dataSubPages.map((subPage, index) => {
            const isActive = location.pathname === subPage.url || 
              location.pathname.startsWith(subPage.url + '/');
            const isComingSoon = subPage.name === "Ideciclo" || subPage.name === "Execução Cicloviária" || subPage.name === "Vias Inseguras";
            
            if (isComingSoon) {
              return <ComingSoonButton key={subPage.name} name={subPage.name} icon={subPage.icon} />;
            }
            
            return (
              <Link
                key={subPage.name}
                to={subPage.url}
                className={`text-white text-xs font-medium tracking-wide px-3 py-1 rounded-md relative group transition-all duration-300 z-[81] pointer-events-auto hover:bg-white hover:bg-opacity-10 flex items-center gap-2 ${
                  isActive ? 'bg-white bg-opacity-20 font-semibold shadow-sm' : ''
                }`}
              >
                {subPage.icon && (
                  <img src={subPage.icon} alt="" className="w-6 h-6 object-contain brightness-0 invert" aria-hidden="true" />
                )}
                <span className="relative z-10">{subPage.name}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-white bg-opacity-15 rounded-md"
                    initial={false}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </Link>
            );
          })}
        </div>
        
        <div className="xl:hidden flex items-center justify-center py-1 overflow-x-auto scrollbar-hide">
          <div className="flex items-center flex-wrap justify-start gap-1 py-1">
            {dataSubPages.map((subPage, index) => {
              const isActive = location.pathname === subPage.url || 
                location.pathname.startsWith(subPage.url + '/');
              const isComingSoon = subPage.name === "Ideciclo" || subPage.name === "Execução Cicloviária" || subPage.name === "Vias Inseguras";
              
              if (isComingSoon) {
                return <ComingSoonButton key={subPage.name} name={subPage.name} icon={subPage.icon} />;
              }
              
              return (
                <Link
                  key={subPage.name}
                  to={subPage.url}
                  className={`text-white text-xs font-medium tracking-wide px-3 py-1 rounded-md relative group transition-all duration-300 z-[81] pointer-events-auto hover:bg-white hover:bg-opacity-10 whitespace-nowrap flex items-center gap-2 ${
                    isActive ? 'bg-white bg-opacity-20 font-semibold shadow-sm' : ''
                  }`}
                >
                  {subPage.icon && (
                    <img src={subPage.icon} alt="" className="w-6 h-6 object-contain brightness-0 invert" aria-hidden="true" />
                  )}
                  <span className="relative z-10">{subPage.name}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeTabMobile"
                      className="absolute inset-0 bg-white bg-opacity-15 rounded-md"
                      initial={false}
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}