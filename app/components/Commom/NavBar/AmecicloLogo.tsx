import { motion, AnimatePresence } from "framer-motion";
import { MainLogo } from "./MainLogo";
import { NavbarLogo } from "./NavbarLogo";

export function AmecicloLogo({ isScrolled }: { isScrolled: boolean }) {
  return (
    <AnimatePresence mode="wait">
      {isScrolled ? (
        <motion.div
          key="navbar-logo"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15, ease: "easeIn" }}
          className="ml-32 flex items-center flex-shrink-0 mr-6"
        >
          <NavbarLogo />
        </motion.div>
      ) : (
        <motion.div
          key="main-logo"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15, ease: "easeIn" }}
          className="ml-32 mt-32 flex items-center flex-shrink-0 mr-6 border-white border-4"
        >
          <div className="w-20 h-20 sm:w-32 sm:h-32">
            <MainLogo />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}