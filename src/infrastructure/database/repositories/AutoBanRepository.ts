import { auto_ban_config as DB } from "../Schema";
import { DatabaseConnection } from "@database/Connection";
import { eq } from "drizzle-orm";
import { inject, injectable } from "tsyringe";

export interface IAutoBanRepository {
  guild_id: string;
  enabled: boolean;
  channel_to_listen: string;
  channel_to_logger?: string;
}
@injectable()
export class AutoBanRepository {
  constructor(
    @inject(DatabaseConnection) private database: DatabaseConnection,
  ) {}

  async setAutoBanConfig({
    channel_to_listen,
    enabled,
    guild_id,
    channel_to_logger,
  }: IAutoBanRepository) {
    const autoBanConfig: typeof DB.$inferInsert = {
      guild_id,
      enabled,
      channel_to_listen,
      channel_to_logger,
    };

    await this.database
      .getBd()
      .insert(DB)
      .values(autoBanConfig)
      .onConflictDoUpdate({
        target: [DB.guild_id],
        set: autoBanConfig,
      })
      .execute();
  }

  async getAutoBanConfig(guild_id: string) {
    const autoBanConfig = await this.database
      .getBd()
      .select()
      .from(DB)
      .where(eq(DB.guild_id, guild_id));

    return autoBanConfig;
  }

  async getAllAutoBanConfig() {
    const autoBanConfig = await this.database
      .getBd()
      .select()
      .from(DB)
      .execute();

    return autoBanConfig;
  }
}
