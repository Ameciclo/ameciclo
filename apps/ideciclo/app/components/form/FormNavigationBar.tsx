import { ChevronDown, ChevronRight, Eye, Lightbulb, Menu, Pin } from "lucide-react";
import { Button } from "@ameciclo/ui/components/button";
import type { CriterionCode, IdecicloRating } from "~/lib/ideciclo/form-types";
import { ANSWER_FILTERS, type FormViewState, REVIEW_FILTERS } from "./useFormViewState";

export const SECTION_NAV_ITEMS = [
  { id: "section-a", label: "Caracterização", tone: "a" },
  { id: "section-pavimento", label: "Cicloviário", tone: "e" },
  { id: "section-luz", label: "Urbanidade", tone: "d" },
  { id: "section-risco", label: "Risco", tone: "b" },
  { id: "section-medicoes", label: "Medições", tone: "a" },
  { id: "section-quadras", label: "Quadras", tone: "b" },
  { id: "section-intersecoes", label: "Interseções", tone: "c" },
  { id: "section-comentarios", label: "Comentários", tone: "e" },
] as const;

const SECTION_COLOR: Record<(typeof SECTION_NAV_ITEMS)[number]["id"], string> = {
  "section-a": "bg-[#f6d26d]",
  "section-pavimento": "bg-[#f4c4cc]",
  "section-luz": "bg-[#6cab73]",
  "section-risco": "bg-[#de6d57]",
  "section-medicoes": "bg-[#f6d26d]",
  "section-quadras": "bg-[#f4c4cc]",
  "section-intersecoes": "bg-[#70c3df]",
  "section-comentarios": "bg-[#f3df8a]",
};

export type CriterionNavItem = {
  code: CriterionCode;
  applicable: boolean;
  inAnalysis: boolean;
  answered: boolean;
  a1Pending: boolean;
  rating: IdecicloRating | null | undefined;
};

const criterionClassName = (item: CriterionNavItem) => {
  if (!item.applicable) return "border-slate-200 bg-slate-100 text-slate-400 opacity-45";
  if (item.inAnalysis) return "border-amber-300 bg-amber-100 text-amber-950 ring-2 ring-amber-300";
  if (item.a1Pending) return "border-amber-300 bg-amber-100 text-amber-950";
  if (!item.answered) return "border-rose-600 bg-rose-600 text-white";
  if (item.rating === "A") return "border-transparent bg-[#b8e5db] text-[#163b38]";
  if (item.rating === "B") return "border-transparent bg-[#9fd3cb] text-[#163b38]";
  if (item.rating === "C") return "border-transparent bg-[#8fafad] text-[#163b38]";
  if (item.rating === "D") return "border-transparent bg-[#748987] text-white";
  return "border-emerald-700 bg-emerald-700 text-white";
};

const toggleClassName = (on: boolean) =>
  on ? "border-slate-900 bg-slate-900 text-white hover:bg-slate-900/90" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50";

const pill = "h-8 rounded-full px-2.5 text-[11px] font-semibold";

type Props = {
  view: FormViewState;
  // The criteria that pass the filters.
  criteria: CriterionNavItem[];
  onSection: (sectionId: string) => void;
  onCriterion: (code: CriterionCode) => void;
};

// The bar pinned to the bottom of the form: jump to a section or a criterion
// (coloured by its rating), and the filters and view toggles.
export function FormNavigationBar({ view, criteria, onSection, onCriterion }: Props) {
  const answerFilter = ANSWER_FILTERS.find((item) => item.value === view.filter.answer) ?? ANSWER_FILTERS[0];
  const reviewFilter = REVIEW_FILTERS.find((item) => item.value === view.filter.review) ?? REVIEW_FILTERS[0];
  const bothFiltersOn = view.filter.answer !== "all" && view.filter.review !== "all";

  return (
    <div className="fixed inset-x-0 bottom-3 z-40 flex justify-center px-3">
      <div className="w-full max-w-5xl rounded-[24px] border border-slate-200 bg-white/95 p-3 shadow-2xl backdrop-blur">
        <div className="flex flex-col gap-3">
          {view.navigationVisible ? (
            <>
              <div className="overflow-x-auto">
                <div className="flex min-w-max items-center gap-2">
                  {SECTION_NAV_ITEMS.map((section) => (
                    <button
                      key={section.id}
                      type="button"
                      onClick={() => onSection(section.id)}
                      className={`h-8 rounded-full border border-transparent px-3 text-[11px] font-semibold text-slate-900 transition hover:brightness-[0.98] sm:text-xs ${SECTION_COLOR[section.id]}`}
                    >
                      {section.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="overflow-x-auto">
                <div className="flex min-w-max items-center gap-2">
                  {criteria.map((item) => (
                    <button
                      key={item.code}
                      type="button"
                      onClick={() => onCriterion(item.code)}
                      className={`flex h-9 min-w-[38px] items-center justify-center rounded-full border px-2.5 text-[11px] font-semibold transition sm:h-10 sm:min-w-[42px] sm:px-3 sm:text-xs ${criterionClassName(item)}`}
                    >
                      {item.code}
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : null}

          <div className="flex flex-wrap items-center justify-start gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              title={view.navigationVisible ? "Ocultar navegação" : "Mostrar navegação"}
              aria-pressed={view.navigationVisible}
              className={`size-8 rounded-full ${toggleClassName(view.navigationVisible)}`}
              onClick={view.toggleNavigation}
            >
              <Menu className="size-4" />
              <span className="sr-only">{view.navigationVisible ? "Ocultar navegação" : "Mostrar navegação"}</span>
            </Button>

            <Button type="button" variant="outline" size="sm" className={pill} onClick={view.toggleExpanded}>
              {view.expanded ? <ChevronDown className="size-3.5 sm:mr-1" /> : <ChevronRight className="size-3.5 sm:mr-1" />}
              <span className="hidden sm:inline">{view.expanded ? "Expandido" : "Colapsado"}</span>
              <span className="sr-only">{view.expanded ? "Expandido" : "Colapsado"}</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              className={`${pill} ${
                view.filter.answer === "answered"
                  ? "border-emerald-700 bg-emerald-700 text-white hover:bg-emerald-700/90"
                  : view.filter.answer === "unanswered"
                    ? "border-rose-600 bg-rose-600 text-white hover:bg-rose-600/90"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
              onClick={view.cycleAnswer}
              title={answerFilter?.label}
            >
              <span className="sm:hidden">{answerFilter?.compact}</span>
              <span className="hidden sm:inline">{answerFilter?.label}</span>
            </Button>

            {bothFiltersOn ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className={`${pill} ${
                  view.filter.mode === "or" ? "border-sky-600 bg-sky-600 text-white hover:bg-sky-600/90" : "border-violet-600 bg-violet-600 text-white hover:bg-violet-600/90"
                }`}
                onClick={view.toggleMode}
              >
                {view.filter.mode === "or" ? "OU" : "E"}
              </Button>
            ) : null}

            <Button
              type="button"
              variant="outline"
              size="sm"
              className={`${pill} ${
                view.filter.review === "analysis"
                  ? "border-amber-300 bg-amber-100 text-amber-950 hover:bg-amber-100/90"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
              onClick={view.cycleReview}
              title={reviewFilter?.label}
            >
              <Pin className={`size-3.5 sm:mr-1 ${view.filter.review === "analysis" ? "fill-current" : ""}`} />
              <span className="hidden sm:inline">{reviewFilter?.label}</span>
              <span className="sr-only sm:hidden">{reviewFilter?.label}</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              title={view.metaVisible ? "Ocultar barra de status dos itens" : "Mostrar barra de status dos itens"}
              aria-pressed={view.metaVisible}
              className={`${pill} ${toggleClassName(view.metaVisible)}`}
              onClick={view.toggleMeta}
            >
              <Eye className="size-4 sm:mr-1" />
              <span className="hidden sm:inline">{view.metaVisible ? "Barra de Itens ligada" : "Barra de Itens desligada"}</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              title={view.descriptionsVisible ? "Desligar ajudas" : "Ligar ajudas"}
              aria-pressed={view.descriptionsVisible}
              className={`${pill} ${toggleClassName(view.descriptionsVisible)}`}
              onClick={view.toggleDescriptions}
            >
              <Lightbulb className={`size-4 sm:mr-1 ${view.descriptionsVisible ? "fill-current" : ""}`} />
              <span className="hidden sm:inline">{view.descriptionsVisible ? "Ajuda ligada" : "Ajuda desligada"}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
