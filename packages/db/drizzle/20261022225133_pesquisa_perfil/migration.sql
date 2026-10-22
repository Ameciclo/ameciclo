CREATE TABLE "profile_interview" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "profile_interview_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"survey_id" integer NOT NULL,
	"source_id" integer NOT NULL,
	"interviewed_on" date,
	"weekday" text,
	"point_id" integer,
	"area_id" integer,
	"neighborhood" text,
	"age" smallint,
	"age_group_id" integer,
	"gender_id" integer,
	"schooling_id" integer,
	"income_id" integer,
	"color_race_id" integer,
	"occupation" text,
	"household_size" smallint,
	"neighborhood_living" text,
	"days_per_week" smallint,
	"days_work" smallint,
	"days_school" smallint,
	"days_shopping" smallint,
	"days_leisure" smallint,
	"days_station" smallint,
	"years_using_id" integer,
	"trip_minutes" smallint,
	"trip_time_group_id" integer,
	"neighborhood_origin" text,
	"neighborhood_destiny" text,
	"shared_bike" boolean,
	"electric_bike" boolean,
	"combines_modes" boolean,
	"combination_mode_id" integer,
	"previous_mode_id" integer,
	"shared_bike_influence" boolean,
	"had_collision" boolean,
	"had_theft" boolean,
	"had_harassment" boolean,
	"biggest_issue_id" integer,
	"biggest_need_id" integer,
	"motivation_start_id" integer,
	"motivation_continue_id" integer,
	"covid_household_case" boolean,
	"extra" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profile_option" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "profile_option_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"question" text NOT NULL,
	"label" text NOT NULL,
	"sort_order" smallint DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profile_point" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "profile_point_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"source_id" integer NOT NULL UNIQUE,
	"name" text NOT NULL,
	"latitude" double precision NOT NULL,
	"longitude" double precision NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profile_survey" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "profile_survey_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"year" smallint NOT NULL,
	"city" text NOT NULL,
	"source_edition_id" integer,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "profile_interview_survey_source_idx" ON "profile_interview" ("survey_id","source_id");--> statement-breakpoint
CREATE INDEX "profile_interview_survey_idx" ON "profile_interview" ("survey_id");--> statement-breakpoint
CREATE UNIQUE INDEX "profile_option_question_label_idx" ON "profile_option" ("question","label");--> statement-breakpoint
CREATE UNIQUE INDEX "profile_survey_year_city_idx" ON "profile_survey" ("year","city");--> statement-breakpoint
ALTER TABLE "profile_interview" ADD CONSTRAINT "profile_interview_survey_id_profile_survey_id_fkey" FOREIGN KEY ("survey_id") REFERENCES "profile_survey"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "profile_interview" ADD CONSTRAINT "profile_interview_point_id_profile_point_id_fkey" FOREIGN KEY ("point_id") REFERENCES "profile_point"("id");--> statement-breakpoint
ALTER TABLE "profile_interview" ADD CONSTRAINT "profile_interview_area_id_profile_option_id_fkey" FOREIGN KEY ("area_id") REFERENCES "profile_option"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "profile_interview" ADD CONSTRAINT "profile_interview_age_group_id_profile_option_id_fkey" FOREIGN KEY ("age_group_id") REFERENCES "profile_option"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "profile_interview" ADD CONSTRAINT "profile_interview_gender_id_profile_option_id_fkey" FOREIGN KEY ("gender_id") REFERENCES "profile_option"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "profile_interview" ADD CONSTRAINT "profile_interview_schooling_id_profile_option_id_fkey" FOREIGN KEY ("schooling_id") REFERENCES "profile_option"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "profile_interview" ADD CONSTRAINT "profile_interview_income_id_profile_option_id_fkey" FOREIGN KEY ("income_id") REFERENCES "profile_option"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "profile_interview" ADD CONSTRAINT "profile_interview_color_race_id_profile_option_id_fkey" FOREIGN KEY ("color_race_id") REFERENCES "profile_option"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "profile_interview" ADD CONSTRAINT "profile_interview_years_using_id_profile_option_id_fkey" FOREIGN KEY ("years_using_id") REFERENCES "profile_option"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "profile_interview" ADD CONSTRAINT "profile_interview_trip_time_group_id_profile_option_id_fkey" FOREIGN KEY ("trip_time_group_id") REFERENCES "profile_option"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "profile_interview" ADD CONSTRAINT "profile_interview_combination_mode_id_profile_option_id_fkey" FOREIGN KEY ("combination_mode_id") REFERENCES "profile_option"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "profile_interview" ADD CONSTRAINT "profile_interview_previous_mode_id_profile_option_id_fkey" FOREIGN KEY ("previous_mode_id") REFERENCES "profile_option"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "profile_interview" ADD CONSTRAINT "profile_interview_biggest_issue_id_profile_option_id_fkey" FOREIGN KEY ("biggest_issue_id") REFERENCES "profile_option"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "profile_interview" ADD CONSTRAINT "profile_interview_biggest_need_id_profile_option_id_fkey" FOREIGN KEY ("biggest_need_id") REFERENCES "profile_option"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "profile_interview" ADD CONSTRAINT "profile_interview_motivation_start_id_profile_option_id_fkey" FOREIGN KEY ("motivation_start_id") REFERENCES "profile_option"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "profile_interview" ADD CONSTRAINT "profile_interview_motivation_continue_id_profile_option_id_fkey" FOREIGN KEY ("motivation_continue_id") REFERENCES "profile_option"("id") ON DELETE RESTRICT;