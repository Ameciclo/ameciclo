import { z } from "zod";

// What the evaluation form saves inside ideciclo_form.responses. The public pages
// read the saved result: they never recompute a score from the raw answers.

export const Rating = z.enum(["A", "B", "C", "D"]);
export type Rating = z.infer<typeof Rating>;

const Item = z.object({
  label: z.string(),
  rating: Rating.nullable().optional(),
  points: z.number().nullable().optional(),
  maxPoints: z.number(),
});

const Section = z.object({
  label: z.string(),
  score: z.number(),
  max: z.number(),
  items: z.record(z.string(), Item),
});

const Responses = z.object({
  total_score: z.number().optional(),
  road_hierarchy: z.string().optional(),
  classification: z.string().optional(),
  segment_name: z.string().optional(),
  intersections_count: z.number().optional(),
  criterion_ratings: z.record(z.string(), Rating.nullable()).optional(),
  score_breakdown: z
    .object({
      total: z.number().optional(),
      resolvedRatings: z.record(z.string(), Rating.nullable()).optional(),
      sections: z.record(z.string(), Section).optional(),
    })
    .optional(),
});

export type PersistedResponses = z.infer<typeof Responses>;

export function parseResponses(value: unknown): PersistedResponses | null {
  const parsed = Responses.safeParse(value);
  return parsed.success ? parsed.data : null;
}

export type PersistedSection = z.infer<typeof Section>;
