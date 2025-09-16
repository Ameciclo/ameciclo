import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { fetchJsonFromCMS } from "../services/cmsApi";

const server = "https://cms.ameciclo.org";

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

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const questionId = params.question;
  
  if (!questionId) {
    throw new Response("Question ID is required", { status: 400 });
  }

  try {
    const questions = await fetchJsonFromCMS<Question[]>(`${server}/faqs?id=${questionId}`);
    const question = questions[0];
    
    if (!question) {
      throw new Response("Question not found", { status: 404 });
    }

    return json({ question });
  } catch (error) {
    console.error('Error loading question:', error);
    throw new Response("Error loading question", { status: 500 });
  }
};