import { Eye, EyeOff, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@ameciclo/ui/components/badge';
import { Checkbox } from '@ameciclo/ui/components/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@ameciclo/ui/components/collapsible';
import { GROUPS, type LayerGroup, type LayerOption } from './layerCatalog';
import type { LayerSelection } from './hooks/useLayerSelection';

// O painel de camadas: cada grupo abre e fecha, cada opção liga e desliga uma camada do mapa. É um conjunto de
// caixas de seleção de verdade (teclado, foco e leitor de tela vêm do Radix).

// A amostra do traço de cada camada, como aparece no mapa.
function Swatch({ option, group }: { option: LayerOption; group: LayerGroup['id'] }) {
  if (!option.color) return null;
  if (group === 'pdc') {
    const dash = option.pattern === 'parallel-dashed' ? 'dashed' : option.pattern === 'parallel-orange-dashed' ? 'dashed' : option.pattern === 'striped' ? 'dotted' : 'solid';
    return (
      <span className="flex w-10 shrink-0 flex-col gap-0.5" aria-hidden="true">
        <span className="border-t-2" style={{ borderTopStyle: dash, borderColor: option.color }} />
        <span className="border-t-2" style={{ borderTopStyle: dash, borderColor: option.color }} />
      </span>
    );
  }
  const striped = option.pattern === 'arrows';
  return (
    <span
      className="h-1 w-10 shrink-0 rounded-full"
      style={{ background: striped ? `repeating-linear-gradient(90deg, #EF4444 0 4px, ${option.color} 4px 8px)` : option.color }}
      aria-hidden="true"
    />
  );
}

function Group({ group, selection }: { group: LayerGroup; selection: LayerSelection }) {
  const [open, setOpen] = useState(!group.comingSoon);
  const Icon = group.icon;
  const on = group.options.filter((o) => selection.isOn(group.id, o.name)).length;

  return (
    <Collapsible open={open && !group.comingSoon} onOpenChange={setOpen} className="rounded-lg border bg-white">
      <div className="flex items-center gap-1 pr-1">
        <CollapsibleTrigger
          disabled={group.comingSoon}
          className="flex min-w-0 flex-1 items-center gap-2 rounded-lg p-2.5 text-left text-sm font-medium text-gray-800 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-default disabled:text-gray-400"
        >
          <Icon className="size-4 shrink-0" aria-hidden="true" />
          <span className="min-w-0 flex-1">{group.title}</span>
          {group.comingSoon ? (
            <Badge variant="secondary">Em breve</Badge>
          ) : (
            <ChevronDown className={`size-4 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
          )}
        </CollapsibleTrigger>
        {!group.comingSoon && (
          <button
            type="button"
            onClick={() => selection.setAll(on < group.options.length, group.id)}
            className="rounded-sm p-1 text-gray-500 hover:text-gray-900"
            aria-label={on > 0 ? `Ocultar tudo em ${group.title}` : `Exibir tudo em ${group.title}`}
            title={on > 0 ? 'Ocultar tudo' : 'Exibir tudo'}
          >
            {on > 0 ? <Eye className="size-4 text-teal-600" aria-hidden="true" /> : <EyeOff className="size-4" aria-hidden="true" />}
          </button>
        )}
      </div>
      <CollapsibleContent>
        <ul className="space-y-0.5 px-2.5 pb-2.5">
          {group.options.map((option) => {
            const checkboxId = `camada-${group.id}-${option.name}`;
            return (
              <li key={option.name}>
                <label htmlFor={checkboxId} className="flex cursor-pointer items-center gap-2 rounded-md px-1.5 py-1.5 text-sm text-gray-700 hover:bg-gray-50">
                  <Checkbox id={checkboxId} checked={selection.isOn(group.id, option.name)} onCheckedChange={() => selection.toggle(group.id, option.name)} />
                  <span className="min-w-0 flex-1">{group.id === 'perfil' ? `Edição ${option.name}` : option.name}</span>
                  <Swatch option={option} group={group.id} />
                </label>
              </li>
            );
          })}
        </ul>
      </CollapsibleContent>
    </Collapsible>
  );
}

export function LeftSidebar({ selection }: { selection: LayerSelection }) {
  const { sidebarOpen: isOpen, setSidebarOpen, allOn, setAll } = selection;

  return (
    <aside
      className={`flex shrink-0 flex-col overflow-hidden border-r bg-gray-50 transition-all duration-300 ${isOpen ? 'w-72' : 'w-0'}`}
      style={{ height: '100%' }}
      aria-label="Camadas de dados"
    >
      <div className="flex shrink-0 items-center justify-between border-b border-gray-200 p-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="rounded p-1 hover:bg-gray-200"
            aria-label="Minimizar o painel de camadas"
            aria-expanded={isOpen}
          >
            <ChevronLeft className="size-4" aria-hidden="true" />
          </button>
          <h2 className="font-semibold text-gray-800">Camadas de dados</h2>
        </div>
        <button
          type="button"
          onClick={() => setAll(!allOn)}
          className="rounded-sm p-1 hover:bg-gray-200"
          aria-label={allOn ? 'Ocultar todas as camadas do mapa' : 'Exibir todas as camadas no mapa'}
          title={allOn ? 'Ocultar todas as camadas' : 'Exibir todas as camadas'}
        >
          {allOn ? <Eye className="size-4 text-teal-600" aria-hidden="true" /> : <EyeOff className="size-4 text-gray-400" aria-hidden="true" />}
        </button>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto p-3">
        {GROUPS.map((group) => (
          <Group key={group.id} group={group} selection={selection} />
        ))}
      </div>

      {!isOpen && (
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="fixed left-2 top-1/2 z-60 -translate-y-1/2 rounded-full border-2 border-blue-500 bg-blue-500 p-3 shadow-xl hover:bg-blue-600 md:left-4 md:bg-white md:p-2 md:hover:bg-gray-100"
          aria-label="Expandir o painel de camadas"
          aria-expanded="false"
        >
          <ChevronRight className="size-6 text-white md:size-4 md:text-gray-700" aria-hidden="true" />
        </button>
      )}
    </aside>
  );
}
