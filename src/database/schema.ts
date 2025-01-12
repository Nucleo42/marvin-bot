import { pgTable, varchar, boolean } from "drizzle-orm/pg-core";

export const guildWelcomeChannel = pgTable("guild_welcome_channel", {
  guild_id: varchar().primaryKey().notNull(),
  channel_id: varchar().notNull(),
  enabled: boolean().notNull().default(true),
  rulesChannel: varchar(),
  presentationChannel: varchar(),
  leaveAnnouncement: boolean().default(false),
});
