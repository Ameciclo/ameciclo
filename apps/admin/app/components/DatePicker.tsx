import { useState } from "react";
import { CalendarIcon } from "lucide-react";
import { ptBR } from "react-day-picker/locale";
import { Button } from "@ameciclo/ui/components/button";
import { Calendar } from "@ameciclo/ui/components/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@ameciclo/ui/components/popover";

const display = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });

const toDate = (iso: string) => {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : undefined;
};

const toIso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

// ISO date string in and out ("2026-03-25"), so it plugs into the document directly.
export function DatePicker({ id, value, onChange }: { id: string; value: string; onChange: (iso: string) => void }) {
  const [open, setOpen] = useState(false);
  const selected = toDate(value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button id={id} variant="outline" className="w-full justify-start font-normal">
          <CalendarIcon className="size-4" />
          {selected ? display.format(selected) : <span className="text-muted-foreground">Selecione a data</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <Calendar
          mode="single"
          locale={ptBR}
          selected={selected}
          defaultMonth={selected}
          onSelect={(d) => {
            if (d) {
              onChange(toIso(d));
              setOpen(false);
            }
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
