import { type ReactNode, useMemo, useState } from "react";
import { Accordion } from "@ameciclo/ui/components/accordion";
import {
  CriteriaAccordionContext,
  type CriterionFilter,
  NO_CRITERION_FILTER,
  useCriteriaAccordionFilter,
} from "./criteria-context";

export type AccordionCommand = { type: "expand" | "collapse"; nonce: number } | null;

interface CriteriaAccordionGroupProps {
  allValues: string[];
  defaultOpenValues?: string[];
  filter?: CriterionFilter;
  command?: AccordionCommand;
  children: ReactNode;
}

export function CriteriaAccordionGroup({
  allValues,
  defaultOpenValues,
  filter = NO_CRITERION_FILTER,
  command,
  children,
}: CriteriaAccordionGroupProps) {
  const [openValues, setOpenValues] = useState<string[]>(defaultOpenValues ?? allValues);
  const [appliedNonce, setAppliedNonce] = useState(command?.nonce ?? null);
  const parentContext = useCriteriaAccordionFilter();

  // "Expandir tudo" / "Recolher tudo" arrive as a command with a fresh nonce;
  // apply each one once, while rendering, instead of in an effect.
  if (command && command.nonce !== appliedNonce) {
    setAppliedNonce(command.nonce);
    setOpenValues(command.type === "expand" ? allValues : []);
  }

  const contextValue = useMemo(
    () => ({ filter, descriptionsVisible: parentContext.descriptionsVisible, criterionMetaVisible: parentContext.criterionMetaVisible }),
    [filter, parentContext.descriptionsVisible, parentContext.criterionMetaVisible],
  );

  return (
    <CriteriaAccordionContext.Provider value={contextValue}>
      <Accordion type="multiple" value={openValues} onValueChange={setOpenValues} className="space-y-4">
        {children}
      </Accordion>
    </CriteriaAccordionContext.Provider>
  );
}
