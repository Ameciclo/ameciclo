CREATE TYPE "ideciclo_rating_type" AS ENUM('A', 'B', 'C', 'D');--> statement-breakpoint
CREATE TYPE "ideciclo_segment_type" AS ENUM('Ciclofaixa', 'Ciclovia', 'Ciclorrota', 'Compartilhada');--> statement-breakpoint
CREATE TABLE "ideciclo_city" (
	"id" text PRIMARY KEY,
	"name" text NOT NULL,
	"state" text NOT NULL,
	"extensao_avaliada" numeric DEFAULT '0' NOT NULL,
	"ideciclo" numeric DEFAULT '0' NOT NULL,
	"vias_estruturais_km" numeric DEFAULT '0' NOT NULL,
	"vias_alimentadoras_km" numeric DEFAULT '0' NOT NULL,
	"vias_locais_km" numeric DEFAULT '0' NOT NULL,
	"show_in_ranking" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ideciclo_form" (
	"id" text PRIMARY KEY,
	"segment_id" text NOT NULL,
	"city_id" text NOT NULL,
	"researcher" text,
	"date" timestamp with time zone,
	"street_name" text,
	"neighborhood" text,
	"extension" numeric,
	"start_point" text,
	"end_point" text,
	"hierarchy" text,
	"observations" text,
	"responses" jsonb,
	"velocity" integer,
	"blocks_count" integer,
	"intersections_count" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ideciclo_review" (
	"id" text PRIMARY KEY,
	"form_id" text NOT NULL,
	"rating_name" "ideciclo_rating_type" NOT NULL,
	"rating" integer NOT NULL,
	"weight" numeric NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ideciclo_segment" (
	"id" text PRIMARY KEY,
	"id_cidade" text NOT NULL,
	"id_form" text,
	"name" text NOT NULL,
	"type" "ideciclo_segment_type" NOT NULL,
	"length" numeric NOT NULL,
	"neighborhood" text,
	"geometry" jsonb,
	"selected" boolean DEFAULT false,
	"evaluated" boolean DEFAULT false,
	"is_merged" boolean DEFAULT false,
	"parent_segment_id" text,
	"merged_segments" jsonb DEFAULT '[]',
	"classification" text,
	"osm_advanced" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "ideciclo_city_state_idx" ON "ideciclo_city" ("state");--> statement-breakpoint
CREATE INDEX "ideciclo_form_city_idx" ON "ideciclo_form" ("city_id");--> statement-breakpoint
CREATE INDEX "ideciclo_form_segment_idx" ON "ideciclo_form" ("segment_id");--> statement-breakpoint
CREATE INDEX "ideciclo_review_form_idx" ON "ideciclo_review" ("form_id");--> statement-breakpoint
CREATE INDEX "ideciclo_segment_city_idx" ON "ideciclo_segment" ("id_cidade");--> statement-breakpoint
CREATE INDEX "ideciclo_segment_parent_idx" ON "ideciclo_segment" ("parent_segment_id");--> statement-breakpoint
CREATE INDEX "ideciclo_segment_deleted_idx" ON "ideciclo_segment" ("deleted_at");--> statement-breakpoint
ALTER TABLE "ideciclo_form" ADD CONSTRAINT "ideciclo_form_segment_id_ideciclo_segment_id_fkey" FOREIGN KEY ("segment_id") REFERENCES "ideciclo_segment"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "ideciclo_form" ADD CONSTRAINT "ideciclo_form_city_id_ideciclo_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "ideciclo_city"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "ideciclo_review" ADD CONSTRAINT "ideciclo_review_form_id_ideciclo_form_id_fkey" FOREIGN KEY ("form_id") REFERENCES "ideciclo_form"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "ideciclo_segment" ADD CONSTRAINT "ideciclo_segment_id_cidade_ideciclo_city_id_fkey" FOREIGN KEY ("id_cidade") REFERENCES "ideciclo_city"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "ideciclo_segment" ADD CONSTRAINT "ideciclo_segment_parent_segment_id_ideciclo_segment_id_fkey" FOREIGN KEY ("parent_segment_id") REFERENCES "ideciclo_segment"("id") ON DELETE CASCADE;