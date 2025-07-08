import { json, type LoaderFunctionArgs, type MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import ReactMarkdown from "react-markdown";
import Breadcrumb from "../components/Commom/Breadcrumb";
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

interface LoaderData {
  question: Question;
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data?.question) {
    return [
      { title: "Pergunta não encontrada - Biciclopedia" },
    ];
  }
  
  return [
    { title: `${data.question.title} - Biciclopedia` },
    { name: "description", content: data.question.description },
  ];
};

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

export default function Question() {
  const { question } = useLoaderData<LoaderData>();

  return (
    <>
      <div
        className="object-fill h-auto px-10 py-24 text-white bg-center bg-cover"
        style={{
          width: "100%",
          height: "52vh",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundImage: `url('/biciclopedia.webp')`,
        }}
      />
      <div className="flex items-center p-4 text-white uppercase bg-ameciclo">
        <div className="container mx-auto">
          <Breadcrumb
            label={question.faq_tags[0]?.title || "Biciclopedia"}
            slug="/biciclopedia"
            routes={["/", "/biciclopedia"]}
          />
        </div>
      </div>
      <section className="container mx-auto my-8">
        <div className="flex flex-col mb-6 bg-white rounded-lg shadow-xl">
          <div className="px-6">
            <div className="mt-12 text-center">
              <h3 className="mb-2 text-4xl font-semibold leading-normal text-gray-800">
                {question.title}
              </h3>
              <p className="mb-2 text-2xl font-semibold leading-normal text-gray-800">
                {question.description}
              </p>
            </div>
          </div>
          <div className="py-10 mt-10 text-center border-t border-gray-300">
            <div className="flex flex-wrap justify-center">
              <div className="w-full px-4 mb-4 text-lg leading-relaxed text-center text-gray-800 lg:w-9/12 markdown_box">
                <ReactMarkdown>{question.answer || ''}</ReactMarkdown>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}