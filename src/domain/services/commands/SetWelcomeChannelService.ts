import { CommandProps } from "@interfaces/discord/Command";
import { MessageFlags } from "discord.js";
import { ServerEventFlow } from "@database/repositories/ServerEventFlow.repository";
import { container, inject, injectable } from "tsyringe";
import { Logger } from "@logging/Logger";
import { AdminPermissionService } from "@services/AdminPermissionService";

@injectable()
export class SetWelcomeChannelService {
  constructor(
    @inject(AdminPermissionService)
    private adminPermission: AdminPermissionService,
    @inject(Logger) private logger: Logger,
  ) {}
  public async execute({ interaction, options }: CommandProps) {
    if (!interaction.isChatInputCommand()) return;

    const hasPermission = await this.adminPermission.hasPermission(interaction);

    if (!hasPermission) {
      await interaction.reply({
        content: "Voce não tem permissão para executar este comando",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const channelID = options.getChannel("welcome-channel-id", true);

    if (!channelID) {
      return await interaction.reply({
        flags: MessageFlags.Ephemeral,
        content: "O canal de boas-vindas é obrigatório",
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

    try {
      if (!interaction.guild) {
        return await interaction.editReply({
          content: "Um erro ocorreu ao tentar setar o canal de boas-vindas",
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
        content: "O canal de boas-vindas foi setado com sucesso",
      });
      return;
    } catch (err) {
      this.logger.error({
        prefix: "discord-command",
        message: "Erro ao tentar setar o canal de boas-vindas",
        error: err,
      });
      await interaction.editReply({
        content: "Um erro ocorreu ao tentar setar o canal de boas-vindas",
      });
      return;
    }
  }
}
