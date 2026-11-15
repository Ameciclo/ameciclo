import { MapPinOff } from "lucide-react";
import type { pointData } from "typings";
import { AmecicloMap } from "~/components/Commom/Maps/AmecicloMap";
import { calculateMarkerSize } from "~/hooks/useCountsMapData";
import { IntlNumber } from "~/services/utils";

const dropPath =
  "M20.2,15.7L20.2,15.7c1.1-1.6,1.8-3.6,1.8-5.7c0-5.6-4.5-10-10-10S2,4.5,2,10c0,2,0.6,3.9,1.6,5.4c0,0.1,0.1,0.2,0.2,0.3c0,0,0.1,0.1,0.1,0.2c0.2,0.3,0.4,0.6,0.7,0.9c2.6,3.1,7.4,7.6,7.4,7.6s4.8-4.5,7.4-7.5c0.2-0.3,0.5-0.6,0.7-0.9C20.1,15.8,20.2,15.8,20.2,15.7z";

// Reference totals for the size legend; sizes come from the same function the markers use.
const SCALE_TOTALS = [500, 3000, 7000];

function SizeLegend() {
  return (
    <div className="flex items-end gap-4" aria-label="Tamanho do marcador conforme o total de ciclistas">
      {SCALE_TOTALS.map((total) => {
        const size = calculateMarkerSize(total);
        return (
          <div key={total} className="flex flex-col items-center gap-0.5">
            <svg width={size} height={size} viewBox="0 0 24 24" className="fill-primary" aria-hidden>
              <path d={dropPath} />
            </svg>
            <span className="text-xs text-muted-foreground tabular-nums">{IntlNumber(total)}</span>
          </div>
        );
      })}
      <span className="pb-0.5 text-xs text-muted-foreground">ciclistas na última contagem</span>
    </div>
  );
}

type CountsMapSectionProps = {
  points: pointData[];
  onPointClick: (point: pointData) => void;
};

export function CountsMapSection({ points, onPointClick }: CountsMapSectionProps) {
  return (
    <section className="py-10 md:py-14" aria-labelledby="mapa-contagens">
      <div className="container mx-auto px-4">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
          <div>
            <h2 id="mapa-contagens" className="text-2xl font-bold md:text-3xl">
              Onde contamos
            </h2>
            <p className="mt-1 text-muted-foreground">
              <strong className="font-semibold text-foreground tabular-nums">{points.length}</strong>{" "}
              {points.length === 1 ? "local" : "locais"} no mapa, seguindo o ano e o filtro de contagens completas. Clique em um ponto para ver os detalhes.
            </p>
          </div>
          <SizeLegend />
        </div>
        <div className="relative overflow-hidden rounded-xl border shadow-sm">
          <AmecicloMap
            pointsData={points}
            width="100%"
            height="clamp(340px, 62vh, 540px)"
            onPointClick={onPointClick}
          />
          {points.length === 0 && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-background/85 p-6 text-center">
              <MapPinOff className="size-8 text-muted-foreground" aria-hidden />
              <p className="font-semibold">Nenhum local para mostrar</p>
              <p className="max-w-sm text-sm text-muted-foreground">Mude o ano ou desmarque “Ocultar contagens estimadas e parciais” para ver os pontos.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
