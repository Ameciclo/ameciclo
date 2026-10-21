import { ClientOnly } from "@tanstack/react-router";
import type { Options } from "highcharts";
import { lazy, Suspense } from "react";

const HighchartsChart = lazy(() => import("./HighchartsChart"));

const placeholder = <div className="flex h-96 items-center justify-center text-gray-500">Carregando gráfico...</div>;

export function LazyChart({ options }: { options: Options }) {
  return (
    <ClientOnly fallback={placeholder}>
      <Suspense fallback={placeholder}>
        <HighchartsChart options={options} />
      </Suspense>
    </ClientOnly>
  );
}
