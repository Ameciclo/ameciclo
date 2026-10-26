import type { CriterionCode, IdecicloFormData, IdecicloRating } from "./form-types";
import { getScoreBreakdown, sectionOf } from "./assessment";

export interface CriterionScorePreviewItem {
  code: CriterionCode;
  rating: IdecicloRating | null;
  points: number | null;
}

export const buildCriterionScorePreview = (
  data: Partial<IdecicloFormData>,
  codes: CriterionCode[]
): CriterionScorePreviewItem[] => {
  const summary = getScoreBreakdown(data);

  return codes.flatMap((code): CriterionScorePreviewItem[] => {
    const rating = summary.resolvedRatings[code] ?? null;
    const points = summary.sections[sectionOf(code)]?.items[code]?.points;

    if (!rating && typeof points !== "number") return [];
    return [{ code, rating, points: typeof points === "number" ? points : null }];
  });
};
