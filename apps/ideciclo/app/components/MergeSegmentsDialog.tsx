import { useState } from "react";
import { Button } from "@ameciclo/ui/components/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@ameciclo/ui/components/dialog";
import { Input } from "@ameciclo/ui/components/input";
import { Label } from "@ameciclo/ui/components/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@ameciclo/ui/components/select";
import { CLASSIFICATION_LABEL, CLASSIFICATIONS, type Classification, isClassification, isSegmentType, SEGMENT_TYPES, type SegmentType } from "~/lib/osm/types";
import { formatKm } from "~/lib/segment-styles";
import type { SegmentItem } from "~/queries/assessment";

const NO_CLASSIFICATION = "none";

type Props = {
  segments: SegmentItem[];
  pending: boolean;
  error: string | null;
  onConfirm: (name: string, type: SegmentType, classification: Classification | null) => void;
  onClose: () => void;
};

const unique = <T,>(values: T[]) => [...new Set(values)];

// Opened with the selection, so the proposed name, type and hierarchy are
// computed once from it when it mounts.
export function MergeSegmentsDialog({ segments, pending, error, onConfirm, onClose }: Props) {
  const types = unique(segments.map((s) => s.type));
  const classifications = unique(segments.map((s) => s.classification));

  const [name, setName] = useState(unique(segments.map((s) => s.name)).join(" / "));
  const [type, setType] = useState<SegmentType>(types.length === 1 && types[0] ? types[0] : "Ciclofaixa");
  const [classification, setClassification] = useState<Classification | null>(classifications.length === 1 ? (classifications[0] ?? null) : null);

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Mesclar segmentos</DialogTitle>
          <DialogDescription>Defina o nome, a tipologia e a hierarquia do trecho mesclado.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="space-y-1">
            <Label htmlFor="merge-name">Nome</Label>
            <Input id="merge-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="text-sm">
            <p className="font-semibold">{formatKm(segments.reduce((sum, s) => sum + s.km, 0))} km</p>
            <p className="text-xs text-muted-foreground">Soma da extensão dos {segments.length} segmentos selecionados</p>
          </div>
          <div className="space-y-1">
            <Label>Tipologia{types.length > 1 && " (os segmentos têm tipologias diferentes)"}</Label>
            <Select value={type} onValueChange={(value) => isSegmentType(value) && setType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SEGMENT_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Hierarquia da via{classifications.length > 1 && " (os segmentos têm hierarquias diferentes)"}</Label>
            <Select value={classification ?? NO_CLASSIFICATION} onValueChange={(value) => setClassification(isClassification(value) ? value : null)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_CLASSIFICATION}>Não classificada</SelectItem>
                {CLASSIFICATIONS.map((c) => (
                  <SelectItem key={c} value={c}>
                    {CLASSIFICATION_LABEL[c]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={pending}>
            Cancelar
          </Button>
          <Button onClick={() => onConfirm(name, type, classification)} disabled={pending || !name.trim()}>
            {pending ? "Mesclando…" : "Mesclar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
