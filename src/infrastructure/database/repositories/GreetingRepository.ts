import { greeting_config as DB } from "../Schema";
import { DatabaseConnection } from "@database/Connection";
import { eq } from "drizzle-orm";
import { inject, injectable } from "tsyringe";

export interface IGreetingRepository {
  guild_id: string;
  enabled: boolean;
  channel_to_send: string;
}
@injectable()
export class GreetingRepository {
  constructor(
    @inject(DatabaseConnection) private database: DatabaseConnection,
  ) {}

  async setGreetingConfig({
    enabled,
    guild_id,
    channel_to_send,
  }: IGreetingRepository) {
    const greetingConfig: typeof DB.$inferInsert = {
      guild_id,
      enabled,
      channel_to_send,
    };

    await this.database
      .getBd()
      .insert(DB)
      .values(greetingConfig)
      .onConflictDoUpdate({
        target: [DB.guild_id],
        set: greetingConfig,
      })
      .execute();
  }

  async getGreetingConfig(guild_id: string) {
    const greetingConfig = await this.database
      .getBd()
      .select()
      .from(DB)
      .where(eq(DB.guild_id, guild_id));

    return greetingConfig;
  }

  async getAllGreetingConfig() {
    const greetingConfig = await this.database
      .getBd()
      .select()
      .from(DB)
      .execute();

    return greetingConfig;
  }
}
