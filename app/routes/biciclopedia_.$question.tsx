
import { useLoaderData } from "@remix-run/react";
import ReactMarkdown from "react-markdown";
import Breadcrumb from "../components/Commom/Breadcrumb";
import { loader } from "~/loader/biciclopedia.$question";

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

export { loader };

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