// The assessment session lives in the URL: which city is active and, once
// chosen, which structure is being evaluated.
export type AssessmentSearch = { cidade?: string; trecho?: string };

// The router JSON-parses search values, so an IBGE code typed in the URL arrives as a number.
const text = (value: unknown) => {
  if (typeof value === "number") return String(value);
  return typeof value === "string" && value !== "" ? value : undefined;
};

export const validateAssessmentSearch = (search: Record<string, unknown>): AssessmentSearch => ({
  cidade: text(search.cidade),
  trecho: text(search.trecho),
});
