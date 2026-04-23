import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { notFound } from "@tanstack/react-router";
import { cmsFetch } from "~/services/cmsFetch";
import { CMS_BASE_URL } from "~/servers";

const server = CMS_BASE_URL;

interface FAQTag {
  id: number;
  title: string;
  slug: string;
}

interface Question {
  id: number;
  title: string;
  description: string;
  answer: string;
  faq_tags: FAQTag[];
}

const fetchBiciclopediaQuestion = createServerFn()
  .inputValidator((input: { question: string }) => input)
  .handler(async ({ data }) => {
    const { question } = data;
    if (!question) {
      throw new Error("Question ID is required");
    }

    const url = `${server}/api/faqs?filters[id][$eq]=${question}&populate=faq_tags`;

    const res = await cmsFetch<{ data: Question[] }>(url, { ttl: 600 });
    const questionData = res?.data?.[0];

    if (!questionData) {
      throw notFound();
    }

    return { question: questionData };
  });

export const biciclopediaQuestionQueryOptions = (question: string) =>
  queryOptions({
    queryKey: ["biciclopedia", question],
    queryFn: () => fetchBiciclopediaQuestion({ data: { question } }),
  });
