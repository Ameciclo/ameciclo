import type { ReactNode } from "react";

// Um bloco do explorador: título, nota opcional e o conteúdo.
export function Block({ title, note, children }: { title: string; note?: string; children: ReactNode }) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      {note && <p className="mb-3 text-sm text-gray-500">{note}</p>}
      <div className={note ? "" : "mt-3"}>{children}</div>
    </div>
  );
}
