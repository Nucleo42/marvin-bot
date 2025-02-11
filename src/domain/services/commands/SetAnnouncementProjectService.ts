import { AnnouncementProjectRepository } from "@database/repositories/AnnouncementProjectRepository";
import { CommandProps } from "@interfaces/discord/Command";
import { Logger } from "@logging/Logger";
import { LevelDB } from "@storage/level/Client";
import { inject, injectable } from "tsyringe";
import { IAnnouncementProjectRepository } from "@database/repositories/AnnouncementProjectRepository";
import { AdminPermissionService } from "@services/AdminPermissionService";
import { MessageFlags } from "discord.js";
import { isDev } from "@utils/IsDev";

@injectable()
export class SetAnnouncementProjectService {
  constructor(
    @inject(Logger) private logger: Logger,
    @inject(AnnouncementProjectRepository)
    private db: AnnouncementProjectRepository,
    @inject(LevelDB) private storage: LevelDB,
    @inject(AdminPermissionService)
    private adminPermission: AdminPermissionService,
  ) {}

  public async execute({ interaction, options }: CommandProps) {
    if (!interaction.isChatInputCommand()) return;

    if (!this.adminPermission.hasPermission(interaction)) {
      await interaction.reply({
        content: "Você não tem permissão para executar este comando!",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const guildId = interaction.guildId;

    if (!guildId) {
      await interaction.reply({
        content: "Este comando só pode ser executado em um servidor!",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const isEnabled = options.getBoolean("is-enabled", true);
    const forumThreadToListen = options.getChannel(
      "forum-thread-to-listen",
      true,
    );
    const channelToSend = options.getChannel("channel-to-send", true);

    const data: IAnnouncementProjectRepository = {
      enabled: isEnabled,
      forum_thread_to_listen: forumThreadToListen.id,
      guild_id: guildId,
      channel_to_send: channelToSend.id,
    };

    await this.db.set(data);
    await this.storage.setData("announcement-project", guildId, data);

    await interaction.editReply({
      content: "Configurações salvas com sucesso!",
    });

    if (isDev) {
      this.logger.debug({
        prefix: "discord-core-announcement-project",
        message: "Configurações salvas com sucesso!",
      });
    }
  }
}
