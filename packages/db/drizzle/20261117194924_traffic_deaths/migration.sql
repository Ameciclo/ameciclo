CREATE TABLE "traffic_death" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "traffic_death_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"source_year" smallint NOT NULL,
	"source_row" integer NOT NULL,
	"year" smallint NOT NULL,
	"month" smallint NOT NULL,
	"occurrence_city" integer,
	"residence_city" integer,
	"death_place" text,
	"cause" text NOT NULL,
	"secondary_causes" text,
	"sex" text,
	"race_color" text,
	"age_years" smallint,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "traffic_death_source_unique" UNIQUE("source_year","source_row")
);
--> statement-breakpoint
CREATE INDEX "traffic_death_year_occurrence_idx" ON "traffic_death" ("year","occurrence_city");--> statement-breakpoint
CREATE INDEX "traffic_death_year_residence_idx" ON "traffic_death" ("year","residence_city");