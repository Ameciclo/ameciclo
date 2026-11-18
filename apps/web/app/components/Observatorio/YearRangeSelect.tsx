// "De" e "Até": o intervalo de anos do explorador. Os anos parciais (a fonte não tem todos os meses) levam um asterisco.
interface Props {
  years: number[];
  partial?: number[];
  from: number;
  to: number;
  onChange: (range: { from: number; to: number }) => void;
}

export function YearRangeSelect({ years, partial = [], from, to, onChange }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <Select label="De" value={from} years={years} partial={partial} onChange={(y) => onChange({ from: y, to: Math.max(y, to) })} />
      <Select label="Até" value={to} years={years} partial={partial} onChange={(y) => onChange({ from: Math.min(from, y), to: y })} />
    </div>
  );
}

function Select({ label, value, years, partial, onChange }: { label: string; value: number; years: number[]; partial: number[]; onChange: (y: number) => void }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs uppercase tracking-wide text-gray-500">{label}</span>
      <select value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm">
        {years.map((y) => (
          <option key={y} value={y}>{partial.includes(y) ? `${y}*` : y}</option>
        ))}
      </select>
    </label>
  );
}
