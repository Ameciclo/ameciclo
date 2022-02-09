import React, { useEffect, useRef } from "react";
import { animate } from "framer-motion";

const Counter = ({ label, number }) => {
  const nodeRef = useRef();

  useEffect(() => {
    const node = nodeRef.current;

    const controls = animate(0, number, {
      duration: 1,
      onUpdate(value) {
        // @ts-ignore
        node.textContent = value.toFixed(0);
      },
    });

    return () => controls.stop();
  }, [number]);

  return (
    <div className="p-4 m-4 text-center text-white uppercase">
      <h2
        ref={nodeRef}
        className="font-extrabold tracking-wider"
        style={{ fontSize: "8rem" }}
      >
        {number}
      </h2>
      <span className="text-3xl">{label}</span>
    </div>
  );
};

export default Counter;
