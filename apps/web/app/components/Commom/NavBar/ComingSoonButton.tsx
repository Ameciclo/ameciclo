import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

interface ComingSoonButtonProps {
  name: string;
  width?: string;
  icon?: string;
}

export function ComingSoonButton({ name, width = '130px', icon }: ComingSoonButtonProps) {
  const [showComingSoon, setShowComingSoon] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setShowComingSoon(prev => !prev);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="text-white text-xs font-medium tracking-wide px-3 py-1 rounded-md relative cursor-not-allowed inline-flex items-center justify-center text-center"
      style={{ width, height: '28px' }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={showComingSoon ? 'soon' : 'title'}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-2"
        >
          {icon && (
            <img src={icon} alt="" className="w-6 h-6 object-contain brightness-0 invert" aria-hidden="true" />
          )}
          <span>{showComingSoon ? 'EM BREVE' : name}</span>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
