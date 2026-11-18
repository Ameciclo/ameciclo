import { useRef, useState } from 'react';
import { LIVE_GROUPS, type LayerGroupId } from '../layerCatalog';

// O que está ligado no painel de camadas. Tudo começa ligado; o que o usuário desliga vai para a URL (`?off=`, ids
// "grupo:opção" separados por "~"), então o link compartilhado mostra o mesmo mapa. O estado nasce da URL e é escrito de
// volta no próprio clique: nada de efeito depois da renderização, nem armazenamento no navegador.

const SEPARATOR = '~';
const id = (group: LayerGroupId, option: string) => `${group}:${option}`;

function readOff(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  const raw = new URLSearchParams(window.location.search).get('off') ?? '';
  return new Set(raw.split(SEPARATOR).filter(Boolean));
}

function writeOff(off: Set<string>) {
  const url = new URL(window.location.href);
  if (off.size > 0) url.searchParams.set('off', [...off].join(SEPARATOR));
  else url.searchParams.delete('off');
  window.history.replaceState({}, '', url.toString());
}

export type LayerSelection = ReturnType<typeof useLayerSelection>;

export function useLayerSelection() {
  const [off, setOff] = useState(readOff);
  // O conjunto mais recente, para dois cliques seguidos antes da próxima renderização não se sobrescreverem.
  const latest = useRef(off);
  const [sidebarOpen, setSidebarOpen] = useState(() => typeof window === 'undefined' || window.innerWidth >= 768);

  const update = (next: Set<string>) => {
    latest.current = next;
    setOff(next);
    writeOff(next);
  };

  const selected = (group: LayerGroupId) => (LIVE_GROUPS.find((g) => g.id === group)?.options ?? []).map((o) => o.name).filter((name) => !off.has(id(group, name)));
  const isOn = (group: LayerGroupId, option: string) => !off.has(id(group, option));

  const toggle = (group: LayerGroupId, option: string) => {
    const next = new Set(latest.current);
    if (!next.delete(id(group, option))) next.add(id(group, option));
    update(next);
  };

  // Liga ou desliga todas as opções de um grupo (ou de todos, sem `group`).
  const setAll = (on: boolean, group?: LayerGroupId) => {
    const next = new Set(latest.current);
    for (const g of LIVE_GROUPS.filter((g) => !group || g.id === group)) {
      for (const o of g.options) {
        if (on) next.delete(id(g.id, o.name));
        else next.add(id(g.id, o.name));
      }
    }
    update(next);
  };

  const allOn = LIVE_GROUPS.every((g) => g.options.every((o) => !off.has(id(g.id, o.name))));

  return { sidebarOpen, setSidebarOpen, selected, isOn, toggle, setAll, allOn };
}
