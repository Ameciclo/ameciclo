import type { Option } from "~/queries/infra";

// A short list of options with checkboxes, for choosing several of them.
export function CheckList({
  options,
  selected,
  onChange,
  legend,
}: {
  options: Option[];
  selected: number[];
  onChange: (ids: number[]) => void;
  legend: string;
}) {
  return (
    <fieldset className="space-y-2">
      <legend className="text-sm text-muted-foreground">{legend}</legend>
      <div className="grid max-h-56 gap-1 overflow-y-auto rounded-md border bg-background p-2 text-sm">
        {options.map((o) => (
          <label key={o.id} className="flex cursor-pointer items-center gap-2 rounded px-1 py-0.5 hover:bg-accent">
            <input
              type="checkbox"
              checked={selected.includes(o.id)}
              onChange={(e) => onChange(e.target.checked ? [...selected, o.id] : selected.filter((id) => id !== o.id))}
            />
            {o.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
