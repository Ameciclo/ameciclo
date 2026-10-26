import { createContext, useContext } from "react";

export type CriterionAnswerFilter = "all" | "answered" | "unanswered";
export type CriterionReviewFilter = "all" | "analysis";
export type CriterionFilterMode = "or" | "and";

export interface CriterionFilter {
  answer: CriterionAnswerFilter;
  review: CriterionReviewFilter;
  mode: CriterionFilterMode;
}

export const NO_CRITERION_FILTER: CriterionFilter = { answer: "all", review: "all", mode: "or" };

interface CriteriaAccordionContextValue {
  filter: CriterionFilter;
  descriptionsVisible: boolean;
  criterionMetaVisible: boolean;
}

export const CriteriaAccordionContext = createContext<CriteriaAccordionContextValue>({
  filter: NO_CRITERION_FILTER,
  descriptionsVisible: true,
  criterionMetaVisible: true,
});

export const useCriteriaAccordionFilter = () => useContext(CriteriaAccordionContext);

/**
 * Whether a criterion passes the filters on the form: "Respondidos" /
 * "Pendentes" (a pinned item counts as pending) and "Fixados". With both on,
 * the mode says whether an item needs to match one or both.
 */
export const matchesCriterionFilter = (filter: CriterionFilter, state: { answered: boolean; inAnalysis: boolean }): boolean => {
  const answerMatches =
    filter.answer === "all" ||
    (filter.answer === "answered" && state.answered) ||
    (filter.answer === "unanswered" && (!state.answered || state.inAnalysis));
  const reviewMatches = filter.review === "all" || (filter.review === "analysis" && state.inAnalysis);

  const hasAnswerFilter = filter.answer !== "all";
  const hasReviewFilter = filter.review !== "all";

  if (hasAnswerFilter && hasReviewFilter) return filter.mode === "and" ? answerMatches && reviewMatches : answerMatches || reviewMatches;
  if (hasAnswerFilter) return answerMatches;
  if (hasReviewFilter) return reviewMatches;
  return true;
};
