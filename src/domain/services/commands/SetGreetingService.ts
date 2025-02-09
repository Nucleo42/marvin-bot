import { CommandProps } from "@interfaces/discord/Command";
import { Logger } from "@logging/Logger";
import {
  CategoryChannel,
  NewsChannel,
  StageChannel,
  TextChannel,
  PublicThreadChannel,
  PrivateThreadChannel,
  MessageFlags,
} from "discord.js";
import { injectable, inject } from "tsyringe";
import { GreetingRepository } from "@database/repositories/GreetingRepository";
import { isDev } from "@utils/IsDev";
import { LevelDB } from "@storage/level/Client";
import { AdminPermissionService } from "@services/AdminPermissionService";

type AllowedChannel =
  | CategoryChannel
  | NewsChannel
  | StageChannel
  | TextChannel
  | PublicThreadChannel
  | PrivateThreadChannel;

@injectable()
export class SetGreetingService {
  private isEnabled: boolean;
  private channelToSend: AllowedChannel;
  private guildId: string;

  constructor(
    @inject(Logger) private logger: Logger,
    @inject(GreetingRepository) private db: GreetingRepository,
    @inject(LevelDB) private storage: LevelDB,
    @inject(AdminPermissionService)
    private adminPermission: AdminPermissionService,
  ) {}

  public async execute({ interaction, options }: CommandProps) {
    if (!interaction.isChatInputCommand()) return;

    const isAdministrator = this.adminPermission.hasPermission(interaction);

    if (!isAdministrator) {
      return await interaction.reply({
        content: "Você não tem permissão para executar este comando!",
        flags: MessageFlags.Ephemeral,
      });
    }

    this.isEnabled = options.getBoolean("is-enabled", true);
    this.channelToSend = options.getChannel(
      "channel-to-send",
      true,
    ) as AllowedChannel;

    if (!interaction.guild) return;

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    this.guildId = interaction.guild.id;

    await this.salveConfigurations();

    if (isDev) {
      this.logger.info({
        prefix: "command-set-greeting",
        message: "Configurações salvas com sucesso!",
      });
    }

    return await interaction.editReply({
      content: "As configurações foram salvas com sucesso!",
    });
  }

  private async salveConfigurations() {
    const { isEnabled, channelToSend, guildId } = this;

    await this.db.setGreetingConfig({
      channel_to_send: channelToSend.id,
      enabled: isEnabled,
      guild_id: guildId,
    });

    await this.storage.setData("greeting-config", guildId, {
      channel_to_send: channelToSend.id,
      enabled: isEnabled,
    });
  }
}
