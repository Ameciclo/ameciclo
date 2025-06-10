import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MainLogo } from "../Icons/MainLogo";
import { CompactLogo } from "../Icons/CompactLogo";
import { NavbarLogo } from "../Icons/NavbarLogo";

export function AmecicloLogo({ isScrolled }: { isScrolled: boolean }) {
  return (
    <div className="relative">
      <AnimatePresence mode="wait">
        {isScrolled ? (
          <motion.div
            key="navbar"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="relative left-20 mt-0"
          >
            <NavbarLogo />
          </motion.div>
        ) : (
          <motion.div
            key="main"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute left-0 mt-10 transform -translate-y-1/4"
          >
            <MainLogo />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}