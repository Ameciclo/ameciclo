import { Badge } from "@ameciclo/ui/components/badge";
import { CLASSIFICATION_LABEL, type Classification, type SegmentType } from "~/lib/osm/types";
import { HIERARCHY_BADGE, SEGMENT_TYPE_COLOR, UNCLASSIFIED_BADGE } from "~/lib/segment-styles";

export function TypeBadge({ type }: { type: SegmentType }) {
  return (
    <Badge className="border-transparent text-slate-900" style={{ backgroundColor: SEGMENT_TYPE_COLOR[type] }}>
      {type}
    </Badge>
  );
}

export function HierarchyBadge({ classification }: { classification: Classification | null }) {
  return (
    <Badge variant="outline" className={classification ? HIERARCHY_BADGE[classification] : UNCLASSIFIED_BADGE}>
      {classification ? CLASSIFICATION_LABEL[classification] : "Não classificada"}
    </Badge>
  );
}
