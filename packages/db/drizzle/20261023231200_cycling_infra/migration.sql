-- A extensão postgis é criada pelo Pulumi (groundwork); o papel de migração não tem permissão para isso.
CREATE TYPE "cycling_stage" AS ENUM('existing', 'proposed', 'planned');--> statement-breakpoint
CREATE TYPE "cycling_sync_kind" AS ENUM('import', 'osm');--> statement-breakpoint
CREATE TYPE "cycling_sync_status" AS ENUM('running', 'success', 'failed');--> statement-breakpoint
CREATE TABLE "cycling_agency" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "cycling_agency_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" text NOT NULL UNIQUE
);
--> statement-breakpoint
CREATE TABLE "cycling_city" (
	"ibge_code" integer PRIMARY KEY,
	"name" text NOT NULL,
	"is_rmr" boolean DEFAULT false NOT NULL,
	"boundary" geometry(MultiPolygon,4326)
);
--> statement-breakpoint
CREATE TABLE "cycling_pdc_project" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "cycling_pdc_project_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"ref" text NOT NULL UNIQUE,
	"osm_relation_id" bigint UNIQUE,
	"name" text NOT NULL,
	"typology_key" text NOT NULL,
	"stage" "cycling_stage" NOT NULL,
	"stretch" text,
	"planned_km" numeric(8,2),
	"notes" text,
	"osm_tags" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cycling_pdc_project_agency" (
	"project_id" integer,
	"agency_id" integer,
	CONSTRAINT "cycling_pdc_project_agency_pkey" PRIMARY KEY("project_id","agency_id")
);
--> statement-breakpoint
CREATE TABLE "cycling_pdc_project_city" (
	"project_id" integer,
	"city_ibge" integer,
	CONSTRAINT "cycling_pdc_project_city_pkey" PRIMARY KEY("project_id","city_ibge")
);
--> statement-breakpoint
CREATE TABLE "cycling_summary_snapshot" (
	"run_id" integer,
	"city_ibge" integer,
	"pdc_realizado_designado_km" double precision NOT NULL,
	"pdc_realizado_nao_designado_km" double precision NOT NULL,
	"realizado_fora_pdc_km" double precision NOT NULL,
	"pdc_nao_realizado_km" double precision NOT NULL,
	"planned_km" double precision NOT NULL,
	CONSTRAINT "cycling_summary_snapshot_pkey" PRIMARY KEY("run_id","city_ibge")
);
--> statement-breakpoint
CREATE TABLE "cycling_sync_run" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "cycling_sync_run_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"kind" "cycling_sync_kind" NOT NULL,
	"source_ref" text,
	"status" "cycling_sync_status" DEFAULT 'running'::"cycling_sync_status" NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"finished_at" timestamp with time zone,
	"ways_added" integer,
	"ways_updated" integer,
	"ways_removed" integer,
	"error" text,
	"triggered_by" text
);
--> statement-breakpoint
CREATE TABLE "cycling_typology" (
	"key" text PRIMARY KEY,
	"label" text NOT NULL,
	"color" text NOT NULL,
	"sort_order" smallint DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cycling_way" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "cycling_way_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"osm_id" bigint NOT NULL UNIQUE,
	"name" text,
	"highway" text,
	"geom" geometry(Geometry,4326) NOT NULL,
	"length_m" double precision GENERATED ALWAYS AS (ST_Length(geom::geography)) STORED,
	"city_ibge" integer,
	"city_manual" boolean DEFAULT false NOT NULL,
	"has_cycleway" boolean DEFAULT false NOT NULL,
	"built_typology_key" text,
	"surface" text,
	"oneway" boolean,
	"maxspeed_kmh" smallint,
	"lit" boolean,
	"dual_carriageway" boolean DEFAULT false NOT NULL,
	"tags" jsonb DEFAULT '{}' NOT NULL,
	"removed_at" timestamp with time zone,
	"first_seen_run_id" integer,
	"last_seen_run_id" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cycling_way_project" (
	"way_id" integer,
	"project_id" integer,
	"manual" boolean DEFAULT false NOT NULL,
	CONSTRAINT "cycling_way_project_pkey" PRIMARY KEY("way_id","project_id")
);
--> statement-breakpoint
CREATE INDEX "cycling_way_geom_idx" ON "cycling_way" USING gist ("geom");--> statement-breakpoint
CREATE INDEX "cycling_way_city_idx" ON "cycling_way" ("city_ibge");--> statement-breakpoint
CREATE INDEX "cycling_way_project_project_idx" ON "cycling_way_project" ("project_id");--> statement-breakpoint
ALTER TABLE "cycling_pdc_project" ADD CONSTRAINT "cycling_pdc_project_typology_key_cycling_typology_key_fkey" FOREIGN KEY ("typology_key") REFERENCES "cycling_typology"("key");--> statement-breakpoint
ALTER TABLE "cycling_pdc_project_agency" ADD CONSTRAINT "cycling_pdc_project_agency_Byd6tWYtXi5N_fkey" FOREIGN KEY ("project_id") REFERENCES "cycling_pdc_project"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "cycling_pdc_project_agency" ADD CONSTRAINT "cycling_pdc_project_agency_agency_id_cycling_agency_id_fkey" FOREIGN KEY ("agency_id") REFERENCES "cycling_agency"("id");--> statement-breakpoint
ALTER TABLE "cycling_pdc_project_city" ADD CONSTRAINT "cycling_pdc_project_city_project_id_cycling_pdc_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "cycling_pdc_project"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "cycling_pdc_project_city" ADD CONSTRAINT "cycling_pdc_project_city_city_ibge_cycling_city_ibge_code_fkey" FOREIGN KEY ("city_ibge") REFERENCES "cycling_city"("ibge_code");--> statement-breakpoint
ALTER TABLE "cycling_summary_snapshot" ADD CONSTRAINT "cycling_summary_snapshot_run_id_cycling_sync_run_id_fkey" FOREIGN KEY ("run_id") REFERENCES "cycling_sync_run"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "cycling_summary_snapshot" ADD CONSTRAINT "cycling_summary_snapshot_city_ibge_cycling_city_ibge_code_fkey" FOREIGN KEY ("city_ibge") REFERENCES "cycling_city"("ibge_code");--> statement-breakpoint
ALTER TABLE "cycling_way" ADD CONSTRAINT "cycling_way_city_ibge_cycling_city_ibge_code_fkey" FOREIGN KEY ("city_ibge") REFERENCES "cycling_city"("ibge_code");--> statement-breakpoint
ALTER TABLE "cycling_way" ADD CONSTRAINT "cycling_way_built_typology_key_cycling_typology_key_fkey" FOREIGN KEY ("built_typology_key") REFERENCES "cycling_typology"("key");--> statement-breakpoint
ALTER TABLE "cycling_way" ADD CONSTRAINT "cycling_way_first_seen_run_id_cycling_sync_run_id_fkey" FOREIGN KEY ("first_seen_run_id") REFERENCES "cycling_sync_run"("id");--> statement-breakpoint
ALTER TABLE "cycling_way" ADD CONSTRAINT "cycling_way_last_seen_run_id_cycling_sync_run_id_fkey" FOREIGN KEY ("last_seen_run_id") REFERENCES "cycling_sync_run"("id");--> statement-breakpoint
ALTER TABLE "cycling_way_project" ADD CONSTRAINT "cycling_way_project_way_id_cycling_way_id_fkey" FOREIGN KEY ("way_id") REFERENCES "cycling_way"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "cycling_way_project" ADD CONSTRAINT "cycling_way_project_project_id_cycling_pdc_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "cycling_pdc_project"("id") ON DELETE CASCADE;--> statement-breakpoint
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
    END AS status
  FROM cycling_way w
  WHERE w.removed_at IS NULL
);--> statement-breakpoint
CREATE VIEW "cycling_city_summary" AS (
  SELECT
    city_ibge,
    COALESCE(SUM(length_m) FILTER (WHERE status = 'pdc_realizado_designado'), 0) / 1000 AS pdc_realizado_designado_km,
    COALESCE(SUM(length_m) FILTER (WHERE status = 'pdc_realizado_nao_designado'), 0) / 1000 AS pdc_realizado_nao_designado_km,
    COALESCE(SUM(length_m) FILTER (WHERE status = 'realizado_fora_pdc'), 0) / 1000 AS realizado_fora_pdc_km,
    COALESCE(SUM(length_m) FILTER (WHERE status = 'pdc_nao_realizado'), 0) / 1000 AS pdc_nao_realizado_km
  FROM cycling_way_status
  WHERE city_ibge IS NOT NULL
  GROUP BY city_ibge
);