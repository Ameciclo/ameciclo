import { ChevronLeft, ChevronRight } from "lucide-react";
import { type ReactNode, useState } from "react";

// A horizontally scrolling row with a fading arrow on each side that still has
// content hidden. Measured from the ref and on scroll, so no effect is needed.
export function HorizontalScrollIndicators({ children, viewportClassName }: { children: ReactNode; viewportClassName?: string }) {
  const [edges, setEdges] = useState({ left: false, right: false });

  const measure = (element: HTMLDivElement) => {
    const left = element.scrollLeft > 4;
    const right = element.scrollWidth - element.clientWidth - element.scrollLeft > 4;
    setEdges((current) => (current.left === left && current.right === right ? current : { left, right }));
  };

  return (
    <div className="relative">
      {edges.left ? (
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 flex w-10 items-center justify-start bg-gradient-to-r from-white/95 via-white/80 to-transparent pl-1">
          <div className="rounded-full border border-slate-200 bg-white/95 p-1 shadow-sm">
            <ChevronLeft className="size-3.5 text-slate-500" />
          </div>
        </div>
      ) : null}
      {edges.right ? (
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 flex w-10 items-center justify-end bg-gradient-to-l from-white/95 via-white/80 to-transparent pr-1">
          <div className="rounded-full border border-slate-200 bg-white/95 p-1 shadow-sm">
            <ChevronRight className="size-3.5 text-slate-500" />
          </div>
        </div>
      ) : null}
      <div
        ref={(element) => {
          if (element) measure(element);
        }}
        onScroll={(event) => measure(event.currentTarget)}
        className={viewportClassName ?? "overflow-x-auto"}
      >
        {children}
      </div>
    </div>
  );
}
