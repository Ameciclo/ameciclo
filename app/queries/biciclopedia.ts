import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { cmsFetch } from "~/services/cmsFetch";
import { makeApiErrorTracker } from "~/services/apiTracking";
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

const FAQS_URL = `${server}/api/faqs`;
const CATEGORIES_URL = `${server}/api/faq-tags?populate=faqs`;

const fetchBiciclopedia = createServerFn().handler(async () => {
  const tracker = makeApiErrorTracker();

  const [faqsRes, categoriesRes] = await Promise.all([
    cmsFetch<{ data: FAQ[] }>(FAQS_URL, {
      ttl: 600,
      onError: tracker.at(FAQS_URL),
    }),
    cmsFetch<{ data: Category[] }>(CATEGORIES_URL, {
      ttl: 600,
      onError: tracker.at(CATEGORIES_URL),
    }),
  ]);

  return {
    faqs: faqsRes?.data || [],
    categories: categoriesRes?.data || [],
  };
});

export const biciclopediaQueryOptions = () =>
  queryOptions({
    queryKey: ["biciclopedia"],
    queryFn: () => fetchBiciclopedia(),
  });
