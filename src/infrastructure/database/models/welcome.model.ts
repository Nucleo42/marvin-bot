import { guildWelcomeChannel } from "../schema";
import { database } from "../../index";
import { eq } from "drizzle-orm";

export interface WelcomeChannel {
  guildID: string;
  channelID: string;
  enabled: boolean;
  rulesChannel?: string;
  presentationChannel?: string;
  leaveAnnouncement?: boolean;
}

export class WelcomeModel {
  async setWelcomeChannel({
    guildID,
    channelID,
    enabled,
    presentationChannel,
    rulesChannel,
    leaveAnnouncement,
  }: WelcomeChannel) {
    const welcomeChannel: typeof guildWelcomeChannel.$inferInsert = {
      guild_id: guildID,
      channel_id: channelID,
      enabled: enabled,
      presentationChannel,
      rulesChannel,
      leaveAnnouncement,
    };

    await database.bd
      .insert(guildWelcomeChannel)
      .values(welcomeChannel)
      .onConflictDoUpdate({
        target: [guildWelcomeChannel.guild_id],
        set: welcomeChannel,
      })
      .execute();
  }

  async getWelcomeChannel(guildID: string) {
    const welcomeChannel = await database.bd
      .select()
      .from(guildWelcomeChannel)
      .where(eq(guildWelcomeChannel.guild_id, guildID));

    return welcomeChannel;
  }
}
