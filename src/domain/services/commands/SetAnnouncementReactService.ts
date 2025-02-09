import { CommandProps } from "@interfaces/discord/Command";
import { IAnnouncementConfig } from "@interfaces/AnnouncementConfig";
import { MessageFlags } from "discord.js";
import { inject, injectable } from "tsyringe";
import { Logger } from "@logging/Logger";
import { LevelDB } from "@storage/level/Client";
import { isDev } from "@utils/IsDev";
import { AdminPermissionService } from "@services/AdminPermissionService";

@injectable()
export class SetAnnouncementReactService {
  constructor(
    @inject(Logger) private logger: Logger,
    @inject(LevelDB) private storage: LevelDB,
    @inject(AdminPermissionService)
    private adminPermission: AdminPermissionService,
  ) {}

  public async execute({ interaction, options }: CommandProps) {
    if (!interaction.isChatInputCommand()) return;
    const hasPermission = await this.adminPermission.hasPermission(interaction);

    if (!hasPermission) {
      await interaction.reply({
        content: "Você não tem permissão para executar este comando.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const isEnabled = options.getBoolean("is-enabled", true);
    const channel = options.getChannel("channel-to-listen", true);
    const reactionEmote = options.getString("reaction-emote", true);

    if (!channel || !reactionEmote || !isEnabled) {
      await interaction.reply({
        content:
          "Você precisa fornecer um canal, um emote e se a saudação está habilitada.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    await interaction.deferReply({
      flags: MessageFlags.Ephemeral,
    });

    const guildId = interaction.guildId;

    if (!guildId) {
      await interaction.editReply({
        content: "Não foi possível encontrar o ID do servidor.",
      });
      return;
    }

    const announcementConfig: IAnnouncementConfig = {
      is_enabled: isEnabled,
      channel_id: channel.id,
      reaction_emote: reactionEmote,
    };

    await this.saveAnnouncementConfig(announcementConfig, guildId);

    await interaction.editReply({
      content: "Configuração de anúncio salva com sucesso!",
    });
  }

  private async saveAnnouncementConfig(
    data: IAnnouncementConfig,
    guildId: string,
  ) {
    await this.storage.setData("announcement-react", guildId, data);

    if (isDev) {
      this.logger.debug({
        prefix: "discord-core-set-announcement-react",
        message: "Configuração de anúncio salva com sucesso!",
      });
    }
  }
}
