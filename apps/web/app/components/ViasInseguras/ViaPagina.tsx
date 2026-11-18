// Uma via: quantos chamados, quanto por km, em que anos e de que tipo, e onde ela fica.
import { Link } from "@tanstack/react-router";
import type { ViaView } from "~/queries/dados.vias-inseguras";
import { CategoryBars, YearBars } from "./ViasCharts";
import { ViasMap } from "./ViasMap";
import { km, n, perKm } from "./labels";

export default function ViaPagina({ via }: { via: ViaView }) {
  const { street } = via;
  const geometries = via.geometry ? { [street.key]: via.geometry } : {};
  return (
    <>
      <header className="container mx-auto px-4 pt-8">
        <h1 className="text-3xl font-bold text-gray-900">{street.name}</h1>
        <p className="mt-2 max-w-prose text-gray-700">
          Chamados do SAMU por sinistro de trânsito, com atendimento, nesta via do Recife, de {via.years[0]?.year} a {via.years.at(-1)?.year}.
        </p>
      </header>

      <section className="container mx-auto mt-6 px-4">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Stat label="Chamados" value={n(street.calls)} />
          <Stat label="No ranking do Recife" value={`${via.rankOverall}ª`} />
          <Stat label="Extensão" value={street.lengthKm === null ? "–" : `${km(street.lengthKm)} km`} />
          <Stat label="Chamados por km" value={perKm(street.callsPerKm)} />
        </div>
        {street.lengthKm === null && <p className="mt-2 text-xs text-gray-500">Este nome não casa com a malha viária da Prefeitura: não temos a extensão nem o traçado.</p>}
      </section>

      <section className="container mx-auto mt-8 grid grid-cols-1 gap-8 px-4 md:grid-cols-2">
        <div>
          <h2 className="mb-2 text-lg font-semibold text-gray-900">Chamados por ano</h2>
          <YearBars years={via.years} />
        </div>
        <div>
          <h2 className="mb-2 text-lg font-semibold text-gray-900">Que tipo de sinistro</h2>
          <CategoryBars categories={via.categories} />
        </div>
      </section>

      {via.geometry && (
        <section className="container mx-auto mt-8 px-4">
          <h2 className="mb-2 text-lg font-semibold text-gray-900">Onde fica</h2>
          <ViasMap streets={[street]} geometries={geometries} selectedKey={undefined} onSelect={() => undefined} single />
        </section>
      )}

      <p className="container mx-auto mb-10 mt-8 px-4">
        <Link to="/dados/viasinseguras" className="text-sm font-medium text-ameciclo underline underline-offset-2">← Todas as vias</Link>
      </p>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-1 text-3xl font-bold tabular-nums text-ameciclo">{value}</p>
    </div>
  );
}
