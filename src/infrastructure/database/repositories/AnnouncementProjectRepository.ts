import { announcement_project_config as DB } from "../Schema";
import { DatabaseConnection } from "@database/Connection";
import { eq } from "drizzle-orm";
import { inject, injectable } from "tsyringe";

export interface IAnnouncementProjectRepository {
  guild_id: string;
  enabled: boolean;
  forum_thread_to_listen: string;
  channel_to_send?: string;
}

@injectable()
export class AnnouncementProjectRepository {
  constructor(
    @inject(DatabaseConnection) private database: DatabaseConnection,
  ) {}

  async set({
    channel_to_send,
    enabled,
    forum_thread_to_listen,
    guild_id,
  }: IAnnouncementProjectRepository) {
    const announcementProjectConfig: typeof DB.$inferInsert = {
      guild_id,
      enabled,
      forum_thread_to_listen,
      channel_to_send,
    };

    await this.database
      .getBd()
      .insert(DB)
      .values(announcementProjectConfig)
      .onConflictDoUpdate({
        target: [DB.guild_id],
        set: announcementProjectConfig,
      })
      .execute();
  }

  async get(guild_id: string) {
    const announcementProjectConfig = await this.database
      .getBd()
      .select()
      .from(DB)
      .where(eq(DB.guild_id, guild_id));

    return announcementProjectConfig;
  }

  async getAll() {
    const announcementProjectConfig = await this.database
      .getBd()
      .select()
      .from(DB)
      .execute();

    return announcementProjectConfig;
  }
}
