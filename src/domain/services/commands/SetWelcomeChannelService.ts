import { CommandProps } from "@interfaces/discord/Command";
import { MessageFlags } from "discord.js";
import { ServerEventFlow } from "@database/repositories/ServerEventFlow.repository";
import { container } from "tsyringe";
import { Logger } from "@logging/Logger";

export class SetWelcomeChannelService {
  public async execute({ interaction, options }: CommandProps) {
    if (!interaction.isChatInputCommand()) return;

    if (!interaction.memberPermissions?.has("Administrator")) return;

    const channelID = options.getChannel("welcome-channel-id", true);

    if (!channelID) {
      return await interaction.reply({
        flags: MessageFlags.Ephemeral,
        content: "Invalid channel ID",
      });
    }

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const rulesChannelID = options.getChannel("rule-channel-id", false);
    const presentationChannelID = options.getChannel(
      "submission-channel-id",
      false,
    );
    const enableChannel = options.getBoolean("enable-or-disable", false);
    const leaveAnnouncement = options.getBoolean("leave-announcement", false);

    const logger = container.resolve(Logger);

    try {
      if (!interaction.guild) {
        return await interaction.editReply({
          content: "An error occurred while setting the welcome channel",
        });
      }

      const database = container.resolve(ServerEventFlow);
      await database.setWelcomeChannel({
        guild_id: interaction.guild?.id,
        channel_id: channelID.id,
        enabled: enableChannel !== null ? enableChannel : true,
        rulesChannel: rulesChannelID?.id,
        presentationChannel: presentationChannelID?.id,
        leaveAnnouncement:
          leaveAnnouncement !== null ? leaveAnnouncement : false,
      });

      await interaction.editReply({
        content: "Welcome channel set!",
      });
      return;
    } catch (err) {
      logger.error({
        prefix: "discord-command",
        message: "Erro ao tentar setar o canal de boas-vindas",
        error: err,
      });
      await interaction.editReply({
        content: "An error occurred while setting the welcome channel",
      });
      return;
    }
  }
}
