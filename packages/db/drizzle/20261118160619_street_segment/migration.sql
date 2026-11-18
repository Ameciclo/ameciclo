CREATE TABLE "street_segment" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "street_segment_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"source_id" integer NOT NULL UNIQUE,
	"street_code" integer NOT NULL,
	"name_key" text NOT NULL,
	"official_name" text,
	"paved" text,
	"length_m" double precision NOT NULL,
	"geom" geometry(MultiLineString,4326) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "street_segment_name_idx" ON "street_segment" ("name_key");--> statement-breakpoint
CREATE INDEX "street_segment_geom_idx" ON "street_segment" USING gist ("geom");