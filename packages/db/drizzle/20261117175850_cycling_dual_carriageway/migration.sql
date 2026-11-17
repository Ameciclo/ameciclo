-- Pista dupla: a flag vem da tag do OSM. O sync passa a preenchê-la; aqui, os trechos que
-- entraram antes disso e ficaram com false.
UPDATE "cycling_way" SET "dual_carriageway" = true WHERE "tags"->>'dual_carriageway' = 'yes' AND NOT "dual_carriageway";--> statement-breakpoint
DROP VIEW "cycling_city_summary";--> statement-breakpoint
DROP VIEW "cycling_way_status";--> statement-breakpoint
CREATE VIEW "cycling_way_status" AS (
  SELECT
    w.id AS way_id,
    w.city_ibge,
    w.length_m,
    CASE
      WHEN w.has_cycleway AND NOT EXISTS (
        SELECT 1 FROM cycling_way_project wp WHERE wp.way_id = w.id
      ) THEN 'realizado_fora_pdc'
      WHEN w.has_cycleway AND EXISTS (
        SELECT 1 FROM cycling_way_project wp
        JOIN cycling_pdc_project p ON p.id = wp.project_id
        WHERE wp.way_id = w.id AND p.typology_key = w.built_typology_key
      ) THEN 'pdc_realizado_designado'
      WHEN w.has_cycleway THEN 'pdc_realizado_nao_designado'
      WHEN EXISTS (
        SELECT 1 FROM cycling_way_project wp WHERE wp.way_id = w.id
      ) THEN 'pdc_nao_realizado'
    END AS status,
    w.length_m * CASE WHEN w.dual_carriageway THEN 0.5 ELSE 1 END AS effective_length_m
  FROM cycling_way w
  WHERE w.removed_at IS NULL
);--> statement-breakpoint
CREATE VIEW "cycling_city_summary" AS (
  SELECT
    city_ibge,
    COALESCE(SUM(effective_length_m) FILTER (WHERE status = 'pdc_realizado_designado'), 0) / 1000 AS pdc_realizado_designado_km,
    COALESCE(SUM(effective_length_m) FILTER (WHERE status = 'pdc_realizado_nao_designado'), 0) / 1000 AS pdc_realizado_nao_designado_km,
    COALESCE(SUM(effective_length_m) FILTER (WHERE status = 'realizado_fora_pdc'), 0) / 1000 AS realizado_fora_pdc_km,
    COALESCE(SUM(effective_length_m) FILTER (WHERE status = 'pdc_nao_realizado'), 0) / 1000 AS pdc_nao_realizado_km
  FROM cycling_way_status
  WHERE city_ibge IS NOT NULL
  GROUP BY city_ibge
);--> statement-breakpoint
-- Os snapshots de antes contavam as pistas duplas em dobro (são dado derivado): refaz o da
-- última sincronização com o OSM e descarta os outros.
DELETE FROM "cycling_summary_snapshot";--> statement-breakpoint
INSERT INTO "cycling_summary_snapshot" ("run_id", "city_ibge", "pdc_realizado_designado_km", "pdc_realizado_nao_designado_km", "realizado_fora_pdc_km", "pdc_nao_realizado_km", "planned_km")
SELECT r.id, s.city_ibge, s.pdc_realizado_designado_km, s.pdc_realizado_nao_designado_km, s.realizado_fora_pdc_km, s.pdc_nao_realizado_km,
  s.pdc_realizado_designado_km + s.pdc_realizado_nao_designado_km + s.pdc_nao_realizado_km
FROM "cycling_city_summary" s
CROSS JOIN (SELECT id FROM "cycling_sync_run" WHERE kind = 'osm' AND status = 'success' ORDER BY id DESC LIMIT 1) r;
