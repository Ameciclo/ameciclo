import React, { useState, useEffect } from 'react';

function Loading() {
  const [color, setColor] = useState("#008080"); // ameciclo color
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    // Only load PulseLoader on client-side
    setIsClient(true);
    
    const interval = setInterval(() => {
      setColor(prevColor => 
        prevColor === "#008080" ? "#5050aa" : "#008080"
      );
    }, 2000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-8">
        Aguarde enquanto os dados são carregados
      </h1>
      
      <div className="flex flex-col items-center gap-8">
        {isClient ? (
          // Only render spinner on client-side
          <div className="flex gap-2">
            <div className="w-4 h-4 rounded-full animate-pulse" style={{ backgroundColor: color }}></div>
            <div className="w-4 h-4 rounded-full animate-pulse animation-delay-200" style={{ backgroundColor: color }}></div>
            <div className="w-4 h-4 rounded-full animate-pulse animation-delay-400" style={{ backgroundColor: color }}></div>
          </div>
        ) : (
          // Fallback for server-side rendering
          <div className="flex gap-2">
            <div className="w-4 h-4 rounded-full bg-ameciclo"></div>
            <div className="w-4 h-4 rounded-full bg-ameciclo"></div>
            <div className="w-4 h-4 rounded-full bg-ameciclo"></div>
          </div>
        )}
        
        <div className="mt-4 text-lg text-gray-600">
          Preparando visualização dos dados orçamentários
        </div>
      </div>
    </div>
  );
}

export default Loading;