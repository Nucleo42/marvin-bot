CREATE TABLE "guild_welcome_channel" (
	"guild_id" varchar PRIMARY KEY NOT NULL,
	"channel_id" varchar NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"rulesChannel" varchar,
	"presentationChannel" varchar
);
