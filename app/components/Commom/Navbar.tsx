import { Link } from "@remix-run/react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AmecicloLogo } from "../Icons/AmecicloLogo";

export const Navbar = ({ pages }: any) => {
  const pagesDefault = [
    { name: "Inicial", url: "/" },
    { name: "Quem Somos", url: "/quem_somos" },
    { name: "Agenda", url: "/agenda" },
    { name: "Projetos", url: "/projetos" },
    { name: "Dados", url: "/dados" },
    { name: "Observatório", url: "/observatorio" },
    { name: "Contato", url: "/contato" },
  ];
  if(!pages) pages = pagesDefault;
  const [isHeaderScrolled, setIsHeaderScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Listener manual para o scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsHeaderScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <div className="max-h-14"></div>
      <nav
        className={`flex fixed top-0 items-center max-h-14 w-full z-50 bg-ameciclo text-white transition ${isHeaderScrolled ? "shadow-lg" : ""}`}
        role="navigation"
      >
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          {/* Logo da Ameciclo */}
          <Link to="/" aria-label="Ir para o site da Ameciclo">
            <AmecicloLogo  isScrolled={isHeaderScrolled} />
          </Link>

          {/* Menu grande (desktop) */}
          <div className="hidden lg:flex space-x-6">
            <BigMenu pages={pages} />
          </div>

          {/* Botão de menu (mobile) */}
          <button
            aria-label="Abrir menu de navegação"
            aria-expanded={isMenuOpen}
            className="lg:hidden flex flex-col space-y-1"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <span className="block w-6 h-0.5 bg-white"></span>
            <span className="block w-6 h-0.5 bg-white"></span>
            <span className="block w-6 h-0.5 bg-white"></span>
          </button>
        </div>

      </nav>
      
      {/* Menu pequeno (mobile) - Moved outside the nav element */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            className="bg-ameciclo lg:hidden fixed top-16 left-0 w-full z-40 native-scrollbar"
            style={{ maxHeight: "calc(100vh - 4rem)" }}
          >
            <SmallMenu pages={pages} closeMenu={() => setIsMenuOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// Menu grande (desktop)
function BigMenu({ pages }: any) {
  return (
    <ul className="flex space-x-6 h-full">
      {pages.map((page: any, i: any) => (
        <li key={page.name} className="h-full">
          <Link
            to={page.url}
            className="uppercase h-14 flex items-center relative group"
          >
            <span>{page.name}</span>
            <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-white transition-all duration-300 ease-out group-hover:w-full"></span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

// Menu pequeno (mobile)
function SmallMenu({ pages, closeMenu }: any) {
  return (
    <motion.ul
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col space-y-4 py-4 px-6"
      role="menu"
      aria-label="Menu de navegação"
    >
      {pages.map((page: any, index: number) => (
        <motion.li 
          key={page.name}
          custom={index}
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={{
            hidden: { opacity: 0, y: -10 },
            visible: i => ({
              opacity: 1,
              y: 0,
              transition: { delay: i * 0.05, duration: 0.2 }
            }),
            exit: i => ({
              opacity: 0,
              y: -10,
              transition: { delay: (pages.length - i - 1) * 0.05, duration: 0.2 }
            })
          }}
        >
          <Link
            to={page.url}
            className="block uppercase text-white hover:underline"
            onClick={closeMenu}
          >
            {page.name}
          </Link>
        </motion.li>
      ))}
    </motion.ul>
  );
}
