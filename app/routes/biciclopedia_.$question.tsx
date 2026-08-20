import { createFileRoute, Link } from "@tanstack/react-router";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeExternalLinks from "rehype-external-links";
import type { PluggableList } from "unified";
import Breadcrumb from "../components/Commom/Breadcrumb";
import { useSuspenseQuery } from "@tanstack/react-query";
import { biciclopediaQuestionQueryOptions } from "~/queries/biciclopedia.$question";
import { RouteLoading, RouteErrorBoundary } from "~/components/Commom/RouteBoundaries";
import { seo } from "~/utils/seo";

const remarkPlugins: PluggableList = [remarkGfm];
const rehypePlugins: PluggableList = [
  [rehypeExternalLinks, { target: "_blank", rel: ["noopener", "noreferrer"] }],
];

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
      description: question.description ?? undefined,
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
  const { data: { question: questionData, related } } = useSuspenseQuery(biciclopediaQuestionQueryOptions(question));

  return (
    <>
      <div
        className="object-fill h-no-cover bg-center bg-cover"
        style={{
          width: "100%",
          backgroundImage: `url('/biciclopedia.webp')`,
        }}
      />
      <Breadcrumb
        label={questionData.title || "Pergunta"}
        slug={`/biciclopedia/${question}`}
        routes={["/", "/biciclopedia"]}
      />
      <section className="container mx-auto my-8">
        <div className="flex flex-col mb-6 bg-white rounded-lg shadow-xl">
          <div className="px-6">
            <div className="mt-12 text-center">
              {questionData.faq_tags && questionData.faq_tags.length > 0 ? (
                <ul className="flex flex-wrap justify-center gap-2 mb-4 list-none p-0">
                  {questionData.faq_tags.map((tag) => (
                    <li key={tag.id}>
                      <Link
                        to="/biciclopedia"
                        search={{ categoria: tag.id }}
                        hash={`categoria-${tag.id}`}
                        className="inline-block px-3 py-1 text-xs font-bold uppercase tracking-wide text-white bg-ameciclo rounded-full hover:opacity-80"
                      >
                        {tag.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : null}
              <h1 className="mb-2 text-4xl font-semibold leading-normal text-gray-800">
                {questionData.title}
              </h1>
              <p className="mb-4 text-xl font-medium leading-normal text-gray-600">
                {questionData.description}
              </p>
            </div>
          </div>
          <div className="py-10 mt-10 text-center border-t border-gray-300">
            <div className="flex flex-wrap justify-center">
              <div className="w-full px-4 mb-4 text-gray-800 lg:w-9/12 markdown_box prose prose-stone max-w-none mx-auto text-left prose-a:text-ameciclo prose-a:underline prose-a:underline-offset-2 prose-a:hover:opacity-80">
                <ReactMarkdown
                  remarkPlugins={remarkPlugins}
                  rehypePlugins={rehypePlugins}
                >
                  {questionData.answer || ''}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        </div>
        {related.length > 0 ? (
          <aside className="flex flex-col p-6 mb-6 bg-white rounded-lg shadow-xl">
            <h2 className="mb-4 text-2xl font-semibold text-gray-800">
              Veja também
            </h2>
            <ul className="flex flex-col gap-3 list-none p-0">
              {related.map((q) => (
                <li key={q.id}>
                  <Link
                    to="/biciclopedia/$question"
                    params={{ question: String(q.id) }}
                    className="block text-lg text-ameciclo underline underline-offset-2 hover:opacity-80"
                  >
                    {q.title}
                  </Link>
                  {q.description ? (
                    <p className="text-sm text-gray-600">{q.description}</p>
                  ) : null}
                </li>
              ))}
            </ul>
          </aside>
        ) : null}
      </section>
    </>
  );
}
