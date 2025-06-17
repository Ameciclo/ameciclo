import { Link } from "@remix-run/react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AmecicloLogo } from "./NavBar/AmecicloLogo";

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
  if (!pages) pages = pagesDefault;
  const [isHeaderScrolled, setIsHeaderScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const scrollThreshold = 50;

    const handleScroll = () => {
      const scrolled = window.scrollY > scrollThreshold;
      console.log("Scroll position:", window.scrollY, "isScrolled:", scrolled);
      
      if (scrolled !== isHeaderScrolled) {
        setIsHeaderScrolled(scrolled);
      }
    };

    handleScroll();
    
    window.addEventListener("scroll", handleScroll, { passive: true });
    
    const intervalId = setInterval(handleScroll, 500);
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearInterval(intervalId);
    };
  }, [isHeaderScrolled]);

  return (
    <>
      <div className="max-h-14"></div>
      <nav
        className={`flex fixed top-0 items-center max-h-14 w-full z-50 bg-ameciclo text-white transition-shadow duration-300 ${isHeaderScrolled ? "shadow-lg" : ""}`}
        role="navigation"
      >
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <Link to="/" aria-label="Ir para o site da Ameciclo">
            <AmecicloLogo isScrolled={isHeaderScrolled} />
          </Link>

          <div className="hidden lg:flex space-x-6">
            <BigMenu pages={pages} />
          </div>

          <button
            aria-label={isMenuOpen ? "Fechar menu de navegação" : "Abrir menu de navegação"}
            aria-expanded={isMenuOpen}
            className="lg:hidden relative w-8 h-8 flex justify-center items-center z-[999]"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <div className="relative w-6 h-6 flex flex-col justify-center">
              <span className={`absolute w-6 h-0.5 bg-white transition-all duration-300 ${isMenuOpen ? "top-3 rotate-45" : "top-1"}`}></span>
              <span className={`absolute w-6 h-0.5 bg-white transition-all duration-300 ${isMenuOpen ? "opacity-0" : "top-3 opacity-100"}`}></span>
              <span className={`absolute w-6 h-0.5 bg-white transition-all duration-300 ${isMenuOpen ? "top-3 -rotate-45" : "top-5"}`}></span>
            </div>
          </button>
        </div>

      </nav>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            className="bg-ameciclo lg:hidden fixed top-0 left-0 w-full z-50 native-scrollbar"
            style={{ maxHeight: "100vh" }}
          >
            <SmallMenu pages={pages} closeMenu={() => setIsMenuOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

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

function SmallMenu({ pages, closeMenu }: any) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center pt-16 pb-4 px-6"
    >
      <motion.ul
        className="flex flex-col items-center w-full max-w-sm space-y-6 py-6"
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
            className="w-full text-center"
          >
            <Link
              to={page.url}
              className="block uppercase text-white py-3 relative group active:opacity-70 transition-opacity"
              onClick={closeMenu}
            >
              {page.name}
              <span className="block mx-auto mt-1 w-16 h-px bg-white opacity-50"></span>
            </Link>
          </motion.li>
        ))}
      </motion.ul>
    </motion.div>
  );
}
