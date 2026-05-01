import { useState } from "react";
import { Check, ChevronsUpDown, MapPin } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";
import { cn } from "~/lib/utils";

export type LocationOption = {
  id: number | string;
  name: string;
  city?: string;
};

type Props = {
  options: LocationOption[];
  value: number | string | null;
  onChange: (id: number | string | null) => void;
  placeholder?: string;
  disabled?: boolean;
};

export function LocationCombobox({
  options,
  value,
  onChange,
  placeholder = "Selecione um ponto de contagem...",
  disabled,
}: Props) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => String(o.id) === String(value));

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className="w-full justify-between font-normal"
        >
          {selected ? (
            <span className="flex items-center gap-2 truncate">
              <MapPin className="size-4 text-muted-foreground shrink-0" />
              <span className="truncate">{selected.name}</span>
              {selected.city && (
                <span className="text-xs text-muted-foreground">— {selected.city}</span>
              )}
            </span>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="size-4 opacity-50 shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[var(--radix-popover-trigger-width)]" align="start">
        <Command>
          <CommandInput placeholder="Buscar ponto..." />
          <CommandList>
            <CommandEmpty>Nenhum ponto encontrado.</CommandEmpty>
            <CommandGroup>
              {options.map((opt) => {
                const isSelected = String(opt.id) === String(value);
                return (
                  <CommandItem
                    key={opt.id}
                    value={`${opt.name} ${opt.city ?? ""}`}
                    onSelect={() => {
                      onChange(isSelected ? null : opt.id);
                      setOpen(false);
                    }}
                  >
                    <Check className={cn("size-4", isSelected ? "opacity-100" : "opacity-0")} />
                    <div className="flex flex-col min-w-0">
                      <span className="truncate">{opt.name}</span>
                      {opt.city && (
                        <span className="text-xs text-muted-foreground truncate">{opt.city}</span>
                      )}
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
