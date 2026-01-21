import { motion } from "framer-motion";
import { MainLogo } from "./MainLogo";
import { NavbarLogo } from "./NavbarLogo";

export function AmecicloLogo({ isScrolled }: { isScrolled: boolean }) {
  return (
    <motion.div
      animate={{
        scale: isScrolled ? 0.8 : 1,
        y: isScrolled ? 0 : 0
      }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="flex items-center"
    >
      {isScrolled ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          <NavbarLogo />
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
          className="mt-20 sm:mt-32 flex items-center flex-shrink-0 border-white border-4"
        >
          <div className="w-24 h-24 sm:w-32 sm:h-32 md:w-32 md:h-32">
            <MainLogo />
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}