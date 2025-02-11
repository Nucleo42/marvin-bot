CREATE TABLE "announcement_project_config" (
	"guild_id" varchar PRIMARY KEY NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"forum_thread_to_listen" varchar NOT NULL,
	"channel_to_send" varchar
);
--> statement-breakpoint
CREATE INDEX "announcement_project_guild_id_idx:" ON "announcement_project_config" USING btree ("guild_id");