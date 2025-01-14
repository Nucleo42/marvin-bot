import { pgTable, varchar, boolean } from "drizzle-orm/pg-core";

export const server_event_flow = pgTable("server_event_flow", {
  guild_id: varchar().primaryKey().notNull(),
  channel_id: varchar().notNull(),
  enabled: boolean().notNull().default(true),
  rulesChannel: varchar(),
  presentationChannel: varchar(),
  leaveAnnouncement: boolean().default(false),
});
