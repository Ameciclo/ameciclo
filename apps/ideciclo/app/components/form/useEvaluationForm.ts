import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRef, useState, useSyncExternalStore } from "react";
import { getA1Decision, getScoreBreakdown } from "~/lib/ideciclo/assessment";
import { clearDraft, loadDraft, saveDraft } from "~/lib/ideciclo/drafts";
import {
  buildInitialFormData,
  buildOsmFieldDifferences,
  mapFormTypologyToSegmentType,
  normalizeEvaluationCounts,
  StoredFormSchema,
  toSegmentFormContext,
} from "~/lib/ideciclo/form-data";
import type { IdecicloFormData } from "~/lib/ideciclo/form-types";
import { type FormContext, saveForm } from "~/queries/forms";

const subscribeOnline = (notify: () => void) => {
  window.addEventListener("online", notify);
  window.addEventListener("offline", notify);
  return () => {
    window.removeEventListener("online", notify);
    window.removeEventListener("offline", notify);
  };
};

export const useIsOnline = () =>
  useSyncExternalStore(
    subscribeOnline,
    () => navigator.onLine,
    () => true,
  );

/**
 * The evaluation's answers, their score, the local draft and the submit.
 * The latest answers also live in a ref so two changes in the same tick
 * (a radio click that fires two handlers) do not overwrite each other.
 */
export function useEvaluationForm(context: FormContext) {
  const segment = toSegmentFormContext(context.segment);
  const isOnline = useIsOnline();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<IdecicloFormData>(() => {
    const draft = loadDraft(context.segment.id);
    const stored = context.form?.responses ? StoredFormSchema.safeParse(JSON.parse(context.form.responses)) : null;
    return buildInitialFormData({
      segment,
      cityName: context.city.name,
      stored: stored?.success ? stored.data : null,
      draft: draft?.data ?? null,
    });
  });
  const latest = useRef(formData);
  const [lastLocalSaveAt, setLastLocalSaveAt] = useState<string | null>(() => loadDraft(context.segment.id)?.savedAt ?? null);
  const draftTimer = useRef<number | null>(null);
  const [existingFormId, setExistingFormId] = useState(context.form?.id ?? null);

  const scoreSummary = getScoreBreakdown(formData);
  const a1Decision = getA1Decision(formData);

  const update = (partial: Partial<IdecicloFormData>) => {
    const { touched_fields: incomingTouched, ...answers } = partial;
    const previous = latest.current;
    const next = normalizeEvaluationCounts({
      ...previous,
      ...answers,
      // Every field a change names counts as answered, unless the change says otherwise.
      touched_fields: {
        ...previous.touched_fields,
        ...Object.fromEntries(Object.keys(answers).map((key) => [key, true])),
        ...incomingTouched,
      },
    });
    latest.current = next;
    setFormData(next);

    if (draftTimer.current !== null) window.clearTimeout(draftTimer.current);
    draftTimer.current = window.setTimeout(() => {
      setLastLocalSaveAt(saveDraft(context.segment.id, latest.current) ?? lastLocalSaveAt);
    }, 500);
  };

  const submit = useMutation({
    mutationFn: async () => {
      const current = latest.current;
      const summary = getScoreBreakdown(current);
      const responses: IdecicloFormData = {
        ...current,
        city_id: context.city.id,
        segment_id: context.segment.id,
        score_breakdown: summary,
        criterion_ratings: summary.resolvedRatings,
        auto_ratings: summary.autoRatings,
        total_score: summary.total,
        saved_offline: !isOnline,
        last_local_save_at: lastLocalSaveAt,
        osm_prefill_snapshot: segment.technical?.ideciclo_prefill ?? null,
        osm_field_differences: buildOsmFieldDifferences(current, segment),
      };

      const result = await saveForm({
        data: {
          segmentId: context.segment.id,
          cityId: context.city.id,
          formId: existingFormId,
          responsesJson: JSON.stringify(responses),
          segmentType: mapFormTypologyToSegmentType(current.infra_typology) ?? null,
          classification: current.road_hierarchy || null,
          prefillPatch: {
            tipologia: current.infra_typology || undefined,
            hierarquia: current.road_hierarchy || undefined,
            velocidade: current.velocity_kmh > 0 ? String(current.velocity_kmh) : undefined,
            sentido: current.infra_flow || undefined,
            posicaoNaVia: current.position_on_road || undefined,
          },
        },
      });
      if (!result.ok) throw new Error(result.problems.join(" "));

      if (draftTimer.current !== null) window.clearTimeout(draftTimer.current);
      clearDraft(context.segment.id);
      setExistingFormId(result.formId);
      return { total: summary.total, updated: existingFormId !== null };
    },
    // The saved form changes what the city's results and the segment's next opening show.
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["ideciclo"] }),
  });

  return { formData, update, segment, scoreSummary, a1Decision, isOnline, lastLocalSaveAt, submit };
}
