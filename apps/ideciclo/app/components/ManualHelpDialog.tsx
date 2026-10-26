import { HelpCircle } from "lucide-react";
import { Button } from "@ameciclo/ui/components/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@ameciclo/ui/components/dialog";
import { MANUAL_HELP_MAP } from "~/data/manualHelp";

// Opens the manual pages that explain a criterion.
export function ManualHelpDialog({ helpKey, compact = false }: { helpKey: string; compact?: boolean }) {
  const entry = MANUAL_HELP_MAP[helpKey];
  if (!entry) return null;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size={compact ? "icon" : "sm"} className={compact ? "h-8 w-8" : ""} onClick={(event) => event.stopPropagation()}>
          <HelpCircle className="h-4 w-4" />
          <span className="sr-only">Ajuda do manual</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] max-w-5xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{entry.title}</DialogTitle>
          <DialogDescription>
            {entry.description} Páginas do manual: {entry.pages.join(", ")}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {entry.imagePaths.map((path, index) => (
            <div key={path} className="rounded-xl border bg-slate-50 p-3">
              <div className="mb-2 text-sm font-medium text-slate-700">Página {entry.pages[index]}</div>
              <img src={path} alt={`Manual IDECICLO página ${entry.pages[index]}`} className="w-full rounded-lg border bg-white" />
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
