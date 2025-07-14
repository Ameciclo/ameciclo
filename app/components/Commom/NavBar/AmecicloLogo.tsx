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
          transition={{ duration: 0.2 }}
          className="flex items-center"
        >
          <NavbarLogo />
        </motion.div>
      ) : (
        <motion.div
          key="main-logo"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="mt-20 sm:mt-32 flex items-center flex-shrink-0 border-white border-4"
        >
          <div className="w-16 h-16 sm:w-16 sm:h-16 md:w-32 md:h-32">
            <MainLogo />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}