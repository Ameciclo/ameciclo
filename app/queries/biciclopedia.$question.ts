import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { notFound } from "@tanstack/react-router";
import { z } from "zod";
import { strapiClient } from "~/lib/strapi";

const FAQTagSchema = z.object({
  id: z.number(),
  documentId: z.string().nullish(),
  title: z.string().nullish(),
  slug: z.string().nullish(),
});

const FAQDetailSchema = z.object({
  id: z.number(),
  documentId: z.string().nullish(),
  title: z.string().nullish(),
  description: z.string().nullish(),
  answer: z.string().nullish(),
  faq_tags: z.array(FAQTagSchema).nullish(),
});

export type FAQTag = z.infer<typeof FAQTagSchema>;
export type FAQDetail = z.infer<typeof FAQDetailSchema>;

const fetchBiciclopediaQuestion = createServerFn()
  .inputValidator((input: { question: string }) => input)
  .handler(async ({ data: input }) => {
    const { question } = input;
    if (!question) {
      throw new Error("Question ID is required");
    }

    const res = await strapiClient.collection("faqs").find({
      filters: { id: { $eq: question } },
      populate: ["faq_tags"],
    });

    const raw = res.data?.[0];
    if (!raw) {
      throw notFound();
    }

    const questionData = FAQDetailSchema.parse(raw);

    const tagIds = (questionData.faq_tags ?? []).map((t) => t.id);

    let related: FAQDetail[] = [];
    if (tagIds.length > 0) {
      const relatedRes = await strapiClient.collection("faqs").find({
        filters: {
          faq_tags: { id: { $in: tagIds } },
          id: { $ne: question },
        },
        pagination: { pageSize: 3 },
        populate: ["faq_tags"],
      });
      related = z.array(FAQDetailSchema).parse(relatedRes.data ?? []);
    }

    return { question: questionData, related };
  });

export const biciclopediaQuestionQueryOptions = (question: string) =>
  queryOptions({
    queryKey: ["biciclopedia", question],
    queryFn: () => fetchBiciclopediaQuestion({ data: { question } }),
  });
