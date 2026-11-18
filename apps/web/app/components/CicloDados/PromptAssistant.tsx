import { Check, Copy } from 'lucide-react';
import { useState } from 'react';
import type { PointInfo } from '@ameciclo/db';
import { Checkbox } from '@ameciclo/ui/components/checkbox';
import { Label } from '@ameciclo/ui/components/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@ameciclo/ui/components/select';
import { Textarea } from '@ameciclo/ui/components/textarea';
import { buildPrompt, categoryData, TEMPLATES, type Choice, type PromptCount, type PromptInput } from './prompt';

// O assistente de documentos do popup: a pessoa escolhe o tipo de documento, o objetivo, o público e o tom, marca quais dados
// do ponto entram, e copia o pedido pronto para uma IA de texto. Só aparecem as categorias em que o ponto tem dado de verdade.

function Pick({ label, value, onChange, choices }: { label: string; value: string; onChange: (id: string) => void; choices: Choice[] }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="z-[60]">
          {choices.map((choice) => (
            <SelectItem key={choice.id} value={choice.id}>
              {choice.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

const OPTION_LABELS: [keyof PromptInput['options'], string][] = [
  ['tables', 'Incluir tabelas'],
  ['recommendations', 'Incluir recomendações'],
  ['legal', 'Incluir fundamentação legal'],
  ['limitations', 'Informar limitações dos dados'],
];

export function PromptAssistant({ info, counts, lat, lng, radius }: { info: PointInfo; counts: PromptCount[]; lat: number; lng: number; radius: number }) {
  const available = TEMPLATES.dataCategories.filter((c) => categoryData(c.id, info, counts) !== null);
  const [documentType, setDocumentType] = useState('nota_tecnica');
  const [objective, setObjective] = useState('analisar');
  const [audience, setAudience] = useState('prefeitura');
  const [tone, setTone] = useState('tecnico');
  const [size, setSize] = useState('medium');
  const [chosen, setChosen] = useState<Set<string>>(() => new Set(available.map((c) => c.id)));
  const [options, setOptions] = useState({ tables: true, recommendations: true, legal: false, limitations: true });
  const [notes, setNotes] = useState('');
  const [copied, setCopied] = useState(false);

  const street = info.location.nearest_street.official_name || info.location.nearest_street.name || 'o local selecionado';
  const input: PromptInput = {
    documentType,
    objective,
    audience,
    tone,
    size,
    categories: available.filter((c) => chosen.has(c.id)).map((c) => c.id),
    options,
    notes,
    place: { street, city: 'Recife', lat, lng, radius },
  };
  const prompt = buildPrompt(input, info, counts);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Sem acesso à área de transferência: o texto continua visível para copiar à mão.
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Monte um pedido para uma IA de texto escrever um documento com os dados deste ponto. A IA só recebe os números abaixo; confira o texto final antes de usar.
      </p>

      <div className="grid gap-3 md:grid-cols-2">
        <Pick label="Tipo de documento" value={documentType} onChange={setDocumentType} choices={TEMPLATES.documentTypes} />
        <Pick label="Objetivo" value={objective} onChange={setObjective} choices={TEMPLATES.quickObjectives} />
        <Pick label="Público-alvo" value={audience} onChange={setAudience} choices={TEMPLATES.audiences} />
        <Pick label="Tom" value={tone} onChange={setTone} choices={TEMPLATES.tones} />
        <Pick label="Tamanho" value={size} onChange={setSize} choices={TEMPLATES.docSizes} />
      </div>

      <fieldset className="space-y-2">
        <legend className="mb-1 text-xs text-muted-foreground">Dados que entram no documento</legend>
        {available.length === 0 && <p className="text-sm text-muted-foreground">Não há dados da Ameciclo neste ponto para incluir.</p>}
        {available.map((category) => {
          const data = categoryData(category.id, info, counts);
          const id = `prompt-categoria-${category.id}`;
          return (
            <div key={category.id} className="flex items-start gap-2">
              <Checkbox
                id={id}
                checked={chosen.has(category.id)}
                onCheckedChange={() =>
                  setChosen((prev) => {
                    const next = new Set(prev);
                    if (!next.delete(category.id)) next.add(category.id);
                    return next;
                  })
                }
                className="mt-0.5"
              />
              <Label htmlFor={id} className="flex-col items-start gap-0 text-sm font-normal">
                <span className="font-medium">{category.label}</span>
                <span className="text-xs text-muted-foreground">{data?.summary}</span>
              </Label>
            </div>
          );
        })}
      </fieldset>

      <fieldset className="grid gap-2 md:grid-cols-2">
        <legend className="mb-1 text-xs text-muted-foreground">O que incluir</legend>
        {OPTION_LABELS.map(([key, text]) => {
          const id = `prompt-opcao-${key}`;
          return (
            <div key={key} className="flex items-center gap-2">
              <Checkbox id={id} checked={options[key]} onCheckedChange={(checked) => setOptions((prev) => ({ ...prev, [key]: checked === true }))} />
              <Label htmlFor={id} className="text-sm font-normal">
                {text}
              </Label>
            </div>
          );
        })}
      </fieldset>

      <div className="space-y-1.5">
        <Label htmlFor="prompt-notas" className="text-xs text-muted-foreground">
          Contexto adicional (opcional)
        </Label>
        <Textarea id="prompt-notas" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Ex.: a quem o documento se dirige, o que já foi pedido antes…" rows={2} />
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="prompt-texto" className="text-xs text-muted-foreground">
            Pedido pronto
          </Label>
          <button
            type="button"
            onClick={copy}
            className="inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-medium hover:bg-muted"
          >
            {copied ? <Check className="size-4 text-green-600" aria-hidden="true" /> : <Copy className="size-4" aria-hidden="true" />}
            {copied ? 'Copiado' : 'Copiar'}
          </button>
        </div>
        <Textarea id="prompt-texto" value={prompt} readOnly rows={12} className="font-mono text-xs" />
      </div>
    </div>
  );
}
