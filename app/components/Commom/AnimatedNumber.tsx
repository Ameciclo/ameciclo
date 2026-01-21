import { useState, useEffect } from "react";

interface AnimatedNumberProps {
  initialValue: number;
  finalValue: number;
  duration: number;
  formatter?: (value: number) => string;
}

export function AnimatedNumber({ 
  initialValue, 
  finalValue, 
  duration,
  formatter = (value) => value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })
}: AnimatedNumberProps) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    const increment = (finalValue - initialValue) / (duration / 10);

    const interval = setInterval(() => {
      setValue((prevValue) => {
        const newValue = prevValue + increment;
        return newValue >= finalValue ? finalValue : newValue;
      });
    }, 10);

    return () => clearInterval(interval);
  }, [initialValue, finalValue, duration]);

  return <>{formatter(value)}</>;
}
