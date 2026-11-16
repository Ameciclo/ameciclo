import type { SamuSummary } from "~/queries/samu";

type Value = { cidade?: number; de?: number; ate?: number };

type SamuFiltersProps = {
  summary: SamuSummary;
  value: Value;
  onChange: (value: Value) => void;
  // The streets page needs one city; the overview also accepts all of Pernambuco.
  allowAllCities?: boolean;
};

const selectClass = "h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground";

// City and year range. The values live in the URL, so a view can be shared.
export function SamuFilters({ summary, value, onChange, allowAllCities = true }: SamuFiltersProps) {
  const years = summary.years.map((y) => y.year);
  const cities = [...summary.cities].sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
  const set = (patch: Value) => onChange({ ...value, ...patch });

  return (
    <div className="flex flex-wrap items-end gap-3 text-xs text-muted-foreground">
      <label className="flex flex-col gap-1">
        Cidade
        <select
          value={value.cidade ?? ""}
          onChange={(e) => set({ cidade: e.target.value ? Number(e.target.value) : undefined })}
          className={selectClass}
        >
          {allowAllCities && <option value="">Pernambuco inteiro</option>}
          {cities.map((c) => (
            <option key={c.ibge} value={c.ibge}>
              {c.name}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1">
        De
        <select value={value.de ?? ""} onChange={(e) => set({ de: e.target.value ? Number(e.target.value) : undefined })} className={selectClass}>
          <option value="">{years[0]}</option>
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1">
        Até
        <select value={value.ate ?? ""} onChange={(e) => set({ ate: e.target.value ? Number(e.target.value) : undefined })} className={selectClass}>
          <option value="">{years.at(-1)}</option>
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
