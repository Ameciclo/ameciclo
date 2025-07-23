import React, { useEffect, useRef, useState } from "react";
import CounterLoading from "../PaginaInicial/CounterLoading";

const Counter = ({ label, number }: any) => {
  const [displayNumber, setDisplayNumber] = useState(number);
  const nodeRef = useRef<HTMLHeadingElement | null>(null);
  const isMounted = useRef(false);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  useEffect(() => {
    if (number === null || typeof window === 'undefined') return;
    
    // Simple counter animation without framer-motion
    let start = 0;
    const end = parseInt(number);
    const duration = 1000;
    const startTime = new Date().getTime();
    
    const updateCounter = () => {
      if (!isMounted.current) return;
      
      const now = new Date().getTime();
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const currentCount = Math.floor(progress * end);
      setDisplayNumber(currentCount);
      
      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      } else {
        setDisplayNumber(end);
      }
    };
    
    requestAnimationFrame(updateCounter);
  }, [number]);

  if (number === null) {
    return <CounterLoading label={label} />;
  }

  return (
    <div className="p-2 m-2 md:p-4 md:m-4 text-center text-white uppercase">
      <h2
        ref={nodeRef}
        className="font-extrabold tracking-wider text-6xl md:text-8xl"
      >
        {typeof window === 'undefined' ? number : displayNumber}
      </h2>
      <span className="text-xl md:text-3xl">{label}</span>
    </div>
  );
};

export default Counter;
