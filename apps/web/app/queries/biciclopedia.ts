import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { strapiClient } from "~/lib/strapi";

const FAQSchema = z.object({
  id: z.number(),
  documentId: z.string().nullish(),
  title: z.string().nullish(),
  description: z.string().nullish(),
  answer: z.string().nullish(),
});

const FAQCategorySchema = z.object({
  id: z.number(),
  documentId: z.string().nullish(),
  title: z.string().nullish(),
  faqs: z.array(FAQSchema).nullish(),
});

export type FAQ = z.infer<typeof FAQSchema>;
export type FAQCategory = z.infer<typeof FAQCategorySchema>;

const fetchBiciclopedia = createServerFn().handler(async () => {
  const [faqsRes, categoriesRes] = await Promise.all([
    strapiClient.collection("faqs").find({
      pagination: { pageSize: 100 },
    }),
    strapiClient.collection("faq-tags").find({
      pagination: { pageSize: 100 },
      populate: ["faqs"],
    }),
  ]);

  const faqs = z.array(FAQSchema).parse(faqsRes.data);
  const categories = z.array(FAQCategorySchema).parse(categoriesRes.data);

  return { faqs, categories };
});

export const biciclopediaQueryOptions = () =>
  queryOptions({
    queryKey: ["biciclopedia"],
    queryFn: () => fetchBiciclopedia(),
  });
