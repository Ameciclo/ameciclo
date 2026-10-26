import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { EvaluationForm } from "~/components/form/EvaluationForm";
import { formContextQueryOptions } from "~/queries/forms";

type Search = { step?: "review" };

// Client-only: the form restores a local draft and draws a map, neither of
// which exists on the server.
// TODO(auth): requires the "avaliacao_estrutura_cicloviaria" permission for the
// city's scope once auth is ported; open for now.
export const Route = createFileRoute("/avaliacao/formulario-ideciclo/$segmentId")({
  ssr: false,
  validateSearch: (search: Record<string, unknown>): Search => (search.step === "review" ? { step: "review" } : {}),
  loader: async ({ context: { queryClient }, params }) => {
    const context = await queryClient.ensureQueryData(formContextQueryOptions(params.segmentId));
    if (!context) throw notFound();
  },
  head: () => ({ meta: [{ title: "Avaliar trecho - IDECICLO" }] }),
  component: EvaluationPage,
});

function EvaluationPage() {
  const { segmentId } = Route.useParams();
  const { step } = Route.useSearch();
  const { data: context } = useSuspenseQuery(formContextQueryOptions(segmentId));
  if (!context) return null;

  // `key`: a different segment is a different form, not an edit of this one.
  return <EvaluationForm key={context.segment.id} context={context} initialStep={step === "review" ? 2 : 1} />;
}
