CREATE TYPE "revision_kind" AS ENUM('import', 'create', 'edit', 'revert');--> statement-breakpoint
CREATE TABLE "contagem_revision" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "contagem_revision_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"contagem_id" integer NOT NULL,
	"version" integer NOT NULL,
	"kind" "revision_kind" NOT NULL,
	"author" text NOT NULL,
	"reason" text,
	"reverted_from_version" integer,
	"change_count" integer DEFAULT 0 NOT NULL,
	"snapshot" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "contagem" ADD COLUMN "version" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "contagem_revision_version_idx" ON "contagem_revision" ("contagem_id","version");--> statement-breakpoint
ALTER TABLE "contagem_revision" ADD CONSTRAINT "contagem_revision_contagem_id_contagem_id_fkey" FOREIGN KEY ("contagem_id") REFERENCES "contagem"("id") ON DELETE CASCADE;