import { server_event_flow as serverFlow } from "../Schema";
import { DatabaseConnection } from "@database/Connection";
import { eq } from "drizzle-orm";
import { inject, injectable } from "tsyringe";

export interface WelcomeChannel {
  guild_id: string;
  channel_id: string;
  enabled: boolean;
  rulesChannel?: string;
  presentationChannel?: string;
  leaveAnnouncement?: boolean;
}
@injectable()
export class ServerEventFlow {
  constructor(
    @inject(DatabaseConnection) private database: DatabaseConnection,
  ) {}

  async setWelcomeChannel({
    guild_id,
    channel_id,
    enabled,
    presentationChannel,
    rulesChannel,
    leaveAnnouncement,
  }: WelcomeChannel) {
    const welcomeChannel: typeof serverFlow.$inferInsert = {
      guild_id: guild_id,
      channel_id: channel_id,
      enabled: enabled,
      presentationChannel,
      rulesChannel,
      leaveAnnouncement,
    };

    await this.database
      .getBd()
      .insert(serverFlow)
      .values(welcomeChannel)
      .onConflictDoUpdate({
        target: [serverFlow.guild_id],
        set: welcomeChannel,
      })
      .execute();
  }

  async getWelcomeChannel(guildID: string) {
    const welcomeChannel = await this.database
      .getBd()
      .select()
      .from(serverFlow)
      .where(eq(serverFlow.guild_id, guildID));

    return welcomeChannel;
  }
}
