CREATE TABLE "auto_ban_config" (
	"guild_id" varchar PRIMARY KEY NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"channel_to_listen" varchar NOT NULL,
	"channel_to_logger" varchar
);
