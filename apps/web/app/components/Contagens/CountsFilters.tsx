import { Download } from "lucide-react";
import { Checkbox } from "@ameciclo/ui/components/checkbox";
import { Label } from "@ameciclo/ui/components/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@ameciclo/ui/components/select";

const ALL_YEARS = "todos";

type CountsFiltersProps = {
  years: number[];
  year: number | undefined;
  completeOnly: boolean;
  onYearChange: (year: number | undefined) => void;
  onCompleteOnlyChange: (completeOnly: boolean) => void;
};

// The filters that live in the page URL (`ano`, `completas`), shown at the start of the table toolbar.
export function CountsFilters({ years, year, completeOnly, onYearChange, onCompleteOnlyChange }: CountsFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
      <div className="flex items-center gap-2">
        <Label htmlFor="filtro-ano" className="text-muted-foreground">
          Ano
        </Label>
        <Select
          value={year === undefined ? ALL_YEARS : String(year)}
          onValueChange={(value) => onYearChange(value === ALL_YEARS ? undefined : Number(value))}
        >
          <SelectTrigger id="filtro-ano" className="w-28 bg-background">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="theme-ameciclo">
            <SelectItem value={ALL_YEARS}>Todos</SelectItem>
            {years.map((y) => (
              <SelectItem key={y} value={String(y)}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox
          id="filtro-completas"
          checked={completeOnly}
          onCheckedChange={(checked) => onCompleteOnlyChange(checked === true)}
        />
        <Label htmlFor="filtro-completas" className="cursor-pointer">
          Ocultar contagens estimadas e parciais
        </Label>
      </div>
    </div>
  );
}

export function CsvLink() {
  return (
    <a
      className="inline-flex items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      href="/api/contagens/csv"
      download
    >
      <Download className="size-4" aria-hidden />
      Baixar todas as contagens (CSV)
    </a>
  );
}
