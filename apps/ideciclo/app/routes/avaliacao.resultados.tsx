import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Button } from "@ameciclo/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@ameciclo/ui/components/card";
import { CityResultsPage } from "~/components/results/CityResultsPage";
import { validateAssessmentSearch } from "~/lib/assessment-search";
import { cityResultsQueryOptions } from "~/queries/forms";

// The active city is in the URL (?cidade=<IBGE code>), like the rest of the assessment.
// TODO(auth): the original let viewers in (allowViewer) but only within their city scope.
export const Route = createFileRoute("/avaliacao/resultados")({
  validateSearch: validateAssessmentSearch,
  loaderDeps: ({ search }) => ({ cidade: search.cidade }),
  loader: async ({ context: { queryClient }, deps }) => {
    if (deps.cidade) await queryClient.ensureQueryData(cityResultsQueryOptions(deps.cidade));
  },
  head: () => ({ meta: [{ title: "Resultados - IDECICLO" }] }),
  component: ResultsRoute,
});

function ResultsRoute() {
  const { cidade } = Route.useSearch();

  return (
    <div className="container py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold">Resultados</h1>
          <p className="text-gray-600">Visualize a nota calculada e o índice IDECICLO da cidade</p>
        </div>
        <Button variant="outline" asChild>
          <Link to="/avaliacao">
            <ArrowLeft className="mr-2 size-4" />
            Voltar às Etapas
          </Link>
        </Button>
      </div>

      {cidade ? <CityResults cityId={cidade} /> : <Pick message="Selecione uma cidade para ver o cálculo" />}
    </div>
  );
}

function CityResults({ cityId }: { cityId: string }) {
  const { data } = useSuspenseQuery(cityResultsQueryOptions(cityId));
  return data ? <CityResultsPage data={data} /> : <Pick message="Cidade não encontrada" />;
}

function Pick({ message }: { message: string }) {
  return (
    <Card className="border-dashed">
      <CardHeader className="text-center">
        <CardTitle>{message}</CardTitle>
      </CardHeader>
      <CardContent className="flex justify-center">
        <Button asChild>
          <Link to="/avaliacao">Escolher cidade</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
