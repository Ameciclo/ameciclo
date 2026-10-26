import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { and, desc, eq, like, or } from "drizzle-orm";
import { ideCity, ideForm, ideSegment } from "@ameciclo/db/schema";

import type { CityDto, FormDto, SegmentDto } from "~/lib/ideciclo/domain";
import { FormDataSchema } from "~/lib/ideciclo/form-types";
import { SegmentTechnicalSchema, type SegmentContext } from "~/lib/ideciclo/segment-technical";

// Reading and saving the IDECICLO evaluation: the segment being evaluated, its
// form, and a city's segments and forms for the results screen.
//
// TODO(auth): saving and the ranking release need a signed-in user with the
// refinement/evaluation module for the city's scope. Open until auth is ported.

type Row<T extends { $inferSelect: unknown }> = T["$inferSelect"];

const toCityDto = (row: Row<typeof ideCity>): CityDto => ({
  id: row.id,
  name: row.name,
  state: row.state,
  evaluatedKm: row.evaluatedKm,
  ideciclo: row.ideciclo,
  structuralKm: row.structuralKm,
  feederKm: row.feederKm,
  localKm: row.localKm,
  showInRanking: row.showInRanking,
});

const toSegmentDto = (row: Row<typeof ideSegment>): SegmentDto => ({
  id: row.id,
  cityId: row.cityId,
  name: row.name,
  type: row.type,
  length: row.length,
  neighborhood: row.neighborhood,
  geometry: row.geometry === null ? null : JSON.stringify(row.geometry),
  classification: row.classification,
  parentSegmentId: row.parentSegmentId,
  evaluated: row.evaluated ?? false,
  formId: row.formId,
});

const toFormDto = (row: Row<typeof ideForm>): FormDto => ({
  id: row.id,
  segmentId: row.segmentId,
  cityId: row.cityId,
  researcher: row.researcher,
  streetName: row.streetName,
  hierarchy: row.hierarchy,
  responses: row.responses === null ? null : JSON.stringify(row.responses),
});

export type FormContext = {
  segment: SegmentContext;
  city: CityDto;
  // The form already saved for this segment, if any.
  form: FormDto | null;
};

// The route carries the segment id as stored; a city-less id ("123") is also
// accepted and matched against ids written as "<city>_123".
export const getFormContext = createServerFn({ method: "GET" })
  .inputValidator((input: { segmentId: string }) => input)
  .handler(async ({ data }): Promise<FormContext | null> => {
    const { withDb } = await import("~/lib/db.server");
    return withDb(async (db) => {
      const [segment] = await db
        .select()
        .from(ideSegment)
        .where(or(eq(ideSegment.id, data.segmentId), like(ideSegment.id, `%\\_${data.segmentId}`)))
        .limit(1);
      if (!segment) return null;

      const [city] = await db.select().from(ideCity).where(eq(ideCity.id, segment.cityId));
      if (!city) return null;

      const [form] = await db.select().from(ideForm).where(eq(ideForm.segmentId, segment.id)).orderBy(desc(ideForm.updatedAt)).limit(1);

      return {
        segment: {
          id: segment.id,
          cityId: segment.cityId,
          name: segment.name,
          type: segment.type,
          length: segment.length,
          neighborhood: segment.neighborhood,
          geometry: segment.geometry === null ? null : JSON.stringify(segment.geometry),
          classification: segment.classification,
          evaluated: segment.evaluated ?? false,
          formId: segment.formId,
          technical: segment.osmAdvanced === null ? null : JSON.stringify(segment.osmAdvanced),
        },
        city: toCityDto(city),
        form: form ? toFormDto(form) : null,
      };
    });
  });

export type SaveFormInput = {
  segmentId: string;
  cityId: string;
  // The id of the form being edited, when the segment already has one.
  formId: string | null;
  // The answers (IdecicloFormData) as JSON text.
  responsesJson: string;
  // What the segment learns from the evaluation.
  segmentType: SegmentContext["type"] | null;
  classification: string | null;
  // Merged into the segment's prefill: the typology, hierarchy, speed, direction
  // and position the evaluator confirmed or corrected.
  prefillPatch: {
    tipologia?: string;
    hierarquia?: string;
    velocidade?: string;
    sentido?: string;
    posicaoNaVia?: string;
  };
};

export type SaveFormResult = { ok: true; formId: string; total: number } | { ok: false; problems: string[] };

export const saveForm = createServerFn({ method: "POST" })
  .inputValidator((input: SaveFormInput) => input)
  .handler(async ({ data }): Promise<SaveFormResult> => {
    const answers = FormDataSchema.safeParse(JSON.parse(data.responsesJson));
    if (!answers.success) return { ok: false, problems: ["As respostas do formulário estão incompletas ou inválidas."] };
    const responses = answers.data;

    const { withDb } = await import("~/lib/db.server");
    return withDb((db) =>
      db.transaction(async (tx) => {
        const [segment] = await tx
          .select()
          .from(ideSegment)
          .where(and(eq(ideSegment.cityId, data.cityId), eq(ideSegment.id, data.segmentId)));
        if (!segment) return { ok: false as const, problems: ["Trecho não encontrado."] };

        const columns = {
          segmentId: segment.id,
          cityId: data.cityId,
          researcher: responses.researcher || "",
          date: responses.date ? new Date(responses.date) : new Date(),
          streetName: responses.segment_name || null,
          startPoint: responses.start_point || null,
          endPoint: responses.end_point || null,
          extension: responses.extension_m || null,
          hierarchy: responses.road_hierarchy || null,
          velocity: responses.velocity_kmh || null,
          blocksCount: responses.blocks_count || null,
          intersectionsCount: responses.intersections_count || null,
          observations: responses.observations || null,
          responses,
        };

        let formId = data.formId;
        if (formId) {
          await tx
            .update(ideForm)
            .set({ ...columns, updatedAt: new Date() })
            .where(eq(ideForm.id, formId));
        } else {
          formId = `form-${segment.id}-${Date.now()}`;
          await tx.insert(ideForm).values({ id: formId, ...columns });
        }

        // The segment now counts as evaluated, and keeps what the evaluator
        // confirmed so the next form starts from it.
        const technical = SegmentTechnicalSchema.safeParse(segment.osmAdvanced ?? {});
        const previousPrefill = technical.success ? technical.data.ideciclo_prefill : null;
        const envelope = {
          ...(technical.success ? technical.data : {}),
          version: 1,
          updated_at: new Date().toISOString(),
          ideciclo_prefill: { pendenciasCampo: [], ...previousPrefill, ...data.prefillPatch },
        };
        await tx
          .update(ideSegment)
          .set({
            evaluated: true,
            formId,
            ...(data.segmentType ? { type: data.segmentType } : {}),
            classification: data.classification,
            osmAdvanced: envelope,
            updatedAt: new Date(),
          })
          .where(eq(ideSegment.id, segment.id));

        return { ok: true as const, formId, total: responses.total_score ?? 0 };
      }),
    );
  });

export type CityResultsData = { city: CityDto; segments: SegmentDto[]; forms: FormDto[] };

export const getCityResultsData = createServerFn({ method: "GET" })
  .inputValidator((input: { cityId: string }) => input)
  .handler(async ({ data }): Promise<CityResultsData | null> => {
    const { withDb } = await import("~/lib/db.server");
    return withDb(async (db) => {
      const [city] = await db.select().from(ideCity).where(eq(ideCity.id, data.cityId));
      if (!city) return null;
      const segments = await db.select().from(ideSegment).where(eq(ideSegment.cityId, data.cityId));
      const forms = await db.select().from(ideForm).where(eq(ideForm.cityId, data.cityId));
      return {
        city: toCityDto(city),
        segments: segments.filter((segment) => segment.deletedAt === null).map(toSegmentDto),
        forms: forms.map(toFormDto),
      };
    });
  });

export const setRankingVisibility = createServerFn({ method: "POST" })
  .inputValidator((input: { cityId: string; visible: boolean }) => input)
  .handler(async ({ data }): Promise<{ ok: boolean }> => {
    const { withDb } = await import("~/lib/db.server");
    return withDb(async (db) => {
      const updated = await db
        .update(ideCity)
        .set({ showInRanking: data.visible, updatedAt: new Date() })
        .where(eq(ideCity.id, data.cityId))
        .returning({ id: ideCity.id });
      return { ok: updated.length > 0 };
    });
  });

export const formContextQueryOptions = (segmentId: string) =>
  queryOptions({ queryKey: ["ideciclo", "form-context", segmentId], queryFn: () => getFormContext({ data: { segmentId } }) });

export const cityResultsQueryOptions = (cityId: string) =>
  queryOptions({ queryKey: ["ideciclo", "city-results", cityId], queryFn: () => getCityResultsData({ data: { cityId } }) });
