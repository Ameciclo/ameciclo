CREATE TABLE "bicycle_rack" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "bicycle_rack_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"osm_id" text NOT NULL UNIQUE,
	"name" text,
	"capacity" integer,
	"covered" text,
	"access" text,
	"operator" text,
	"parking_type" text,
	"geom" geometry(Point,4326) NOT NULL,
	"tags" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bike_share_station" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "bike_share_station_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"osm_id" text NOT NULL UNIQUE,
	"name" text,
	"ref" text,
	"capacity" integer,
	"network" text,
	"operator" text,
	"geom" geometry(Point,4326) NOT NULL,
	"tags" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "bicycle_rack_geom_idx" ON "bicycle_rack" USING gist ("geom");--> statement-breakpoint
CREATE INDEX "bike_share_station_geom_idx" ON "bike_share_station" USING gist ("geom");