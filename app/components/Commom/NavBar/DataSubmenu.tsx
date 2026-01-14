import { Link, useLocation } from "@remix-run/react";
import { motion } from "framer-motion";

const dataSubPages = [
  { name: "Contagens", url: "/dados/contagens" },
  { name: "Ideciclo", url: "/dados/ideciclo" },
  { name: "Documentos", url: "/dados/documentos" },
  { name: "Perfil", url: "/dados/perfil" },
  { name: "Execução Cicloviária", url: "/dados/execucaocicloviaria" },
  { name: "LOA", url: "/dados/loa" },
  { name: "DOM", url: "/dados/dom" },
  { name: "SAMU", url: "/dados/samu" },
  { name: "Vias Inseguras", url: "/dados/vias-inseguras" },
  { name: "Sinistros Fatais", url: "/dados/sinistros-fatais" },
  { name: "CicloDados", url: "/dados/ciclodados" },
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
      <div className="w-full flex items-center justify-center px-8 py-1 m-0 lg:px-32 xl:px-32">
        <div className="hidden xl:flex items-center space-x-1 py-1">
          {dataSubPages.map((subPage, index) => {
            const isActive = location.pathname === subPage.url || 
              location.pathname.startsWith(subPage.url + '/');
            return (
              <Link
                key={subPage.name}
                to={subPage.url}
                className={`text-white text-xs font-medium tracking-wide px-3 py-1 rounded-md relative group transition-all duration-300 z-[81] pointer-events-auto hover:bg-white hover:bg-opacity-10 ${
                  isActive ? 'bg-white bg-opacity-20 font-semibold shadow-sm' : ''
                }`}
              >
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
        
        <div className="xl:hidden flex items-center py-1 overflow-x-auto scrollbar-hide">
          <div className="flex items-center space-x-1 py-1 min-w-max">
            {dataSubPages.map((subPage, index) => {
              const isActive = location.pathname === subPage.url || 
                location.pathname.startsWith(subPage.url + '/');
              return (
                <Link
                  key={subPage.name}
                  to={subPage.url}
                  className={`text-white text-xs font-medium tracking-wide px-3 py-1 rounded-md relative group transition-all duration-300 z-[81] pointer-events-auto hover:bg-white hover:bg-opacity-10 whitespace-nowrap ${
                    isActive ? 'bg-white bg-opacity-20 font-semibold shadow-sm' : ''
                  }`}
                >
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