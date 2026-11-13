import { CompareCheckbox } from "./CompareCheckbox";
import { CompareLink } from "./CompareLink";
import type { CompareItem } from "./selection";

// Cell of the "compare with others" table: the checkbox, plus a shortcut that compares
// the count on screen with just this one.
export function CompareOtherCell({ item, firstSlug }: { item: CompareItem; firstSlug: string }) {
  return (
    <span className="flex items-center gap-3">
      <CompareCheckbox item={item} />
      <CompareLink slugs={[firstSlug, item.slug]} className="text-sm text-ameciclo hover:underline">
        Comparar só estas 2
      </CompareLink>
    </span>
  );
}
