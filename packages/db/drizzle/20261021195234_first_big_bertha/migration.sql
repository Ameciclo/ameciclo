CREATE TYPE "basis" AS ENUM('observed', 'projected');--> statement-breakpoint
CREATE TYPE "observation_block" AS ENUM('padroes', 'observacoes');--> statement-breakpoint
CREATE TYPE "granularity" AS ENUM('hourly', 'total');--> statement-breakpoint
CREATE TYPE "warning_severity" AS ENUM('info', 'warning', 'error');--> statement-breakpoint
CREATE TYPE "contagem_status" AS ENUM('draft', 'published');--> statement-breakpoint
CREATE TYPE "topology" AS ENUM('point', 't_junction', 'crossroad');--> statement-breakpoint
CREATE TABLE "characteristic" (
	"key" text PRIMARY KEY,
	"label" text NOT NULL,
	"group" text NOT NULL,
	"parent_key" text,
	"is_rollup" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "characteristic_alias" (
	"alias" text PRIMARY KEY,
	"characteristic_key" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "condition" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "condition_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"contagem_id" integer NOT NULL,
	"bucket" smallint NOT NULL,
	"kind" text NOT NULL,
	"value" numeric,
	"note" text
);
--> statement-breakpoint
CREATE TABLE "contagem" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "contagem_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"local_id" integer NOT NULL,
	"variant" text,
	"date" date NOT NULL,
	"source_date" date,
	"date_note" text,
	"started_at" time,
	"ended_at" time,
	"topology" "topology" NOT NULL,
	"approaches" text[] NOT NULL,
	"bucket_minutes" smallint DEFAULT 60 NOT NULL,
	"granularity" "granularity" DEFAULT 'hourly'::"granularity" NOT NULL,
	"observed_buckets" smallint[],
	"is_projected" boolean DEFAULT false NOT NULL,
	"status" "contagem_status" DEFAULT 'published'::"contagem_status" NOT NULL,
	"report_url" text,
	"notes" text,
	"layout" text,
	"total_cyclists" integer,
	"peak_bucket_count" integer,
	"source" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "import_warning" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "import_warning_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"contagem_id" integer NOT NULL,
	"severity" "warning_severity" NOT NULL,
	"code" text NOT NULL,
	"message" text NOT NULL,
	"ref" text
);
--> statement-breakpoint
CREATE TABLE "local" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "local_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" text NOT NULL,
	"slug" text NOT NULL UNIQUE,
	"latitude" double precision,
	"longitude" double precision,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "movement_count" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "movement_count_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"contagem_id" integer NOT NULL,
	"basis" "basis" DEFAULT 'observed'::"basis" NOT NULL,
	"from_idx" smallint NOT NULL,
	"to_idx" smallint NOT NULL,
	"bucket" smallint,
	"value" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "note" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "note_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"contagem_id" integer NOT NULL,
	"bucket_from" smallint,
	"bucket_to" smallint,
	"text" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "observation" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "observation_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"contagem_id" integer NOT NULL,
	"basis" "basis" DEFAULT 'observed'::"basis" NOT NULL,
	"block" "observation_block" NOT NULL,
	"position" smallint NOT NULL,
	"raw_label" text NOT NULL,
	"characteristic_key" text,
	"bucket" smallint,
	"value" integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "condition_cell_idx" ON "condition" ("contagem_id","bucket","kind");--> statement-breakpoint
CREATE UNIQUE INDEX "contagem_local_date_variant_idx" ON "contagem" ("local_id","date",coalesce("variant", ''));--> statement-breakpoint
CREATE INDEX "contagem_date_idx" ON "contagem" ("date");--> statement-breakpoint
CREATE INDEX "import_warning_contagem_idx" ON "import_warning" ("contagem_id");--> statement-breakpoint
CREATE UNIQUE INDEX "movement_count_cell_idx" ON "movement_count" ("contagem_id","basis","from_idx","to_idx",coalesce("bucket", -1));--> statement-breakpoint
CREATE UNIQUE INDEX "observation_cell_idx" ON "observation" ("contagem_id","basis","block","position",coalesce("bucket", -1));--> statement-breakpoint
CREATE INDEX "observation_key_idx" ON "observation" ("characteristic_key");--> statement-breakpoint
ALTER TABLE "characteristic" ADD CONSTRAINT "characteristic_parent_key_characteristic_key_fkey" FOREIGN KEY ("parent_key") REFERENCES "characteristic"("key");--> statement-breakpoint
ALTER TABLE "characteristic_alias" ADD CONSTRAINT "characteristic_alias_characteristic_key_characteristic_key_fkey" FOREIGN KEY ("characteristic_key") REFERENCES "characteristic"("key") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "condition" ADD CONSTRAINT "condition_contagem_id_contagem_id_fkey" FOREIGN KEY ("contagem_id") REFERENCES "contagem"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "contagem" ADD CONSTRAINT "contagem_local_id_local_id_fkey" FOREIGN KEY ("local_id") REFERENCES "local"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "import_warning" ADD CONSTRAINT "import_warning_contagem_id_contagem_id_fkey" FOREIGN KEY ("contagem_id") REFERENCES "contagem"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "movement_count" ADD CONSTRAINT "movement_count_contagem_id_contagem_id_fkey" FOREIGN KEY ("contagem_id") REFERENCES "contagem"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "note" ADD CONSTRAINT "note_contagem_id_contagem_id_fkey" FOREIGN KEY ("contagem_id") REFERENCES "contagem"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "observation" ADD CONSTRAINT "observation_contagem_id_contagem_id_fkey" FOREIGN KEY ("contagem_id") REFERENCES "contagem"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "observation" ADD CONSTRAINT "observation_characteristic_key_characteristic_key_fkey" FOREIGN KEY ("characteristic_key") REFERENCES "characteristic"("key");