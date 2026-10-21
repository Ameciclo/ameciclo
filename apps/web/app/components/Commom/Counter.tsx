import React, { useEffect, useRef, useState } from "react";
import CounterLoading from "../PaginaInicial/CounterLoading";

const Counter = ({ label, number }: any) => {
  const [displayNumber, setDisplayNumber] = useState(number);
  const [isClient, setIsClient] = useState(false);
  const isMounted = useRef(false);

  useEffect(() => {
    setIsClient(true);
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  useEffect(() => {
    if (!isClient || number === null) return;
    
    const end = parseInt(number);
    const duration = 1000;
    const startTime = Date.now();
    
    const updateCounter = () => {
      if (!isMounted.current) return;
      
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const currentCount = Math.floor(progress * end);
      
      setDisplayNumber(currentCount);
      
      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      }
    };
    
    requestAnimationFrame(updateCounter);
  }, [isClient, number]);

  if (number === null) {
    return <CounterLoading label={label} />;
  }

  return (
    <div className="p-2 m-2 md:p-4 md:m-4 text-center text-white uppercase">
      <h2 className="font-extrabold tracking-wider text-6xl md:text-8xl">
        {isClient ? displayNumber : number}
      </h2>
      <span className="text-xl md:text-3xl">{label}</span>
    </div>
  );
};

export default Counter;
