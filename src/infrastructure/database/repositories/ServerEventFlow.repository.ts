import { server_event_flow as serverFlow } from "../schema";
import { DatabaseConnection } from "@database/connection";
import { eq } from "drizzle-orm";
import { inject, injectable } from "tsyringe";

export interface WelcomeChannel {
  guildID: string;
  channelID: string;
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
    guildID,
    channelID,
    enabled,
    presentationChannel,
    rulesChannel,
    leaveAnnouncement,
  }: WelcomeChannel) {
    const welcomeChannel: typeof serverFlow.$inferInsert = {
      guild_id: guildID,
      channel_id: channelID,
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
