CREATE TABLE "cycling_stretch" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "cycling_stretch_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "cycling_way" ADD COLUMN "stretch_id" integer;--> statement-breakpoint
CREATE INDEX "cycling_way_stretch_idx" ON "cycling_way" ("stretch_id");--> statement-breakpoint
ALTER TABLE "cycling_way" ADD CONSTRAINT "cycling_way_stretch_id_cycling_stretch_id_fkey" FOREIGN KEY ("stretch_id") REFERENCES "cycling_stretch"("id") ON DELETE SET NULL;