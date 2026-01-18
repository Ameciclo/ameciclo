import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

interface ComingSoonButtonProps {
  name: string;
  width?: string;
}

export function ComingSoonButton({ name, width = '130px' }: ComingSoonButtonProps) {
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
        <motion.span
          key={showComingSoon ? 'soon' : 'title'}
          initial={{ opacity: 0, position: 'absolute' }}
          animate={{ opacity: 1, position: 'absolute' }}
          exit={{ opacity: 0, position: 'absolute' }}
          transition={{ duration: 0.5 }}
        >
          {showComingSoon ? 'EM BREVE' : name}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}
