import { Link, useLocation } from "@remix-run/react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AmecicloLogo } from "./NavBar/AmecicloLogo";

const dataSubPages = [
  { name: "Contagens", url: "/dados/contagens" },
  { name: "Perfil", url: "/dados/perfil" },
  { name: "Ideciclo", url: "/dados/ideciclo" },
  { name: "Execução Cicloviaria", url: "/dados/execucaocicloviaria" },
  { name: "Sinistros Fatais", url: "/dados/sinistros-fatais" },
  { name: "SAMU", url: "/dados/samu" },
  { name: "Vias Inseguras", url: "/dados/vias-inseguras" },
  { name: "LOA", url: "/dados/loa" },
  { name: "DOM", url: "/dados/dom" },
  { name: "Documentos", url: "/dados/documentos" },
];

export const Navbar = ({ pages }: any) => {
  const pagesDefault = [
    { name: "Inicial", url: "/" },
    { name: "Quem Somos", url: "/quem_somos" },
    { name: "Agenda", url: "/agenda" },
    { name: "Projetos", url: "/projetos" },
    { name: "Dados", url: "/dados" },
    { name: "Contato", url: "/contato" },
  ];
  if (!pages) pages = pagesDefault;
  const [isHeaderScrolled, setIsHeaderScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const isDataPage = location.pathname.startsWith('/dados');

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 1;
      setIsHeaderScrolled(scrolled);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <>
      <motion.nav
        animate={{ y: isMenuOpen ? -120 : 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={"flex fixed left-0 right-0 items-center h-14 z-[80] text-white transition-shadow duration-300 bg-ameciclo shadow-sm"}
        role="navigation mt-0"
      >
        <div className="w-full flex items-center justify-between px-8 py-0 m-0 lg:px-32 xl:px-32">
          <Link to="/" aria-label="Ir para o site da Ameciclo" onClick={() => window.scrollTo(0, 0)} className="relative z-[85] pointer-events-auto">
            <AmecicloLogo isScrolled={isHeaderScrolled || isDataPage} />
          </Link>

          <div className="hidden lg:flex space-x-6">
            <BigMenu pages={pages} />
          </div>

          <button
            aria-label={isMenuOpen ? "Fechar menu de navegação" : "Abrir menu de navegação"}
            aria-expanded={isMenuOpen}
            className="lg:hidden relative w-10 h-10 flex justify-center items-center z-[70] rounded-md hover:bg-white hover:bg-opacity-10 transition-colors duration-200"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <div className="relative w-6 h-6 flex flex-col justify-center">
              <span className={`absolute w-6 h-0.5 bg-white rounded-full transition-all duration-300 ease-in-out ${isMenuOpen ? "top-3 rotate-45" : "top-1.5"}`}></span>
              <span className={`absolute w-6 h-0.5 bg-white rounded-full transition-all duration-300 ease-in-out ${isMenuOpen ? "opacity-0 scale-0" : "top-3 opacity-100 scale-100"}`}></span>
              <span className={`absolute w-6 h-0.5 bg-white rounded-full transition-all duration-300 ease-in-out ${isMenuOpen ? "top-3 -rotate-45" : "top-4.5"}`}></span>
            </div>
          </button>
        </div>

      </motion.nav>

      {/* Segunda linha vermelha para subpáginas de dados */}
      {isDataPage && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="fixed top-14 left-0 right-0 bg-red-600 z-[79] shadow-sm"
        >
          <div className="w-full flex items-center justify-between px-8 py-0 m-0 lg:px-32 xl:px-32">
            <div></div>
            <div className="hidden xl:flex space-x-6 py-2">
              {dataSubPages.map((subPage) => {
                const isActive = location.pathname === subPage.url || 
                  location.pathname.startsWith(subPage.url + '/');
                return (
                  <Link
                    key={subPage.name}
                    to={subPage.url}
                    className={`text-white text-sm uppercase px-3 py-1 relative group transition-all duration-200 z-[81] pointer-events-auto ${
                      isActive ? 'font-semibold' : ''
                    }`}
                  >
                    <span>{subPage.name}</span>
                    <span className={`absolute left-0 bottom-0 h-0.5 transition-all duration-300 ease-out ${
                      isActive ? 'w-full bg-white' : 'w-0 bg-white group-hover:w-full'
                    }`}></span>
                  </Link>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}

      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-[50]"
              onClick={() => setIsMenuOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3, ease: "easeInOut" }}
              className="lg:hidden fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-ameciclo shadow-2xl z-[60] overflow-y-auto"
            >
              <SmallMenu pages={pages} closeMenu={() => setIsMenuOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

function BigMenu({ pages }: any) {
  const location = useLocation();
  
  const isActivePage = (pageUrl: string) => {
    if (pageUrl === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(pageUrl);
  };

  return (
    <ul className="flex space-x-6 h-full">
      {pages.map((page: any, i: any) => {
        const isActive = isActivePage(page.url);
        return (
          <li key={page.name} className="h-full">
            <Link
              to={page.url}
              className={`uppercase h-14 flex items-center relative group ${
                isActive ? 'font-semibold' : 'text-white'
              }`}
            >
              <span>{page.name}</span>
              <span className={`absolute left-0 bottom-0 h-0.5 transition-all duration-300 ease-out ${
                isActive ? 'w-full bg-white' : 'w-0 bg-white group-hover:w-full'
              }`}></span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function SmallMenu({ pages, closeMenu }: any) {
  const location = useLocation();
  
  const isActivePage = (pageUrl: string) => {
    if (pageUrl === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(pageUrl);
  };

  const handleLinkClick = () => {
    closeMenu();
    setTimeout(() => window.scrollTo(0, 0), 100);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-start justify-between p-4 border-b border-white border-opacity-20">
        <AmecicloLogo isScrolled={false} />
        <button
          onClick={closeMenu}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white hover:bg-opacity-10 transition-colors"
          aria-label="Fechar menu"
        >
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <nav className="flex-1 px-6 py-8">
        <ul className="space-y-2" role="menu" aria-label="Menu de navegação">
          {pages.map((page: any, index: number) => {
            const isActive = isActivePage(page.url);
            return (
              <motion.li
                key={page.name}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
              >
                <Link
                  to={page.url}
                  className={`block px-4 py-3 rounded-lg text-white uppercase font-medium transition-all duration-200 ${
                    isActive 
                      ? 'bg-white bg-opacity-20 font-bold' 
                      : 'hover:bg-white hover:bg-opacity-10'
                  }`}
                  onClick={handleLinkClick}
                >
                  {page.name}
                </Link>
              </motion.li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
