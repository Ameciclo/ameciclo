import React from "react";
import { Tooltip as ShadcnTooltip } from "~/components/ui/tooltip";

interface TooltipProps {
  children: React.ReactNode;
  text: string;
}

export function Tooltip({ children, text }: TooltipProps) {
  return (
    <ShadcnTooltip content={text} side="top">
      {children}
    </ShadcnTooltip>
  );
}
