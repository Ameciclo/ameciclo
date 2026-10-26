import { useState } from "react";
import type { AccordionCommand } from "./CriteriaAccordionGroup";
import type { CriterionAnswerFilter, CriterionFilter, CriterionReviewFilter } from "./criteria-context";

export const ANSWER_FILTERS: { value: CriterionAnswerFilter; label: string; compact: string }[] = [
  { value: "all", label: "Situação", compact: "R.:" },
  { value: "answered", label: "Respondidos", compact: "R.:" },
  { value: "unanswered", label: "Pendentes", compact: "P." },
];

export const REVIEW_FILTERS: { value: CriterionReviewFilter; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "analysis", label: "Fixados" },
];

const next = <T extends { value: string }>(sequence: T[], current: string): T["value"] => {
  const index = sequence.findIndex((item) => item.value === current);
  return sequence[(index + 1) % sequence.length]?.value ?? sequence[0]?.value ?? current;
};

/** How the form is being viewed: filters, expanded or collapsed, and which helpers show. */
export function useFormViewState() {
  const [answer, setAnswer] = useState<CriterionAnswerFilter>("all");
  const [review, setReview] = useState<CriterionReviewFilter>("all");
  const [mode, setMode] = useState<CriterionFilter["mode"]>("or");
  const [expanded, setExpanded] = useState(true);
  const [command, setCommand] = useState<AccordionCommand>(null);
  const [descriptionsVisible, setDescriptionsVisible] = useState(true);
  const [metaVisible, setMetaVisible] = useState(true);
  const [navigationVisible, setNavigationVisible] = useState(true);

  const filter: CriterionFilter = { answer, review, mode };

  return {
    filter,
    command,
    expanded,
    descriptionsVisible,
    metaVisible,
    navigationVisible,
    cycleAnswer: () => setAnswer((current) => next(ANSWER_FILTERS, current)),
    cycleReview: () => setReview((current) => next(REVIEW_FILTERS, current)),
    toggleMode: () => setMode((current) => (current === "or" ? "and" : "or")),
    toggleExpanded: () => {
      const nextExpanded = !expanded;
      setExpanded(nextExpanded);
      setCommand({ type: nextExpanded ? "expand" : "collapse", nonce: Date.now() });
    },
    toggleDescriptions: () => setDescriptionsVisible((current) => !current),
    toggleMeta: () => setMetaVisible((current) => !current),
    toggleNavigation: () => setNavigationVisible((current) => !current),
  };
}

export type FormViewState = ReturnType<typeof useFormViewState>;
