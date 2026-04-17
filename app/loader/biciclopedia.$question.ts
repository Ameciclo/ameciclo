import { queryOptions } from "@tanstack/react-query";
import { fetchJsonFromCMS } from "../services/cmsApi";
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

export const biciclopediaQuestionQueryOptions = (question: string) =>
  queryOptions({
    queryKey: ["biciclopedia", question],
    queryFn: async () => {
      if (!question) {
        throw new Response("Question ID is required", { status: 400 });
      }

      try {
        const res = await fetchJsonFromCMS<{ data: Question[] }>(
          `${server}/api/faqs?filters[id][$eq]=${question}&populate=faq_tags`,
        );
        const questionData = res?.data?.[0];

        if (!questionData) {
          throw new Response("Question not found", { status: 404 });
        }

        return { question: questionData };
      } catch (error) {
        throw new Response("Error loading question", { status: 500 });
      }
    },
  });

export const loader = async ({
  params,
}: {
  params: { question: string };
}) => biciclopediaQuestionQueryOptions(params.question).queryFn({} as any);
