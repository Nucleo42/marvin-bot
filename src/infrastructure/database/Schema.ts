import { pgTable, varchar, boolean, index } from "drizzle-orm/pg-core";

export const server_event_flow = pgTable(
  "server_event_flow",
  {
    guild_id: varchar().primaryKey().notNull(),
    channel_id: varchar().notNull(),
    enabled: boolean().notNull().default(true),
    rulesChannel: varchar(),
    presentationChannel: varchar(),
    leaveAnnouncement: boolean().default(false),
  },
  (table) => {
    return [index("flow_guild_id_idx:").on(table.guild_id)];
  },
);

export const auto_ban_config = pgTable(
  "auto_ban_config",
  {
    guild_id: varchar().primaryKey().notNull(),
    enabled: boolean().notNull().default(true),
    channel_to_listen: varchar().notNull(),
    channel_to_logger: varchar(),
  },
  (table) => {
    return [index("ban_guild_id_idx:").on(table.guild_id)];
  },
);

export const greeting_config = pgTable(
  "greeting_config",
  {
    guild_id: varchar().primaryKey().notNull(),
    enabled: boolean().notNull().default(true),
    channel_to_send: varchar().notNull(),
  },
  (table) => {
    return [index("greeting_guild_id_idx:").on(table.guild_id)];
  },
);

export const announcement_project_config = pgTable(
  "announcement_project_config",
  {
    guild_id: varchar().primaryKey().notNull(),
    enabled: boolean().notNull().default(true),
    forum_thread_to_listen: varchar().notNull(),
    channel_to_send: varchar(),
  },
  (table) => {
    return [index("announcement_project_guild_id_idx:").on(table.guild_id)];
  },
);
