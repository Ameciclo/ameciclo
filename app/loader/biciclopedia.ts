import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { fetchJsonFromCMS } from "../services/cmsApi";

const server = "https://cms.ameciclo.org";

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

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    const [faqs, categories] = await Promise.all([
      fetchJsonFromCMS<FAQ[]>(`${server}/faqs`),
      fetchJsonFromCMS<Category[]>(`${server}/faq-tags`)
    ]);

    return json({ faqs: faqs || [], categories: categories || [] });
  } catch (error) {
    console.error('Error loading biciclopedia data:', error);
    return json({ faqs: [], categories: [] });
  }
};