CREATE TABLE "greeting_config" (
	"guild_id" varchar PRIMARY KEY NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"channel_to_send" varchar NOT NULL
);
--> statement-breakpoint
CREATE INDEX "greeting_guild_id_idx:" ON "greeting_config" USING btree ("guild_id");