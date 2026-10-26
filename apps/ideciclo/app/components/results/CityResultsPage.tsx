import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Award, BarChart3, FileText, MapPinned, RotateCcw } from "lucide-react";
import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@ameciclo/ui/components/alert";
import { Button } from "@ameciclo/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@ameciclo/ui/components/card";
import { cn } from "@ameciclo/ui/lib/utils";
import { calculateCityResults } from "~/lib/ideciclo/results";
import { rankingReadiness } from "~/lib/ideciclo/results-view";
import { type CityResultsData, setRankingVisibility } from "~/queries/forms";
import { NetworkCards } from "./NetworkCards";
import { RankingDialog } from "./RankingDialog";
import { ResultsSummary } from "./ResultsSummary";
import { SegmentsExplorer } from "./SegmentsExplorer";

// The city's IDECICLO: the index or its preview, each network, every structure,
// and the release to the public ranking.
export function CityResultsPage({ data }: { data: CityResultsData }) {
  const queryClient = useQueryClient();
  const results = calculateCityResults(data.city, data.segments, data.forms);
  const [confirming, setConfirming] = useState(false);

  const visibility = useMutation({
    mutationFn: (visible: boolean) => setRankingVisibility({ data: { cityId: data.city.id, visible } }),
    onSuccess: async (result) => {
      if (result.ok) await queryClient.invalidateQueries({ queryKey: ["ideciclo"] });
    },
  });
  const released = data.city.showInRanking;
  // TODO(auth): releasing a city needs the "refinamento_dados_cidade" permission for its scope.
  const toggleRelease = () => (released ? visibility.mutate(false) : setConfirming(true));

  return (
    <div className="space-y-6">
      <ResultsSummary results={results} />
      <NetworkCards networks={results.networks} />
      <SegmentsExplorer segments={results.segments} />

      <Card>
        <CardHeader>
          <CardTitle>Próximos passos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {visibility.isError || visibility.data?.ok === false ? (
            <Alert variant="destructive">
              <AlertTitle>Não foi possível atualizar</AlertTitle>
              <AlertDescription>A liberação do ranking não foi salva. Verifique o banco de dados e tente novamente.</AlertDescription>
            </Alert>
          ) : null}
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <Button asChild className="h-auto flex-col gap-2 p-6">
              <Link to="/avaliacao">
                <FileText className="size-7" />
                <span>Continuar avaliando</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto flex-col gap-2 p-6">
              <Link to="/avaliacao/refinar-dados" search={{ cidade: data.city.id }}>
                <MapPinned className="size-7" />
                <span>Revisar hierarquias</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto flex-col gap-2 p-6">
              <Link to="/ranking">
                <BarChart3 className="size-7" />
                <span>Ver ranking</span>
              </Link>
            </Button>
            <Button
              onClick={toggleRelease}
              variant="outline"
              className={cn("h-auto flex-col gap-2 border-transparent p-6 text-white", released ? "bg-rose-600 hover:bg-rose-700" : "bg-emerald-600 hover:bg-emerald-700")}
              disabled={visibility.isPending}
            >
              <Award className="size-7" />
              <span>{released ? "Remover do ranking" : "Liberar no ranking"}</span>
            </Button>
            <Button asChild variant="outline" className="h-auto flex-col gap-2 p-6">
              <Link to="/avaliacao">
                <RotateCcw className="size-7" />
                <span>Nova cidade</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <RankingDialog
        open={confirming}
        onOpenChange={setConfirming}
        readiness={rankingReadiness(results, data.forms.length)}
        saving={visibility.isPending}
        onConfirm={() => {
          setConfirming(false);
          visibility.mutate(true);
        }}
      />
    </div>
  );
}
