import { createFileRoute } from "@tanstack/react-router";
import ReactMarkdown from "react-markdown";
import Breadcrumb from "../components/Commom/Breadcrumb";
import { useSuspenseQuery } from "@tanstack/react-query";
import { biciclopediaQuestionQueryOptions } from "~/queries/biciclopedia.$question";
import { RouteLoading, RouteErrorBoundary } from "~/components/Commom/RouteBoundaries";
import { seo } from "~/utils/seo";

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

export const Route = createFileRoute("/biciclopedia_/$question")({
  loader: ({ context: { queryClient }, params: { question } }) =>
    queryClient.ensureQueryData(biciclopediaQuestionQueryOptions(question)),
  head: ({ params, loaderData }) => {
    const question = loaderData?.question;
    const pathname = `/biciclopedia/${params.question}`;
    if (!question) {
      return seo({
        title: "Pergunta não encontrada - Biciclopedia - Ameciclo",
        pathname,
        noindex: true,
      });
    }
    return seo({
      title: `${question.title} - Biciclopedia - Ameciclo`,
      description: question.description,
      pathname,
      type: "article",
    });
  },
  component: QuestionPage,
  pendingComponent: () => <RouteLoading label="Carregando pergunta..." />,
  pendingMs: 500,
  pendingMinMs: 800,
  errorComponent: RouteErrorBoundary,
});

function QuestionPage() {
  const { question } = Route.useParams();
  const { data: { question: questionData } } = useSuspenseQuery(biciclopediaQuestionQueryOptions(question));

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
            label={questionData.faq_tags[0]?.title || "Biciclopedia"}
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
                {questionData.title}
              </h3>
              <p className="mb-2 text-2xl font-semibold leading-normal text-gray-800">
                {questionData.description}
              </p>
            </div>
          </div>
          <div className="py-10 mt-10 text-center border-t border-gray-300">
            <div className="flex flex-wrap justify-center">
              <div className="w-full px-4 mb-4 text-gray-800 lg:w-9/12 markdown_box prose prose-stone max-w-none mx-auto text-left prose-a:text-ameciclo prose-a:underline prose-a:underline-offset-2 hover:prose-a:opacity-80">
                <ReactMarkdown>{questionData.answer || ''}</ReactMarkdown>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
