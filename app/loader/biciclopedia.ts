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

export const loader = async () => {
  try {
    const [faqs, categories] = await Promise.all([
      fetchJsonFromCMS<FAQ[]>(`${server}/faqs`),
      fetchJsonFromCMS<Category[]>(`${server}/faq-tags`)
    ]);

    return { faqs: faqs || [], categories: categories || [] };
  } catch (error) {
    console.error('Error loading biciclopedia data:', error);
    return { faqs: [], categories: [] };
  }
};