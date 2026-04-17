import { queryOptions } from "@tanstack/react-query";
import { fetchJsonFromCMS } from "../services/cmsApi";
import { CMS_BASE_URL } from "~/servers";

const server = CMS_BASE_URL;

interface FAQ {
  id: number;
  title: string;
  description: string;
  answer?: string;
}

interface Category {
  id: number;
  title: string;
  faqs: FAQ[];
}

interface StrapiResponse<T> {
  data: T;
}

export const biciclopediaQueryOptions = () =>
  queryOptions({
    queryKey: ["biciclopedia"],
    queryFn: async () => {
      try {
        const [faqsRes, categoriesRes] = await Promise.all([
          fetchJsonFromCMS<StrapiResponse<FAQ[]>>(`${server}/api/faqs`),
          fetchJsonFromCMS<StrapiResponse<Category[]>>(
            `${server}/api/faq-tags?populate=faqs`,
          ),
        ]);

        return {
          faqs: faqsRes?.data || [],
          categories: categoriesRes?.data || [],
        };
      } catch (error) {
        console.error("Error loading biciclopedia data:", error);
        return { faqs: [], categories: [] };
      }
    },
  });

export const loader = async () => biciclopediaQueryOptions().queryFn({} as any);
