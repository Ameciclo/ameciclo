import { Fragment } from "react";
import { HorizontalScrollIndicators } from "./HorizontalScrollIndicators";

const chipClassName = (isActive: boolean, isComplete: boolean) => {
  const base = isComplete
    ? isActive
      ? "border-emerald-700 bg-emerald-700 text-white"
      : "border-emerald-200 bg-emerald-50/85 text-emerald-800 hover:bg-emerald-100"
    : isActive
      ? "border-rose-600 bg-rose-600 text-white"
      : "border-rose-200 bg-rose-50/85 text-rose-800 hover:bg-rose-100";
  return `${base} ${isActive ? "ring-2 ring-slate-900 ring-offset-1" : ""}`;
};

const stepButton = "flex size-9 items-center justify-center rounded-full border border-slate-200 bg-white text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40";

type Props = {
  title: string;
  // "Q" for blocks (quadras), "I" for intersections.
  prefix: string;
  count: number;
  currentIndex: number;
  completion: boolean[];
  onSelect: (index: number) => void;
  showTitle: boolean;
  editable: boolean;
  onAdd: () => void;
  onRemove: () => void;
  minCount: number;
};

// The pills that move between blocks or intersections, red until the item has
// all its answers. With editing on, the active item gains − and + around it.
export function IndexedPager({ title, prefix, count, currentIndex, completion, onSelect, showTitle, editable, onAdd, onRemove, minCount }: Props) {
  return (
    <div className="sticky top-24 z-20 -mx-1 px-1">
      <div className="rounded-[24px] border border-slate-200 bg-white/95 p-3 shadow-sm backdrop-blur">
        <div className="mb-2 flex items-center justify-between gap-3">
          {showTitle ? <div className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">{title}</div> : <div />}
        </div>
        <HorizontalScrollIndicators>
          <div className="flex min-w-max items-center gap-2">
            {editable && count === 0 ? (
              <button type="button" onClick={onAdd} className={stepButton} title="Adicionar">
                +
              </button>
            ) : null}
            {Array.from({ length: count }, (_, index) => {
              const isActive = index === currentIndex;
              return (
                <Fragment key={`${prefix}-${index + 1}`}>
                  {editable && isActive ? (
                    <button type="button" onClick={onRemove} disabled={count <= minCount} className={stepButton}>
                      −
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => onSelect(index)}
                    className={`flex h-9 min-w-[38px] items-center justify-center rounded-full border px-2.5 text-[11px] font-semibold transition sm:h-10 sm:min-w-[42px] sm:px-3 sm:text-xs ${chipClassName(isActive, completion[index] ?? false)}`}
                  >
                    {prefix}
                    {index + 1}
                  </button>
                  {editable && isActive ? (
                    <button type="button" onClick={onAdd} className={stepButton}>
                      +
                    </button>
                  ) : null}
                </Fragment>
              );
            })}
          </div>
        </HorizontalScrollIndicators>
      </div>
    </div>
  );
}
