CREATE TYPE "counting_granularity" AS ENUM('hourly', 'total');--> statement-breakpoint
CREATE TYPE "counting_issue_origin" AS ENUM('import', 'validation');--> statement-breakpoint
CREATE TYPE "counting_issue_status" AS ENUM('open', 'resolved', 'ignored');--> statement-breakpoint
CREATE TYPE "counting_revision_kind" AS ENUM('import', 'create', 'edit', 'revert');--> statement-breakpoint
CREATE TYPE "counting_issue_severity" AS ENUM('info', 'warning', 'error');--> statement-breakpoint
CREATE TYPE "counting_status" AS ENUM('draft', 'published');--> statement-breakpoint
CREATE TYPE "counting_topology" AS ENUM('point', 't_junction', 'crossroad');--> statement-breakpoint
CREATE TABLE "counting_characteristic" (
	"key" text PRIMARY KEY,
	"label" text NOT NULL,
	"group" text NOT NULL,
	"parent_key" text,
	"is_rollup" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "counting_characteristic_alias" (
	"alias" text PRIMARY KEY,
	"characteristic_key" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "counting_contagem" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "counting_contagem_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"local_id" integer NOT NULL,
	"variant" text,
	"date" date NOT NULL,
	"source_date" date,
	"date_note" text,
	"started_at" time,
	"ended_at" time,
	"topology" "counting_topology" NOT NULL,
	"approaches" text[] NOT NULL,
	"approach_positions" text[],
	"bucket_minutes" smallint DEFAULT 60 NOT NULL,
	"granularity" "counting_granularity" DEFAULT 'hourly'::"counting_granularity" NOT NULL,
	"observed_buckets" smallint[],
	"is_projected" boolean DEFAULT false NOT NULL,
	"status" "counting_status" DEFAULT 'published'::"counting_status" NOT NULL,
	"report_url" text,
	"notes" text,
	"layout" text,
	"version" integer DEFAULT 1 NOT NULL,
	"total_cyclists" integer,
	"peak_bucket_count" integer,
	"data" jsonb NOT NULL,
	"summary" jsonb NOT NULL,
	"source" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "counting_revision" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "counting_revision_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"contagem_id" integer NOT NULL,
	"version" integer NOT NULL,
	"kind" "counting_revision_kind" NOT NULL,
	"author" text NOT NULL,
	"reason" text,
	"reverted_from_version" integer,
	"change_count" integer DEFAULT 0 NOT NULL,
	"snapshot" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "counting_import_warning" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "counting_import_warning_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"contagem_id" integer NOT NULL,
	"severity" "counting_issue_severity" NOT NULL,
	"code" text NOT NULL,
	"message" text NOT NULL,
	"ref" text,
	"origin" "counting_issue_origin" DEFAULT 'import'::"counting_issue_origin" NOT NULL,
	"status" "counting_issue_status" DEFAULT 'open'::"counting_issue_status" NOT NULL,
	"resolved_by" text,
	"resolved_at" timestamp with time zone,
	"resolution_note" text
);
--> statement-breakpoint
CREATE TABLE "counting_local" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "counting_local_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" text NOT NULL,
	"slug" text NOT NULL UNIQUE,
	"latitude" double precision,
	"longitude" double precision,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "counting_contagem_local_date_variant_idx" ON "counting_contagem" ("local_id","date",coalesce("variant", ''));--> statement-breakpoint
CREATE INDEX "counting_contagem_date_idx" ON "counting_contagem" ("date");--> statement-breakpoint
CREATE UNIQUE INDEX "counting_revision_version_idx" ON "counting_revision" ("contagem_id","version");--> statement-breakpoint
CREATE INDEX "counting_import_warning_contagem_idx" ON "counting_import_warning" ("contagem_id","status");--> statement-breakpoint
ALTER TABLE "counting_characteristic" ADD CONSTRAINT "counting_characteristic_25zwnJAAXQpW_fkey" FOREIGN KEY ("parent_key") REFERENCES "counting_characteristic"("key");--> statement-breakpoint
ALTER TABLE "counting_characteristic_alias" ADD CONSTRAINT "counting_characteristic_alias_qJAG2aEu7rkQ_fkey" FOREIGN KEY ("characteristic_key") REFERENCES "counting_characteristic"("key") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "counting_contagem" ADD CONSTRAINT "counting_contagem_local_id_counting_local_id_fkey" FOREIGN KEY ("local_id") REFERENCES "counting_local"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "counting_revision" ADD CONSTRAINT "counting_revision_contagem_id_counting_contagem_id_fkey" FOREIGN KEY ("contagem_id") REFERENCES "counting_contagem"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "counting_import_warning" ADD CONSTRAINT "counting_import_warning_contagem_id_counting_contagem_id_fkey" FOREIGN KEY ("contagem_id") REFERENCES "counting_contagem"("id") ON DELETE CASCADE;