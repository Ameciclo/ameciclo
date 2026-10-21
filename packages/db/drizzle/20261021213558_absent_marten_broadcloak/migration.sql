CREATE TYPE "issue_origin" AS ENUM('import', 'validation');--> statement-breakpoint
CREATE TYPE "issue_status" AS ENUM('open', 'resolved', 'ignored');--> statement-breakpoint
ALTER TABLE "import_warning" ADD COLUMN "origin" "issue_origin" DEFAULT 'import'::"issue_origin" NOT NULL;--> statement-breakpoint
ALTER TABLE "import_warning" ADD COLUMN "status" "issue_status" DEFAULT 'open'::"issue_status" NOT NULL;--> statement-breakpoint
ALTER TABLE "import_warning" ADD COLUMN "resolved_by" text;--> statement-breakpoint
ALTER TABLE "import_warning" ADD COLUMN "resolved_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "import_warning" ADD COLUMN "resolution_note" text;--> statement-breakpoint
DROP INDEX "import_warning_contagem_idx";--> statement-breakpoint
CREATE INDEX "import_warning_contagem_idx" ON "import_warning" ("contagem_id","status");