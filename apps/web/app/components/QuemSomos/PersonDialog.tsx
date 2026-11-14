import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@ameciclo/ui/components/dialog";
import type { Ameciclista } from "~/queries/quemsomos";
import { Avatar } from "./Avatar";
import { roleLabel } from "./roles";

interface PersonDialogProps {
  person: Ameciclista | undefined;
  onClose: () => void;
}

export function PersonDialog({ person, onClose }: PersonDialogProps) {
  return (
    <Dialog open={Boolean(person)} onOpenChange={(open) => !open && onClose()}>
      {person && (
        <DialogContent className="max-w-lg overflow-y-auto">
          <DialogHeader className="items-center text-center">
            <Avatar person={person} className="mb-2 size-40 rounded-full" eager />
            <DialogTitle className="text-2xl">{person.name}</DialogTitle>
            <DialogDescription>{roleLabel(person)}</DialogDescription>
          </DialogHeader>
          {person.bio && (
            <p className="whitespace-pre-line text-sm leading-relaxed text-gray-700">{person.bio}</p>
          )}
        </DialogContent>
      )}
    </Dialog>
  );
}
