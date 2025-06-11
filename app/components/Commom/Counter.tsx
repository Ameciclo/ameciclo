import React, { useEffect, useRef } from "react";
import { animate } from "framer-motion";

const Counter = ({ label, number }: any) => {
  const nodeRef = useRef<HTMLHeadingElement | null>(null);

  useEffect(() => {
    const node = nodeRef.current;
    if (!node) return;

    const controls = animate(0, number, {
      duration: 1,
      onUpdate(value) {
        node.textContent = value.toFixed(0);
      },
    });

    return () => controls.stop();
  }, [number]);

  return (
    <div className="p-2 m-2 md:p-4 md:m-4 text-center text-white uppercase">
      <h2
        ref={nodeRef}
        className="font-extrabold tracking-wider text-6xl md:text-8xl"
      >
        {number}
      </h2>
      <span className="text-xl md:text-3xl">{label}</span>
    </div>
  );
};

export default Counter;
