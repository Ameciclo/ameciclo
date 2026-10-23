import { useMemo } from "react";
import type { PerfilCube, PerfilSurveyOption } from "@ameciclo/db/shared";

export default function EditionPicker({
  surveys,
  current,
  onSelect,
}: {
  surveys: PerfilSurveyOption[];
  current: PerfilCube["survey"];
  onSelect: (survey: PerfilSurveyOption) => void;
}) {
  const cities = useMemo(
    () => [...new Set(surveys.map((s) => s.city))].sort((a, b) => a.localeCompare(b, "pt-BR")),
    [surveys],
  );
  const years = surveys.filter((s) => s.city === current.city).sort((a, b) => a.year - b.year);

  const pickCity = (city: string) => {
    // surveys come newest first, so the first match is the city's latest edition
    const latest = surveys.find((s) => s.city === city);
    if (latest) onSelect(latest);
  };

  return (
    <section className="container mx-auto px-4 pt-8">
      <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <span className="font-medium">Cidade</span>
          <select
            value={current.city}
            onChange={(e) => pickCity(e.target.value)}
            className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm"
          >
            {cities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <span className="font-medium">Edição</span>
          <div className="flex flex-wrap gap-2">
            {years.map((s) => (
              <button
                key={s.id}
                onClick={() => onSelect(s)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  s.id === current.id ? "bg-ameciclo text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {s.year}
              </button>
            ))}
          </div>
        </div>
        <span className="text-sm text-gray-500">{current.interviews.toLocaleString("pt-BR")} entrevistas</span>
      </div>
      {current.notes && (
        <details className="mt-3 text-sm text-gray-600">
          <summary className="cursor-pointer text-gray-700">Como esta edição difere das outras</summary>
          <p className="mt-2 leading-relaxed">{current.notes}</p>
        </details>
      )}
    </section>
  );
}
