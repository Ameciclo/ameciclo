CREATE TABLE "samu_call" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "samu_call_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"source_id" integer NOT NULL,
	"source_row" integer NOT NULL UNIQUE,
	"occurred_on" date NOT NULL,
	"occurred_at" time,
	"city_ibge" integer,
	"neighborhood" text,
	"address" text,
	"street" text,
	"origin" text,
	"subtype" text,
	"category" text NOT NULL,
	"gender" text,
	"age" smallint,
	"finalization" text,
	"outcome" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "samu_city" (
	"ibge_code" integer PRIMARY KEY,
	"name" text NOT NULL,
	"is_rmr" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE INDEX "samu_call_date_idx" ON "samu_call" ("occurred_on");--> statement-breakpoint
CREATE INDEX "samu_call_city_date_idx" ON "samu_call" ("city_ibge","occurred_on");--> statement-breakpoint
CREATE INDEX "samu_call_street_idx" ON "samu_call" ("city_ibge","street") WHERE "street" is not null;--> statement-breakpoint
ALTER TABLE "samu_call" ADD CONSTRAINT "samu_call_city_ibge_samu_city_ibge_code_fkey" FOREIGN KEY ("city_ibge") REFERENCES "samu_city"("ibge_code");