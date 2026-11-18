CREATE TABLE "pipeline_run" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "pipeline_run_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"pipeline" text NOT NULL,
	"source_key" text NOT NULL,
	"status" text NOT NULL,
	"source_version" text,
	"source_modified_at" timestamp with time zone,
	"rows_read" integer,
	"rows_loaded" integer,
	"discarded" jsonb,
	"error" text,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"finished_at" timestamp with time zone
);
--> statement-breakpoint
CREATE INDEX "pipeline_run_pipeline_started_idx" ON "pipeline_run" ("pipeline","started_at");