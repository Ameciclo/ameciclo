import type { ReactNode } from "react";

export type Highlight = { lead: string; text: ReactNode };

// "Em destaque": frases curtas, cada uma com o número que a sustenta. Aceita itens `false`, `undefined` ou `null`
// (o resultado de `condição && { … }`), para que uma frase que não vale para o filtro atual simplesmente saia da lista.
export function Highlights({ items }: { items: (Highlight | false | null | undefined)[] }) {
  const shown = items.filter((h) => h !== false && h !== null && h !== undefined);
  if (shown.length === 0) return null;
  return (
    <ul className="grid grid-cols-1 gap-x-8 gap-y-5 md:grid-cols-3">
      {shown.map((h) => (
        <li key={h.lead + String(h.text)} className="border-t border-gray-200 pt-3 leading-snug text-gray-800">
          <span className="block text-2xl font-bold tabular-nums text-gray-900">{h.lead}</span>
          {h.text}
        </li>
      ))}
    </ul>
  );
}
