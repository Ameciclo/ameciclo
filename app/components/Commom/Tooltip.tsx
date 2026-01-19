import React, { useRef, useState } from "react";

interface TooltipProps {
  children: React.ReactNode;
  text: string;
}

export function Tooltip({ children, text }: TooltipProps) {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [adjustedPosition, setAdjustedPosition] = useState(false);

  const handleMouseEnter = () => {
    if (tooltipRef.current) {
      const rect = tooltipRef.current.getBoundingClientRect();
      setAdjustedPosition(rect.left < 10);
    }
  };

  return (
    <div className="group relative inline-block" onMouseEnter={handleMouseEnter}>
      {children}
      <div 
        ref={tooltipRef}
        className={`absolute bottom-full mb-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 whitespace-nowrap ${
          adjustedPosition ? 'left-2.5' : 'left-1/2 transform -translate-x-1/2'
        }`}
      >
        {text}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
      </div>
    </div>
  );
}
