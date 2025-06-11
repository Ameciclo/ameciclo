import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MainLogo } from "./MainLogo";
import { NavbarLogo } from "./NavbarLogo";

export function AmecicloLogo({ isScrolled }: { isScrolled: boolean }) {
  console.log("AmecicloLogo renderizando com isScrolled:", isScrolled);
  
  return (
    <div className="relative">
      {!isScrolled ? (
        <div className="relative left-20 mt-0">
          <NavbarLogo />
        </div>
      ) : (
        <div className="absolute left-0 mt-10 transform -translate-y-1/4">
          <MainLogo />
        </div>
      )}
    </div>
  );
}