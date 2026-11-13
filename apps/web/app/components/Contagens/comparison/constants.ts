// Limits of a comparison. Change them here only: every component reads these.
export const MIN_COMPARE = 2;
export const MAX_COMPARE = 5;

// One palette, used by chips, chart series, map markers and table columns, so the same
// count has the same color everywhere. Picked from the Okabe-Ito set (color-blind safe).
// Tailwind needs the class names spelled out in full, hence the repetition.
export const COMPARE_COLORS = [
  { hex: "#0072B2", bg: "bg-sky-50", border: "border-sky-200", text: "text-sky-800", accent: "bg-[#0072B2]" },
  { hex: "#E69F00", bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-800", accent: "bg-[#E69F00]" },
  { hex: "#009E73", bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-800", accent: "bg-[#009E73]" },
  { hex: "#CC79A7", bg: "bg-pink-50", border: "border-pink-200", text: "text-pink-800", accent: "bg-[#CC79A7]" },
  { hex: "#7C3AED", bg: "bg-violet-50", border: "border-violet-200", text: "text-violet-800", accent: "bg-[#7C3AED]" },
] satisfies { hex: string; bg: string; border: string; text: string; accent: string }[];

export const colorAt = (index: number) => COMPARE_COLORS[index % COMPARE_COLORS.length];

// From this many counts on, cards give way to a metrics table.
export const TABLE_FROM = 4;
