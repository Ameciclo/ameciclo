import { Link, useLocation } from "@remix-run/react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AmecicloLogo } from "./NavBar/AmecicloLogo";

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
  const [hideRedNavbar, setHideRedNavbar] = useState(false);
  const [isSubmenuVisible, setIsSubmenuVisible] = useState(false);
  const location = useLocation();
  const isDataPage = location.pathname.startsWith('/dados') && location.pathname !== '/dados/ciclodados';
  const isCicloDadosPage = location.pathname === '/dados/ciclodados';

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 1;
      const coverImageHeight = 400;
      const hideRed = window.scrollY > coverImageHeight;
      
      setIsHeaderScrolled(scrolled);
      setHideRedNavbar(hideRed);
    };

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.submenu-container') && !target.closest('.dados-button')) {
        setIsSubmenuVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    document.addEventListener("click", handleClickOutside);
    handleScroll();
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  if (isCicloDadosPage) {
    return null;
  }

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
            <AmecicloLogo isScrolled={isHeaderScrolled || isSubmenuVisible || location.pathname === '/dados/ciclodados'} />
          </Link>

          <div className="hidden lg:flex space-x-8">
            <BigMenu pages={pages} setIsSubmenuVisible={setIsSubmenuVisible} isSubmenuVisible={isSubmenuVisible} />
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

function BigMenu({ pages, setIsSubmenuVisible, isSubmenuVisible }: any) {
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
        const isDadosPage = page.url === '/dados';
        return (
          <li key={page.name} className={`h-full relative group`}>
            <div className={`uppercase h-14 flex items-center relative ${
              isActive ? 'font-semibold' : 'text-white'
            } ${isDadosPage ? 'dados-button' : ''}`}>
              <Link to={page.url} className="flex items-center">
                <span>{page.name}</span>
              </Link>
              {isDadosPage && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setIsSubmenuVisible(!isSubmenuVisible);
                  }}
                  className="ml-1 p-1 hover:bg-white hover:bg-opacity-10 rounded transition-colors"
                >
                  <svg className={`w-3 h-3 transition-transform duration-200 ${isSubmenuVisible ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              )}
              <span className={`absolute left-0 bottom-0 h-0.5 transition-all duration-300 ease-out ${
                isActive ? 'w-full bg-white' : 'w-0 bg-white group-hover:w-full'
              }`}></span>
            </div>
            <AnimatePresence>
              {isDadosPage && isSubmenuVisible && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.15 }}
                  className="submenu-container fixed top-14 left-0 right-0 z-[81] shadow-lg pointer-events-auto"
                  style={{backgroundColor: '#008080'}}
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
                  
                  <div className="xl:hidden flex items-center py-1">
                    <select 
                      className="bg-white bg-opacity-10 text-white text-sm font-medium px-3 py-2 rounded-md border border-white border-opacity-20 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
                      value={location.pathname}
                      onChange={(e) => window.location.href = e.target.value}
                    >
                      <option value="/dados" className="text-gray-800">Selecione uma seção</option>
                      {dataSubPages.map((subPage) => (
                        <option key={subPage.name} value={subPage.url} className="text-gray-800">
                          {subPage.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                </motion.div>
              )}
            </AnimatePresence>
          </li>
        );
      })}
    </ul>
  );
}

function SmallMenu({ pages, closeMenu }: any) {
  const location = useLocation();
  const [isDataSubmenuOpen, setIsDataSubmenuOpen] = useState(false);
  
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
            const isDadosPage = page.url === '/dados';
            
            return (
              <motion.li
                key={page.name}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
              >
                {isDadosPage ? (
                  <div>
                    <button
                      onClick={() => setIsDataSubmenuOpen(!isDataSubmenuOpen)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-white uppercase font-medium transition-all duration-200 ${
                        isActive 
                          ? 'bg-white bg-opacity-20 font-bold' 
                          : 'hover:bg-white hover:bg-opacity-10'
                      }`}
                    >
                      <span>{page.name}</span>
                      <svg className={`w-4 h-4 transition-transform duration-200 ${isDataSubmenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    <AnimatePresence>
                      {isDataSubmenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="pl-4 pt-2 space-y-1">
                            {dataSubPages.map((subPage) => {
                              const isSubActive = location.pathname === subPage.url || 
                                location.pathname.startsWith(subPage.url + '/');
                              return (
                                <Link
                                  key={subPage.name}
                                  to={subPage.url}
                                  className={`block px-3 py-2 rounded text-white text-sm transition-all duration-200 ${
                                    isSubActive 
                                      ? 'bg-white bg-opacity-15 font-semibold' 
                                      : 'hover:bg-white hover:bg-opacity-10'
                                  }`}
                                  onClick={handleLinkClick}
                                >
                                  {subPage.name}
                                </Link>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
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
                )}
              </motion.li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
